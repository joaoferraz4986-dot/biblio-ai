/*
 * Biblioteca: grade de capas dos livros do catálogo, com busca por título/tag e
 * indicador de progresso de leitura. Ativada pelo botão "Livros" no dock.
 */
(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };
  var els = {};
  var query = '';

  function placeholderNode(entry) {
    var initials = Books.inline.toPlain(entry.title || entry.id).split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    return h('div', { class: 'book-card__placeholder', 'aria-hidden': 'true' }, initials || '?');
  }
  function coverNode(entry) {
    if (entry.cover && entry.cover.src) {
      var url = Books.repo.assetUrl(entry.id, entry.cover.src);
      var img = h('img', { src: url, alt: entry.cover.alt || '', loading: 'lazy' });
      // se o arquivo referenciado não existir/carregar, cai para o placeholder de iniciais
      // em vez de mostrar o ícone de imagem quebrada.
      img.addEventListener('error', function () { img.replaceWith(placeholderNode(entry)); }, { once: true });
      return img;
    }
    return placeholderNode(entry);
  }

  function matches(entry, q) {
    if (!q) return true;
    var hay = (entry.title + ' ' + (entry.description || '') + ' ' + (entry.tags || []).join(' ')).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  /** Mais recentemente abertos primeiro (Books.progress.touch grava "opened" em app.js
   * openBook()); livros nunca abertos (sem "opened") ficam por último, na ordem do catálogo. */
  function sortByLastOpened(list) {
    return list.slice().sort(function (a, b) {
      return (Books.progress.get(b.id).opened || 0) - (Books.progress.get(a.id).opened || 0);
    });
  }

  function render() {
    var catalog = Books.state.catalog;
    var grid = Books.util.clear(els.grid);
    var list = sortByLastOpened((catalog.packages || []).filter(function (e) { return matches(e, query.toLowerCase()); }));
    els.empty.hidden = list.length !== 0;
    els.count.textContent = list.length + (list.length === 1 ? ' livro' : ' livros');
    list.forEach(function (entry) {
      var p = Books.progress.get(entry.id);
      var isNew = Books.progress.isNew(entry.id);
      // "onde a pessoa parou": título da seção ativa na última leitura, como dica (tooltip) do card.
      var stoppedAt = !isNew && p.sectionTitle ? 'Você parou em: ' + p.sectionTitle : null;
      var card = h('button', { class: 'book-card', type: 'button', dataset: { book: entry.id }, title: stoppedAt },
        h('div', { class: 'book-card__cover', style: { aspectRatio: Books.util.aspectRatioCss(entry.cover && entry.cover.ratio) } }, coverNode(entry), p.percent > 0 ? h('div', { class: 'book-card__progress' }, h('span', { style: { width: p.percent + '%' } })) : null),
        h('div', { class: 'book-card__info' },
          h('h3', null, entry.title),
          entry.description ? h('p', null, entry.description) : null,
          h('div', { class: 'book-card__meta' },
            (entry.tags || []).slice(0, 3).map(function (t) { return h('span', { class: 'tag' }, t); }),
            isNew ? h('span', { class: 'book-card__pct is-new' }, 'novo')
              : h('span', { class: 'book-card__pct' }, p.finished ? 'concluído' : p.percent + '%'))));
      card.addEventListener('click', function () { Books.events.emit('library:open', entry.id); });
      grid.appendChild(card);
    });
  }

  function open() {
    els.root.hidden = false;
    document.body.classList.add('overlay-open', 'library-open');
    els.close.hidden = !Books.state.pkg;
    els.search.value = query;
    render();
    setTimeout(function () { els.search.focus(); }, 30);
  }
  function close() { els.root.hidden = true; document.body.classList.remove('overlay-open', 'library-open'); }
  function isOpen() { return document.body.classList.contains('library-open'); }

  function init() {
    els.root = document.getElementById('libraryOverlay');
    els.grid = document.getElementById('libraryGrid');
    els.empty = document.getElementById('libraryEmpty');
    els.count = document.getElementById('libraryCount');
    els.search = document.getElementById('librarySearch');
    els.close = document.getElementById('libraryClose');
    els.new = document.getElementById('libraryNew');
    els.settings = document.getElementById('libraryOpenSettings');
    els.close.addEventListener('click', close);
    els.root.addEventListener('click', function (e) { if (e.target === els.root) close(); });
    els.search.addEventListener('input', function () { query = els.search.value; render(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(); });
    els.new.addEventListener('click', function () { Books.events.emit('library:new'); });
    els.settings.addEventListener('click', function () { Books.events.emit('settings:open'); });
    Books.events.on('catalog:changed', function () { if (isOpen()) render(); });
    Books.events.on('progress:changed', function () { if (isOpen()) render(); });
  }

  Books.library = { init: init, open: open, close: close, isOpen: isOpen, render: render };
})();
