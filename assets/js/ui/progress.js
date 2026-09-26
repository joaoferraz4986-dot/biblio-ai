(function () {
  'use strict';
  var state = {};
  var restoring = false;
  var K = Books.store.keys;
  var DEFAULTS = { percent: 0, top: 0, section: '', sectionTitle: '', finished: false };

  function init(fileProgress) {
    var base = (fileProgress && fileProgress.progress) || {};
    var local = Books.store.read(K.progress, null) || Books.store.read(K.legacyProgress, {}) || {};
    state = Object.assign({}, base, local);
  }
  function get(id) { return Object.assign({}, DEFAULTS, state[id]); }
  function all() { return state; }
  var persist = Books.util.debounce(function () { Books.store.write(K.progress, state); Books.events.emit('progress:changed'); }, 200);

  function currentSectionTitle() {
    var link = document.querySelector('#tocList a[aria-current="true"]');
    return link ? link.textContent : '';
  }

  function record() {
    var pkg = Books.state.pkg;
    if (!pkg || restoring || document.body.classList.contains('overlay-open')) return;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var y = window.scrollY;
    var percent = Math.max(0, Math.min(100, Math.round((y / max) * 100)));
    state[pkg.manifest.id] = Object.assign({}, DEFAULTS, state[pkg.manifest.id], {
      percent: percent, top: Math.round(y),
      section: Books.nav ? Books.nav.currentId() : '',
      sectionTitle: currentSectionTitle(),
      finished: percent >= 99,
      updatedAt: Date.now()
    });
    persist();
  }
  function setRestoring(v) { restoring = v; }
  function reset(id) { delete state[id]; persist(); }
  function resetAll() { state = {}; persist(); }
  function touch(id) {
    if (!id) return;
    var existing = state[id];
    state[id] = Object.assign({}, DEFAULTS, existing, {
      opened: Date.now(),
      firstOpenedAt: (existing && existing.firstOpenedAt) || Date.now(),
      updatedAt: Date.now()
    });
    persist();
  }
  function isNew(id) { return !state[id] || !state[id].firstOpenedAt; }

  window.addEventListener('scroll', Books.util.debounce(record, 120), { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { record(); persist.flush(); Books.store.write(K.progress, state); } });

  Books.progress = { init: init, get: get, all: all, record: record, setRestoring: setRestoring, reset: reset, resetAll: resetAll, touch: touch, isNew: isNew };
})();
