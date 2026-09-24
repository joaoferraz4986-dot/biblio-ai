/*
 * Renderização de fórmulas matemáticas (LaTeX) via KaTeX, vendorizado em
 * assets/vendor/katex.min.js — carregado sob demanda, só quando o livro
 * realmente tem matemática, para não pesar livros que não usam.
 *
 * Duas formas de matemática:
 *   • inline: dentro de qualquer campo de texto, entre `$…$` (ver content/inline.js)
 *   • bloco: o tipo de bloco `math` (ver blocks/math.js), para equações em destaque
 * As duas renderizam de forma preguiçosa: content/inline.js e blocks/math.js só
 * deixam um placeholder com `data-math`; esta renderização real acontece aqui,
 * depois que a seção já está na tela — mesmo padrão de render/diagrams.js.
 */
(function () {
  'use strict';
  var loading = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('falha ao carregar ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadStyle(href) {
    if (document.querySelector('link[data-katex]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = href; link.dataset.katex = '1';
    document.head.appendChild(link);
  }
  function ensureKatex() {
    if (window.katex) return Promise.resolve(window.katex);
    if (!loading) {
      loadStyle(new URL('assets/vendor/katex.min.css', document.baseURI).href);
      loading = loadScript(new URL('assets/vendor/katex.min.js', document.baseURI).href)
        .catch(function () { return loadScript('https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.js'); })
        .then(function () { return window.katex; });
      loading.catch(function () { loading = null; });
    }
    return loading;
  }

  function renderInto(el, katex) {
    var tex = el.dataset.math || '';
    var display = el.dataset.display === '1';
    try {
      katex.render(tex, el, { displayMode: display, throwOnError: true, strict: 'ignore', trust: false });
      el.dataset.rendered = '1';
    } catch (e) {
      el.textContent = '';
      el.classList.add('math-error');
      el.appendChild(Books.util.h('span', null, (display ? '∎ ' : '') + 'fórmula inválida: ' + e.message));
      el.dataset.rendered = 'error';
    }
  }

  /** Renderiza todo placeholder `[data-math]` pendente dentro de `root`. Devolve uma Promise. */
  function renderAll(root) {
    var pending = Array.prototype.slice.call((root || document).querySelectorAll('[data-math]:not([data-rendered])'));
    if (!pending.length) return Promise.resolve();
    return ensureKatex().then(function (katex) {
      pending.forEach(function (el) { if (el.isConnected) renderInto(el, katex); });
    }).catch(function (e) {
      pending.forEach(function (el) {
        el.textContent = 'não foi possível carregar o renderizador de fórmulas';
        el.classList.add('math-error');
        el.dataset.rendered = 'error';
      });
      console.error('[math]', e);
    });
  }

  Books.math = { renderAll: renderAll, ensureKatex: ensureKatex };
})();
