/* ==========================================================================
   compare.js — the code-review widget.

   Each <article data-compare> in the page carries three <template>s:
       [data-html]        the markup, identical in both versions
       [data-css-before]  the CSS as we first wrote it
       [data-css-after]   the CSS after the review

   This script renders both versions live, and computes a real line diff
   between the two stylesheets so the class can see exactly what moved.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- utilities */

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Longest Common Subsequence over lines. The classic diff algorithm:
     build a table of match lengths, then walk it backwards to recover which
     lines were kept, added, or removed. Stylesheets here are small, so the
     O(n x m) table costs nothing. */
  function diffLines(a, b) {
    var n = a.length, m = b.length, i, j;
    var table = [];
    for (i = 0; i <= n; i++) table.push(new Array(m + 1).fill(0));
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        table[i][j] = a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
    var out = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push({ t: 'ctx', text: a[i] }); i++; j++; }
      else if (table[i + 1][j] >= table[i][j + 1]) { out.push({ t: 'del', text: a[i] }); i++; }
      else { out.push({ t: 'add', text: b[j] }); j++; }
    }
    while (i < n) { out.push({ t: 'del', text: a[i++] }); }
    while (j < m) { out.push({ t: 'add', text: b[j++] }); }
    return out;
  }

  /* Collapse long stretches of unchanged lines so the interesting parts stay
     on screen — the same thing `git diff` does with its context window. */
  function collapse(rows, context) {
    var keep = new Array(rows.length).fill(false);
    rows.forEach(function (r, idx) {
      if (r.t === 'ctx') return;
      for (var k = idx - context; k <= idx + context; k++) {
        if (k >= 0 && k < rows.length) keep[k] = true;
      }
    });
    var out = [];
    var skipping = false;
    rows.forEach(function (r, idx) {
      if (keep[idx]) { out.push(r); skipping = false; }
      else if (!skipping) { out.push({ t: 'gap', text: '⋯' }); skipping = true; }
    });
    return out;
  }

  function renderDiff(rows) {
    var mark = { add: '+', del: '-', ctx: ' ', gap: ' ' };
    return rows.map(function (r) {
      var cls = r.t === 'gap' ? 'ctx' : r.t;
      return '<span class="line ' + cls + '" data-mark="' + mark[r.t] + '">' +
             esc(r.text || ' ') + '</span>';
    }).join('');
  }

  function renderPlain(text) {
    return text.split('\n').map(function (l) {
      return '<span class="line ctx" data-mark=" ">' + esc(l || ' ') + '</span>';
    }).join('');
  }

  /* ----------------------------------------------------------------- setup */

  function init(root) {
    var html   = Sandbox.templateText(root, 'template[data-html]');
    var before = Sandbox.templateText(root, 'template[data-css-before]');
    var after  = Sandbox.templateText(root, 'template[data-css-after]');
    var head   = Sandbox.templateText(root, 'template[data-head-html]');

    var stage = root.querySelector('[data-stage]');
    var code  = root.querySelector('[data-code]');
    var seg   = root.querySelector('[data-seg]');
    if (!stage || !code) return;

    stage.innerHTML =
      '<div class="frame frame--before" data-pane="before">' +
        '<div class="frame__label">Before</div><iframe></iframe></div>' +
      '<div class="frame frame--after" data-pane="after">' +
        '<div class="frame__label">After</div><iframe></iframe></div>';

    var panes = {
      before: stage.querySelector('[data-pane="before"]'),
      after:  stage.querySelector('[data-pane="after"]')
    };

    Sandbox.mount(panes.before.querySelector('iframe'),
      { css: before, html: html, head: head, autoHeight: true, title: 'Before' });
    Sandbox.mount(panes.after.querySelector('iframe'),
      { css: after, html: html, head: head, autoHeight: true, title: 'After' });

    var diffRows = collapse(diffLines(before.split('\n'), after.split('\n')), 3);

    function show(view) {
      stage.dataset.view = (view === 'diff') ? 'split' : 'single';
      panes.before.hidden = (view === 'after');
      panes.after.hidden  = (view === 'before');

      code.innerHTML = '<pre class="diff">' + (
        view === 'diff'   ? renderDiff(diffRows) :
        view === 'before' ? renderPlain(before)  :
                            renderPlain(after)
      ) + '</pre>';

      if (seg) {
        seg.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-selected', String(b.dataset.view === view));
        });
      }
    }

    if (seg) {
      seg.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-view]');
        if (btn) show(btn.dataset.view);
      });
    }

    show(root.dataset.compare || 'diff');
  }

  document.querySelectorAll('[data-compare]').forEach(init);
})();
