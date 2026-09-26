(function () {
  'use strict';
  var btn;
  function isOn() { return document.body.classList.contains('focus-mode'); }
  function config() { return Books.personalization ? Books.personalization.focusConfig() : { background: 'solid', hideDock: true, hideToc: true, scale: 1.08, width: 'comfortable' }; }
  function set(on, remember) {
    var cfg = config();
    document.body.classList.toggle('focus-mode', on);
    document.body.dataset.focusBg = on ? cfg.background : 'keep';
    document.body.style.setProperty('--focus-scale', String(cfg.scale || 1));
    document.body.dataset.focusWidth = cfg.width || 'comfortable';
    document.body.dataset.focusHideDock = on && cfg.hideDock ? 'true' : 'false';
    document.body.dataset.focusHideToc = on && cfg.hideToc ? 'true' : 'false';
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = btn.querySelector('.dock__label');
      if (label) label.textContent = on ? 'sair do foco' : 'modo foco';
    }
    if (remember !== false) Books.store.write(Books.store.keys.focus, on);
  }
  function isEditable(node) { return node && (/^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName) || node.isContentEditable); }
  function combo(event, expected) {
    var parts = expected.split('+');
    var key = parts.pop();
    return parts.indexOf('Alt') > -1 === event.altKey && parts.indexOf('Ctrl') > -1 === event.ctrlKey && parts.indexOf('Shift') > -1 === event.shiftKey && String(event.key).toLowerCase() === key.toLowerCase();
  }
  function init() {
    btn = document.getElementById('focusToggle');
    btn.addEventListener('click', function () { set(!isOn()); });
    document.addEventListener('keydown', function (e) {
      if (isEditable(e.target) || e.ctrlKey || e.metaKey) return;
      var keys = Books.personalization.keybindConfig();
      if (combo(e, keys.focus)) { e.preventDefault(); set(!isOn()); return; }
      if (e.key === 'Escape' && isOn() && !document.body.classList.contains('overlay-open')) set(false);
    });
    Books.events.on('settings:changed', function () { if (isOn()) set(true, false); });
  }
  function preferred() { return !!Books.store.read(Books.store.keys.focus, false); }
  Books.focus = { init: init, set: set, isOn: isOn, preferred: preferred };
})();
