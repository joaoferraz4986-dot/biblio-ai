/*
 * Ponto de entrada: carrega o catálogo e abre a seleção de livros como tela inicial,
 * liga o dock de ações e delega o resto aos módulos em ui/, content/
 * e editor/. Ver docs/ARQUITETURA.md para a visão geral dos módulos.
 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  function setLocationBook(id) {
    try { history.replaceState(null, '', '#/livro/' + id); } catch (e) { /* file:// em alguns navegadores */ }
  }

  function restoreScroll(id) {
    var p = Books.progress.get(id);
    if (!p.top) return;
    Books.progress.setRestoring(true);
    requestAnimationFrame(function () {
      window.scrollTo({ top: p.top, behavior: 'auto' });
      setTimeout(function () { Books.progress.setRestoring(false); }, 300);
    });
  }

  function openBook(id) {
    var entry = Books.state.catalog.packages.find(function (p) { return p.id === id; }) || Books.state.catalog.packages[0];
    if (!entry) { Books.toast.show('Nenhum livro no catálogo ainda. Use "novo livro" para começar.'); return Promise.resolve(); }
    return Books.repo.loadPackage(entry).then(function (pkg) {
      Books.state.pkg = pkg;
      Books.store.write(Books.store.keys.lastBook, pkg.manifest.id);
      Books.progress.touch(pkg.manifest.id); // marca "aberto agora" — ordena a biblioteca pelos últimos abertos
      setLocationBook(pkg.manifest.id);
      return Books.render.book(pkg).then(function () { restoreScroll(pkg.manifest.id); Books.nav.refresh(); });
    }).catch(function (e) {
      console.error(e);
      Books.toast.show('Não foi possível abrir este livro: ' + e.message, { tone: 'error' });
    });
  }

  function wireDock() {
    $('libraryDockBtn').addEventListener('click', function () { Books.progress.record(); Books.library.open(); });
    $('editDockBtn').addEventListener('click', function () { Books.editor.open(Books.state.pkg && Books.state.pkg.manifest.id); });
    Books.events.on('library:open', function (id) { Books.library.close(); if (!Books.state.pkg || Books.state.pkg.manifest.id !== id) openBook(id); });
    Books.events.on('catalog:changed', function (updatedPkg) {
      if (!Books.state.pkg) return;
      if (updatedPkg) {
        Books.state.pkg = updatedPkg;
        Books.render.book(updatedPkg).then(function () { Books.nav.refresh(); });
      } else {
        openBook(Books.state.pkg.manifest.id);
      }
    });
  }

  function boot() {
    Books.personalization.init(); // tema/fundo/fonte, o quanto antes, para evitar flash do padrão de fábrica
    Books.focus.init(); Books.library.init(); Books.editor.init(); Books.settingsPanel.init(); Books.nav.init();
    Books.focus.set(Books.focus.preferred(), false);
    wireDock();
    Books.repo.loadProgressFile().then(function (fileProgress) {
      Books.state.fileProgress = fileProgress;
      Books.progress.init(fileProgress);
      return Books.repo.loadCatalog();
    }).then(function (catalog) {
      Books.state.catalog = catalog;
      // O hash é usado somente durante a sessão para navegação; ao iniciar/recarregar,
      // a biblioteca sempre é a primeira tela e nenhum livro é carregado por baixo dela.
      if (location.hash) {
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// */ }
      }
      Books.library.open();
      return Promise.resolve();
    }).catch(function (e) {
      console.error(e);
      $('mainContent').innerHTML = '';
      $('mainContent').appendChild(Books.util.h('div', { class: 'b-error' }, Books.util.h('strong', null, 'Não foi possível carregar a biblioteca'), Books.util.h('p', null, e.message)));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
