/*
 * Progresso de leitura por livro, gravado em content/progress.json (ao salvar na pasta) e em
 * localStorage entre sessões. Cada registro guarda:
 *   firstOpenedAt  quando o livro foi aberto por trás da primeira vez — ausente = livro "novo"
 *   opened         quando foi aberto pela última vez (ordena a biblioteca)
 *   updatedAt      quando este registro foi gravado por último (rolagem ou abertura)
 *   percent/top    posição de leitura, para restaurar a rolagem
 *   section/sectionTitle  id e título legível da seção onde a pessoa parou
 *   finished       true quando a rolagem chegou perto do fim do livro
 * `reset`/`resetAll` (usados pelo painel de configurações) apagam esses dados para recomeçar.
 */
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

  /** Título da seção/subseção ativa no sumário, para gravar "onde a pessoa parou" de forma legível. */
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
    // Mescla no registro existente (nunca substitui o objeto inteiro) — sobrescrever perderia
    // `opened`/`firstOpenedAt` gravados por touch() ao abrir o livro, o que quebrava a ordenação
    // da biblioteca pelos últimos abertos assim que a pessoa rolava a página uma vez.
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
  /** Apaga o progresso de um livro (usado pelo painel de configurações) — ele volta a aparecer como "novo". */
  function reset(id) { delete state[id]; persist(); }
  /** Apaga o progresso de todos os livros. */
  function resetAll() { state = {}; persist(); }
  /** Marca `id` como aberto agora (usado para ordenar a biblioteca pelos últimos abertos) e,
   * na primeira vez, grava `firstOpenedAt` — a marca persistida de que o livro deixou de ser novo. */
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
  /** Nunca foi aberto — usado pela biblioteca para o selo "novo". */
  function isNew(id) { return !state[id] || !state[id].firstOpenedAt; }

  window.addEventListener('scroll', Books.util.debounce(record, 120), { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { record(); persist.flush(); Books.store.write(K.progress, state); } });

  Books.progress = { init: init, get: get, all: all, record: record, setRestoring: setRestoring, reset: reset, resetAll: resetAll, touch: touch, isNew: isNew };
})();
