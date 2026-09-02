/* ==========================================================================
   sandbox.js — shared iframe sandbox used by code-review.html and
   exercises.html.

   Why an iframe?  Student CSS has to be able to do anything — including
   writing `* { display:none }` — without taking the surrounding lesson page
   down with it. A `srcdoc` iframe with sandbox="allow-scripts" gives us a
   throwaway document with its own cascade and its own opaque origin.

   How the checks get in:  the sandbox announces itself with a "ready" message
   once loaded, and the parent then posts it a list of checks to evaluate.
   Checks are NOT baked into the document — that would mean reloading the
   iframe every time a student presses "Check my work", and a reload requested
   while a previous one is still in flight gets dropped by the browser.

   Deliberately written as a CLASSIC script (no `import`/`export`): ES modules
   are blocked by CORS on file:// URLs, and students open these pages by
   double-clicking them.
   ========================================================================== */
(function (global) {
  'use strict';

  var uid = 0;

  /* Per-iframe bookkeeping, keyed by the id we stamp on the element. */
  var frames = {};

  /* Styles injected into every sandbox so demos share a neutral starting
     point. Kept intentionally plain — the lesson CSS should be what stands out. */
  /* Deliberately does NOT set `box-sizing: border-box`. Lab 01 is about the
     student writing that reset themselves — if the sandbox provided it, the
     check would pass before they typed anything. */
  var SANDBOX_BASE = [
    'body{margin:0;padding:20px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;',
    'line-height:1.5;color:#1c1f26;background:#ffffff}',
    'h1,h2,h3,h4,p{margin:0 0 .5em}',
    'img{max-width:100%;display:block}'
  ].join('');

  /* Prevent a stray "</style>" or "</script>" in author/student text from
     terminating the tag we are writing it into. */
  function safeForTag(text, tag) {
    return String(text == null ? '' : text)
      .replace(new RegExp('</' + tag, 'gi'), '<\\/' + tag);
  }

  /* Runs INSIDE the sandbox: reports its content height, answers "runChecks"
     messages, and evaluates each check against the live computed styles.
     Written as a string because it is serialized into the srcdoc. */
  function runtimeScript(id) {
    return [
      '(function(){',
      '  var ID=' + JSON.stringify(id) + ';',
      '  function send(msg){ msg.sandboxId=ID; parent.postMessage(msg,"*"); }',

      /* ---- auto-height ------------------------------------------------- */
      '  function height(){',
      '    var d=document.documentElement, b=document.body;',
      '    return Math.max(b.scrollHeight, b.offsetHeight, d.scrollHeight)+2;',
      '  }',
      '  function report(){ send({type:"height", value:height()}); }',
      '  if (window.ResizeObserver) new ResizeObserver(report).observe(document.body);',
      '  window.addEventListener("load", report);',
      '  setTimeout(report, 60); setTimeout(report, 400);',

      /* ---- check runner ------------------------------------------------ */
      /* Computed values always come back normalized by the browser
         ("#f00" becomes "rgb(255, 0, 0)"), so we normalize the EXPECTED
         value the same way: hand it to the browser and read it back. */
      '  var probe=null;',
      '  var PROBE_CSS="position:absolute;left:-9999px;width:100px;height:100px;border-style:solid";',
      '  function normalize(v){',
      '    return String(v).trim().toLowerCase().replace(/\\s+/g," ").replace(/, /g,",");',
      '  }',
      '  function asComputed(prop, value){',
      '    if(!probe){ probe=document.createElement("div"); document.body.appendChild(probe); }',
      /* border-style is on the probe because border-width computes to 0
         without it — a classic way to write a check that can never pass. */
      '    probe.style.cssText=PROBE_CSS;',
      '    try { probe.style.setProperty(prop, value); } catch(e){}',
      '    var out=getComputedStyle(probe).getPropertyValue(prop);',
      '    return normalize(out || value);',
      '  }',
      '  function numberOf(v){ var m=String(v).match(/-?[\\d.]+/); return m?parseFloat(m[0]):NaN; }',

      '  function runOne(t){',
      '    var el = t.selector ? document.querySelector(t.selector) : document.body;',
      '    if(!el) return { ok:false, why:"No element matches " + t.selector };',
      '    if(t.exists) return { ok:true };',
      '    if(t.count != null){',
      '      var n=document.querySelectorAll(t.selector).length;',
      '      return n===t.count ? {ok:true} : {ok:false, why:"found "+n+", expected "+t.count};',
      '    }',
      '    var actualRaw = getComputedStyle(el, t.pseudo || null).getPropertyValue(t.prop);',
      '    var actual = normalize(actualRaw);',
      '    if(t.equals){',
      '      var want = [].concat(t.equals).map(function(v){ return asComputed(t.prop, v); });',
      '      if(want.indexOf(actual) === -1)',
      '        return { ok:false, why:t.prop+" is "+actual+", expected "+want.join(" or ") };',
      '      return { ok:true };',
      '    }',
      '    if(t.notEquals){',
      '      var bad = [].concat(t.notEquals).map(function(v){ return asComputed(t.prop, v); });',
      '      return bad.indexOf(actual) === -1 ? {ok:true}',
      '        : { ok:false, why:t.prop+" is still "+actual };',
      '    }',
      '    if(t.contains){',
      '      return actual.indexOf(normalize(t.contains)) !== -1 ? {ok:true}',
      '        : { ok:false, why:t.prop+" is "+actual+", expected it to contain "+t.contains };',
      '    }',
      '    if(t.min != null || t.max != null){',
      /* A measurement taken in a preview with no width is meaningless. Say so
         rather than reporting "0px, expected at least 90" at a student who
         wrote the right answer. */
      '      if(document.documentElement.clientWidth < 50)',
      '        return {ok:false, why:"the preview has no width to measure right now \u2014 widen the window, then press Check again"};',
      '      var n2 = numberOf(actualRaw);',
      '      if(isNaN(n2)) return {ok:false, why:t.prop+" is not a number ("+actual+")"};',
      '      if(t.min != null && n2 < t.min) return {ok:false, why:t.prop+" is "+actual+", expected at least "+t.min};',
      '      if(t.max != null && n2 > t.max) return {ok:false, why:t.prop+" is "+actual+", expected at most "+t.max};',
      '      return {ok:true};',
      '    }',
      '    return { ok:false, why:"Malformed check" };',
      '  }',

      '  function runAll(tests){',
      '    var results = (tests||[]).map(function(t){',
      '      var r; try { r = runOne(t); } catch(e){ r = {ok:false, why:String(e.message)}; }',
      '      return { label:t.label, ok:r.ok, why:r.why };',
      '    });',
      '    send({ type:"checks", results:results });',
      '  }',

      '  window.addEventListener("message", function(e){',
      '    var d=e.data;',
      '    if(d && d.type==="runChecks"){ setTimeout(function(){ runAll(d.checks); }, 30); }',
      '  });',

      /* Tell the parent we exist. Everything it wants to ask us waits on this. */
      '  send({ type:"ready" });',
      '})();'
    ].join('\n');
  }

  /* Build the full document string for a sandbox iframe. */
  function buildSrcdoc(opts) {
    return [
      '<!doctype html><html lang="en"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      opts.head || '',
      '<style>', SANDBOX_BASE, '</style>',
      '<style>', safeForTag(opts.css, 'style'), '</style>',
      '</head><body>',
      safeForTag(opts.html, 'script'),
      '<script>', runtimeScript(opts.id), '<\/script>',
      '</body></html>'
    ].join('');
  }

  /* Create or refresh a sandboxed iframe.
     Re-mounting with identical content is a no-op, so typing a character and
     changing nothing does not throw away a loaded document. */
  function mount(iframe, opts) {
    var id = iframe.dataset.sandboxId || ('sbx-' + (++uid));
    iframe.dataset.sandboxId = id;
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('title', opts.title || 'Live preview');

    var doc = buildSrcdoc({
      id: id, css: opts.css, html: opts.html, head: opts.head
    });

    var rec = frames[id] || (frames[id] = { el: iframe, ready: false, pending: null });
    rec.el = iframe;
    rec.onChecks = opts.onChecks || rec.onChecks;
    rec.autoHeight = !!opts.autoHeight;

    if (rec.doc !== doc) {
      rec.doc = doc;
      rec.ready = false;
      iframe.srcdoc = doc;
    }
    return id;
  }

  /* Ask a mounted sandbox to evaluate a list of checks. If its document is
     still loading, the request waits for the "ready" message rather than
     forcing a second navigation. */
  function check(iframe, checks) {
    var id = iframe.dataset.sandboxId;
    var rec = frames[id];
    if (!rec) return;
    if (rec.ready && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'runChecks', checks: checks }, '*');
    } else {
      rec.pending = checks;
    }
  }

  global.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.sandboxId) return;
    var rec = frames[d.sandboxId];
    if (!rec) return;

    if (d.type === 'ready') {
      rec.ready = true;
      if (rec.pending) {
        var queued = rec.pending;
        rec.pending = null;
        if (rec.el.contentWindow) {
          rec.el.contentWindow.postMessage({ type: 'runChecks', checks: queued }, '*');
        }
      }
    }
    if (d.type === 'height' && rec.autoHeight) {
      rec.el.style.height = Math.min(Math.max(d.value, 140), 900) + 'px';
    }
    if (d.type === 'checks' && rec.onChecks) {
      rec.onChecks(d.results);
    }
  });

  /* Read the text out of a <template>. Templates are inert, so we can park
     raw CSS and HTML in the page without the browser trying to run it. */
  function templateText(root, selector) {
    var t = root.querySelector(selector);
    if (!t) return '';
    /* textContent for CSS (it is only text nodes); innerHTML for markup. */
    var isMarkup = /html/i.test(selector);
    var raw = isMarkup ? t.innerHTML : t.content.textContent;
    return dedent(raw);
  }

  /* Strip the shared leading indentation that comes from nesting the
     template inside the page's markup. */
  function dedent(text) {
    var lines = String(text).replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var indent = lines.reduce(function (min, l) {
      if (!l.trim()) return min;
      return Math.min(min, l.match(/^ */)[0].length);
    }, Infinity);
    if (!isFinite(indent)) indent = 0;
    return lines.map(function (l) { return l.slice(indent); }).join('\n');
  }

  global.Sandbox = {
    mount: mount,
    check: check,
    buildSrcdoc: buildSrcdoc,
    templateText: templateText,
    dedent: dedent
  };
})(window);
