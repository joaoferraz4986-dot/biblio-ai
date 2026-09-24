/* Renderização de diagramas Mermaid (carregamento preguiçoso, sequencial e com erro isolado por diagrama). */
(function () {
  'use strict';
  var loading = null;
  var counter = 0;
  var queue = Promise.resolve();

  var THEME = {
    background: '#101820', primaryColor: '#243b53', primaryTextColor: '#f1f5f9', primaryBorderColor: '#76a9fa',
    lineColor: '#9fb3c8', secondaryColor: '#163b38', tertiaryColor: '#3b2d62', fontFamily: 'IBM Plex Sans, Segoe UI, sans-serif'
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('falha ao carregar ' + src)); };
      document.head.appendChild(s);
    });
  }
  function ensureMermaid() {
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (!loading) {
      loading = loadScript(new URL('assets/vendor/mermaid.min.js', document.baseURI).href)
        .catch(function () { return loadScript('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'); })
        .then(function () {
          window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'dark', themeVariables: THEME, flowchart: { useMaxWidth: false, htmlLabels: true } });
          return window.mermaid;
        });
      loading.catch(function () { loading = null; });
    }
    return loading;
  }

  function showError(canvas, error, source) {
    var h = Books.util.h;
    Books.util.clear(canvas);
    var msg = String(error && error.message ? error.message : error).split('\n').slice(0, 3).join(' ');
    canvas.appendChild(h('div', { class: 'b-diagram__error' }, h('strong', null, 'Diagrama com erro de sintaxe'), h('p', null, msg),
      h('details', null, h('summary', null, 'ver código'), h('pre', null, source))));
  }

  function renderCanvas(canvas) {
    var source = canvas.dataset.source || '';
    return ensureMermaid().then(function (mermaid) {
      return mermaid.render('mmd-' + (++counter), source).then(function (out) {
        var tpl = document.createElement('template');
        tpl.innerHTML = out.svg;
        Books.util.clear(canvas);
        canvas.appendChild(tpl.content);
        canvas.dataset.rendered = '1';
      });
    }).catch(function (e) {
      showError(canvas, e, source);
      canvas.dataset.rendered = 'error';
      document.querySelectorAll('[id^="dmmd-' + counter + '"],#dmmd-' + counter).forEach(function (n) { n.remove(); });
    });
  }

  /** Renderiza todos os canvases pendentes dentro de `root`. Devolve uma Promise. */
  function renderAll(root) {
    var pending = Array.prototype.slice.call((root || document).querySelectorAll('.b-diagram__canvas[data-engine="mermaid"]:not([data-rendered])'));
    if (!pending.length) return Promise.resolve();
    var run = queue.then(function () {
      return pending.reduce(function (p, canvas) { return p.then(function () { return canvas.isConnected ? renderCanvas(canvas) : null; }); }, Promise.resolve());
    });
    queue = run.catch(function () {});
    return run;
  }

  Books.diagrams = { renderAll: renderAll, ensureMermaid: ensureMermaid };
})();
