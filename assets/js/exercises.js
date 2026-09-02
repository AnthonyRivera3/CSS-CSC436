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

    /* ------------------------------------------------------------------ */
    /* Tab handling.                                                        */
    /*                                                                      */
    /* Writing to `editor.value` would be the obvious implementation and is */
    /* the wrong one: assigning to it WIPES the browser's native undo       */
    /* history for the field, so Ctrl+Z can no longer rescue the student.   */
    /* `execCommand('insertText')` is deprecated but is still the only way  */
    /* to edit a textarea as if the user typed it, undo stack intact.       */
    /* ------------------------------------------------------------------ */
    var INDENT = '  ';

    function replaceRange(start, end, text, selStart, selEnd) {
      editor.selectionStart = start;
      editor.selectionEnd = end;
      var inserted = false;
      try { inserted = document.execCommand('insertText', false, text); }
      catch (err) { inserted = false; }
      if (!inserted) {
        /* Fallback for anything that refuses execCommand. Loses undo, but
           losing undo beats losing the keystroke entirely. */
        editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
        editor.dispatchEvent(new Event('input'));
      }
      editor.selectionStart = selStart;
      editor.selectionEnd = selEnd;
    }

    var escaped = false;
    editor.addEventListener('keydown', function (e) {
      /* Escape then Tab moves to the next control, so the editor is not a
         keyboard trap for anyone navigating without a mouse. */
      if (e.key === 'Escape') { escaped = true; return; }
      if (e.key !== 'Tab') { escaped = false; return; }
      if (escaped) { escaped = false; return; }

      e.preventDefault();

      var v = editor.value;
      var s = editor.selectionStart, en = editor.selectionEnd;
      var spansLines = v.slice(s, en).indexOf('\n') !== -1;

      /* Plain Tab with a caret (or a selection inside one line): insert an
         indent. This is the only case where replacing the selection is what
         the student meant. */
      if (!spansLines && !e.shiftKey) {
        replaceRange(s, en, INDENT, s + INDENT.length, s + INDENT.length);
        return;
      }

      /* Otherwise operate on whole lines, the way every code editor does.
         Crucially this INDENTS a multi-line selection rather than replacing
         it — the old behaviour deleted everything the student had selected. */
      var start = v.lastIndexOf('\n', s - 1) + 1;
      var end = v.indexOf('\n', en);
      if (end === -1) end = v.length;

      var block = v.slice(start, end);
      var out = e.shiftKey
        ? block.replace(/^[ \t]{1,2}/gm, '')   /* outdent */
        : block.replace(/^(?!$)/gm, INDENT);   /* indent, skipping blank lines */

      if (out === block) return;
      replaceRange(start, end, out, start, start + out.length);
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
