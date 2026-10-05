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
  // Tempo de leitura (alimenta o painel): só conta com o livro na tela, a janela em foco e
  // alguma atividade recente — deixar o app aberto e sair não soma.
  var TICK = 5;            // segundos somados a cada medição
  var IDLE_MS = 60000;     // sem rolar/teclar/mexer o mouse por 1 min = não está lendo
  var SECTION_READ = 30;   // segundos numa seção para ela contar como lida
  var KEEP_DAYS = 400;     // histórico diário guardado por livro
  var lastActivity = 0;
  var dwell = {};          // segundos por seção nesta sessão (não é salvo)

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

  function dayKey(date) {
    var d = date || new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function currentChapter() {
    var id = Books.nav ? Books.nav.currentId() : '';
    var el = id && document.getElementById(id);
    var chapter = el && el.closest ? el.closest('.chapter') : null;
    return chapter ? chapter.id : '';
  }
  function isReading() {
    return !!Books.state.pkg && !document.hidden && document.hasFocus() &&
      !document.body.classList.contains('overlay-open') && Date.now() - lastActivity <= IDLE_MS;
  }
  // Soma TICK segundos ao dia de hoje em state[id].time ({ 'AAAA-MM-DD': segundos }) e marca
  // em state[id].sections ({ idDaSecao: dia }) a seção em que o leitor já ficou tempo suficiente.
  function tick() {
    if (!isReading()) return;
    var pkg = Books.state.pkg, id = pkg.manifest.id, today = dayKey();
    var entry = Object.assign({}, DEFAULTS, state[id]);
    var time = Object.assign({}, entry.time);
    time[today] = (time[today] || 0) + TICK;
    var days = Object.keys(time).sort();
    while (days.length > KEEP_DAYS) delete time[days.shift()];
    entry.time = time;
    entry.sectionTotal = pkg.sections.length;
    var chapter = currentChapter();
    if (chapter) {
      var key = id + '/' + chapter;
      dwell[key] = (dwell[key] || 0) + TICK;
      if (dwell[key] >= SECTION_READ && !(entry.sections || {})[chapter]) {
        entry.sections = Object.assign({}, entry.sections);
        entry.sections[chapter] = today;
      }
    }
    state[id] = entry;
    persist();
  }
  function markActivity() { lastActivity = Date.now(); }

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
  // escolhas sobre o livro, não sobre a leitura — continuam valendo. O tempo já lido também
  // fica: é histórico (como as horas jogadas), não posição de leitura.
  function keptAfterReset(id) {
    var p = state[id] || {}, kept = null;
    if (p.time && Object.keys(p.time).length) kept = { time: p.time };
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
  ['scroll', 'wheel', 'keydown', 'pointerdown', 'pointermove', 'touchstart'].forEach(function (type) {
    window.addEventListener(type, markActivity, { passive: true });
  });
  setInterval(tick, TICK * 1000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { record(); persist.flush(); Books.store.write(K.progress, state); } });

  Books.progress = { init: init, get: get, all: all, record: record, setRestoring: setRestoring, reset: reset, resetAll: resetAll, touch: touch, isNew: isNew, toggle: toggle, dayKey: dayKey };
})();
