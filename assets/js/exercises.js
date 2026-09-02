/* ==========================================================================
   exercises.js — the fill-in-the-blank lab runner.

   Each <section data-lab="unique-id"> carries:
       template[data-lab-html]      the fixed markup students style
       template[data-lab-start]     starter CSS, with TODOs to fill in
       template[data-lab-solution]  one correct answer
       script[data-lab-checks]      a JSON array of checks (see README)

   Preview updates as you type. Checks only run when you ask for them —
   a checklist that goes red on every keystroke teaches nothing but anxiety.
   ========================================================================== */
(function () {
  'use strict';

  var STORE_PREFIX = 'css-course:lab:';

  function load(id) {
    try { return localStorage.getItem(STORE_PREFIX + id); } catch (e) { return null; }
  }
  function save(id, value) {
    try { localStorage.setItem(STORE_PREFIX + id, value); } catch (e) { /* private mode */ }
  }
  function clear(id) {
    try { localStorage.removeItem(STORE_PREFIX + id); } catch (e) { /* ignore */ }
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init(root) {
    var id       = root.dataset.lab;
    var html     = Sandbox.templateText(root, 'template[data-lab-html]');
    var starter  = Sandbox.templateText(root, 'template[data-lab-start]');
    var solution = Sandbox.templateText(root, 'template[data-lab-solution]');

    var checksEl = root.querySelector('script[data-lab-checks]');
    var checks = [];
    try { checks = checksEl ? JSON.parse(checksEl.textContent) : []; }
    catch (e) { console.error('Lab "' + id + '" has malformed checks JSON', e); }

    var mount = root.querySelector('[data-lab-mount]');
    if (!mount) return;

    mount.innerHTML =
      '<div class="lab__body">' +
        '<div class="lab__pane">' +
          '<label class="visually-hidden" for="ed-' + id + '">CSS editor</label>' +
          '<textarea class="lab__editor" id="ed-' + id + '" spellcheck="false" ' +
            'autocapitalize="off" autocorrect="off"></textarea>' +
        '</div>' +
        '<div class="lab__pane">' +
          '<iframe class="lab__preview"></iframe>' +
        '</div>' +
      '</div>' +
      '<div class="lab__bar">' +
        '<button class="btn" data-act="check">Check my work</button>' +
        '<button class="btn btn--ghost" data-act="reset">Reset</button>' +
        '<span class="spacer"></span>' +
        '<span class="dim mono" data-saved>saved locally</span>' +
      '</div>' +
      '<div class="lab__results">' +
        '<p class="scoreline" data-state="idle" data-score>Not checked yet</p>' +
        '<ul class="checks" data-checklist></ul>' +
        '<details class="solution"><summary>Reveal one working answer</summary>' +
          '<pre class="code">' + esc(solution) + '</pre></details>' +
      '</div>';

    var editor    = mount.querySelector('textarea');
    var preview   = mount.querySelector('iframe');
    var scoreEl   = mount.querySelector('[data-score]');
    var listEl    = mount.querySelector('[data-checklist]');
    var savedEl   = mount.querySelector('[data-saved]');

    editor.value = load(id) || starter;

    /* Seed the checklist in its unanswered state so students can read the
       goals before writing a line. */
    function paint(results) {
      listEl.innerHTML = checks.map(function (c, i) {
        var r = results && results[i];
        var cls = !r ? '' : (r.ok ? 'pass' : 'fail');
        var why = (r && !r.ok && r.why) ? '<span class="why">' + esc(r.why) + '</span>' : '';
        return '<li class="' + cls + '"><span>' + esc(c.label) + why + '</span></li>';
      }).join('');
    }
    paint(null);

    /* Re-mounting with unchanged CSS is a no-op, so this is safe to call
       often. Checks are a separate message — see sandbox.js. */
    function render() {
      Sandbox.mount(preview, {
        css: editor.value,
        html: html,
        title: 'Exercise preview',
        onChecks: function (results) {
          var passed = results.filter(function (r) { return r.ok; }).length;
          paint(results);
          scoreEl.dataset.state = (passed === results.length) ? 'pass' : 'fail';
          scoreEl.textContent = (passed === results.length)
            ? '✔ All ' + results.length + ' checks passed'
            : passed + ' of ' + results.length + ' checks passing';
        }
      });
    }

    /* Debounce: wait for a pause in typing before re-rendering, so we are not
       rebuilding the whole document on every single keypress. */
    var timer;
    editor.addEventListener('input', function () {
      clearTimeout(timer);
      savedEl.textContent = 'typing…';
      timer = setTimeout(function () {
        save(id, editor.value);
        savedEl.textContent = 'saved locally';
        render();
      }, 300);
    });

    /* A Tab key in a code textarea should indent, not jump to the next
       control. We restore an escape hatch: Escape then Tab still moves on. */
    var escaped = false;
    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { escaped = true; return; }
      if (e.key !== 'Tab' || escaped) { escaped = false; return; }
      e.preventDefault();
      var s = editor.selectionStart, en = editor.selectionEnd;
      editor.value = editor.value.slice(0, s) + '  ' + editor.value.slice(en);
      editor.selectionStart = editor.selectionEnd = s + 2;
      editor.dispatchEvent(new Event('input'));
    });

    mount.querySelector('.lab__bar').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-act]');
      if (!btn) return;
      if (btn.dataset.act === 'check') {
        /* Flush any pending debounced render first, so we grade what is in
           the editor right now rather than what was there 300ms ago. */
        clearTimeout(timer);
        save(id, editor.value);
        savedEl.textContent = 'saved locally';
        render();
        Sandbox.check(preview, checks);
      }
      if (btn.dataset.act === 'reset') {
        if (!confirm('Reset this exercise back to the starter code?')) return;
        clear(id);
        editor.value = starter;
        scoreEl.dataset.state = 'idle';
        scoreEl.textContent = 'Not checked yet';
        paint(null);
        render();
      }
    });

    render();
  }

  document.querySelectorAll('[data-lab]').forEach(init);
})();
