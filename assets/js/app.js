(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var loading = {
    show: function (label, detail) {
      var root = $('appLoading');
      if (!root) return;
      $('appLoadingLabel').textContent = label || 'Carregando…';
      $('appLoadingDetail').textContent = detail || 'Aguarde um momento.';
      root.hidden = false;
      document.body.classList.add('app-is-loading');
    },
    hide: function () {
      var root = $('appLoading');
      if (root) root.hidden = true;
      document.body.classList.remove('app-is-loading');
    }
  };
  Books.loading = loading;

  function setLocationBook(id) {
    try { history.replaceState(null, '', '#/livro/' + id); } catch (e) { }
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
    loading.show('Abrindo livro…', 'Preparando capítulos, imagens e fórmulas.');
    return Books.repo.loadPackage(entry).then(function (pkg) {
      Books.state.pkg = pkg;
      Books.store.write(Books.store.keys.lastBook, pkg.manifest.id);
      Books.progress.touch(pkg.manifest.id); // marca "aberto agora" — ordena a biblioteca pelos últimos abertos
      setLocationBook(pkg.manifest.id);
      return Books.render.book(pkg).then(function () { restoreScroll(pkg.manifest.id); Books.nav.refresh(); });
    }).catch(function (e) {
      console.error(e);
      Books.toast.show('Não foi possível abrir este livro: ' + e.message, { tone: 'error' });
    }).finally(function () { loading.hide(); });
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
    loading.show('Carregando biblioteca…', 'Lendo catálogo e progresso salvo.');
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
      if (location.hash) {
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
      }
      Books.library.open();
      loading.hide();
      return Promise.resolve();
    }).catch(function (e) {
      console.error(e);
      $('mainContent').innerHTML = '';
      $('mainContent').appendChild(Books.util.h('div', { class: 'b-error' }, Books.util.h('strong', null, 'Não foi possível carregar a biblioteca'), Books.util.h('p', null, e.message)));
      loading.hide();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
