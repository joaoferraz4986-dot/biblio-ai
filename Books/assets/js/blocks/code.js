/* Bloco de código com realce de sintaxe, título, números de linha e destaque de linhas. */
(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };

  function parseLines(spec) {
    var set = {};
    String(spec || '').split(',').forEach(function (part) {
      var m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
      if (!m) return;
      var a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a;
      for (var i = a; i <= b && i - a < 2000; i++) set[i] = true;
    });
    return set;
  }

  var LANG_OPTIONS = [['cpp', 'C++'], ['c', 'C'], ['asm', 'Assembly'], ['bash', 'Shell'], ['python', 'Python'], ['js', 'JavaScript / TypeScript'],
    ['json', 'JSON'], ['rust', 'Rust'], ['go', 'Go'], ['java', 'Java'], ['sql', 'SQL'], ['text', 'Texto puro']];

  B.register({
    type: 'code', label: 'Código', group: 'codigo', icon: 'code',
    doc: 'Bloco de código com realce. `language`: cpp, c, asm, bash, python, js, json, rust, go, java, sql ou text. `title` (opcional) aparece na barra do bloco. `highlight` destaca linhas ("2,4-6"); `lineNumbers` mostra a numeração. O conteúdo é texto puro — nunca HTML.',
    example: { type: 'code', language: 'cpp', title: 'RAII em uma linha', code: 'auto p = std::make_unique<int>(42);', highlight: '1' },
    defaults: function () { return { language: 'cpp', title: '', code: '// seu código aqui' }; },
    fields: [
      { key: 'language', label: 'Linguagem', kind: 'select', options: LANG_OPTIONS, required: true },
      { key: 'title', label: 'Título (opcional)', kind: 'line' },
      { key: 'code', label: 'Código', kind: 'code', rows: 8, required: true },
      { key: 'highlight', label: 'Destacar linhas (ex.: 2,4-6)', kind: 'lines' },
      { key: 'lineNumbers', label: 'Mostrar números de linha', kind: 'bool' }
    ],
    summary: function (b) { return (b.title ? Books.inline.toPlain(b.title) + ' · ' : '') + String(b.code || '').split('\n')[0]; },
    render: function (b) {
      var code = String(b.code || '').replace(/\n+$/, '');
      var hl = parseLines(b.highlight);
      var codeEl = h('code');
      Books.highlight.renderLines(code, b.language).forEach(function (frag, i) {
        codeEl.appendChild(h('span', { class: 'line' + (hl[i + 1] ? ' is-hl' : '') }, frag));
      });
      var label = LANG_OPTIONS.filter(function (o) { return o[0] === Books.highlight.normalize(b.language) || o[0] === b.language; })[0];
      var copy = h('button', { class: 'b-code__copy', type: 'button', 'aria-label': 'Copiar código' }, Books.icons.get('copy', 14), h('span', null, 'copiar'));
      copy.addEventListener('click', function () {
        Books.util.copyText(code).then(function () {
          copy.classList.add('is-done'); copy.lastChild.textContent = 'copiado';
          setTimeout(function () { copy.classList.remove('is-done'); copy.lastChild.textContent = 'copiar'; }, 1400);
        }).catch(function () { copy.lastChild.textContent = 'falhou'; });
      });
      return h('figure', { class: 'b-code' + (b.lineNumbers ? ' has-lines' : '') },
        h('figcaption', { class: 'b-code__bar' },
          h('span', { class: 'b-code__lang' }, label ? label[1] : (b.language || 'texto')),
          b.title ? h('span', { class: 'b-code__title' }, Books.inline.render(b.title)) : null,
          copy),
        h('pre', { class: 'b-code__pre', tabindex: '0' }, codeEl));
    }
  });
})();
