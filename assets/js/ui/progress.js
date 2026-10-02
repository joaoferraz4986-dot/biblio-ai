(function () {
  'use strict';
  var state = {};
  var restoring = false;
  var K = Books.store.keys;
  var DEFAULTS = { percent: 0, top: 0, section: '', sectionTitle: '', finished: false, pinned: false, later: false, completed: false };
  // Marcações da biblioteca: vivem na mesma entrada do progresso, então viajam com ele
  // (localStorage + content/progress.json + bundle + ZIP). Cada uma guarda quando foi ligada.
  var FLAGS = { pinned: 'pinnedAt', later: 'laterAt', completed: 'completedAt' };
  var DONE_AT = 99; // a rolagem raramente chega a 100% exatos

  function init(fileProgress) {
    var base = (fileProgress && fileProgress.progress) || {};
    var local = Books.store.read(K.progress, null) || Books.store.read(K.legacyProgress, {}) || {};
    state = Object.assign({}, base, local);
  }
  function get(id) {
    var p = Object.assign({}, DEFAULTS, state[id]);
    // progresso salvo antes de "completed" existir: quem já tinha terminado continua concluído
    if (state[id] && state[id].completed === undefined && p.finished) p.completed = true;
    return p;
  }
  function all() { return state; }
  var persist = Books.util.debounce(function () { Books.store.write(K.progress, state); Books.events.emit('progress:changed'); }, 200);
  function persistNow() { persist.flush(); Books.store.write(K.progress, state); Books.events.emit('progress:changed'); }

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
    var id = pkg.manifest.id;
    var before = get(id);
    var next = Object.assign({}, DEFAULTS, state[id], {
      percent: percent, top: Math.round(y),
      section: Books.nav ? Books.nav.currentId() : '',
      sectionTitle: currentSectionTitle(),
      finished: percent >= DONE_AT,
      completed: before.completed,
      updatedAt: Date.now()
    });
    // conclui sozinho só ao CRUZAR o fim: quem desmarcou manualmente não é remarcado a cada rolagem
    if (!before.completed && before.percent < DONE_AT && percent >= DONE_AT) {
      next.completed = true; next.completedAt = Date.now(); next.later = false;
    }
    state[id] = next;
    persist();
  }
  function setRestoring(v) { restoring = v; }

  function toggle(id, flag) {
    if (!id || !FLAGS[flag]) return false;
    var on = !get(id)[flag];
    var patch = { updatedAt: Date.now() };
    patch[flag] = on;
    patch[FLAGS[flag]] = on ? Date.now() : null;
    if (flag === 'completed' && on) patch.later = false; // livro terminado sai de "ler depois"
    state[id] = Object.assign({}, DEFAULTS, state[id], patch);
    persistNow();
    return on;
  }

  // Reiniciar zera a leitura (o livro volta a ser "novo"), mas fixado e "ler depois" são
  // escolhas sobre o livro, não sobre a leitura — continuam valendo.
  function keptAfterReset(id) {
    var p = state[id] || {}, kept = null;
    ['pinned', 'later'].forEach(function (flag) {
      if (!p[flag]) return;
      kept = kept || {};
      kept[flag] = true;
      kept[FLAGS[flag]] = p[FLAGS[flag]] || Date.now();
    });
    return kept;
  }
  function reset(id) {
    var kept = keptAfterReset(id);
    if (kept) state[id] = kept; else delete state[id];
    persist();
  }
  function resetAll() {
    var next = {};
    Object.keys(state).forEach(function (id) {
      var kept = keptAfterReset(id);
      if (kept) next[id] = kept;
    });
    state = next;
    persist();
  }
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

  Books.progress = { init: init, get: get, all: all, record: record, setRestoring: setRestoring, reset: reset, resetAll: resetAll, touch: touch, isNew: isNew, toggle: toggle };
})();
