(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var inl = function (t) { return Books.inline.render(t || ''); };
  var plain = function (t) { return Books.inline.toPlain(t || ''); };
  var DIFFICULTY = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
  var FORMATS = { discursiva: 'Discursiva', alternativa: 'Múltipla escolha', 'programacao-competitiva': 'Programação competitiva' };

  function textBlock(label, value, cls) {
    return value ? h('div', { class: 'b-exercise__spec ' + (cls || '') }, h('strong', null, label), inl(value)) : null;
  }
  function choicesView(choices) {
    if (!Array.isArray(choices) || !choices.length) return null;
    return h('ol', { class: 'b-exercise__choices', type: 'A' }, choices.map(function (choice) {
      return h('li', { class: choice.correct ? 'is-correct' : '' }, inl(choice.label || choice.text || ''));
    }));
  }
  function examplesView(examples) {
    if (!Array.isArray(examples) || !examples.length) return null;
    return h('div', { class: 'b-exercise__examples' },
      h('strong', null, 'Exemplos'),
      examples.map(function (ex, i) {
        return h('div', { class: 'b-exercise__example' },
          h('span', { class: 'b-exercise__example-label' }, 'Exemplo ' + (i + 1)),
          h('div', { class: 'b-exercise__io' },
            ex.input ? h('pre', null, ex.input) : null,
            ex.output ? h('pre', null, ex.output) : null),
          ex.explanation ? h('p', { class: 'hint' }, inl(ex.explanation)) : null);
      }));
  }

  B.register({
    type: 'exercise', label: 'Exercício (solução expansível)', group: 'texto', icon: 'check',
    doc: 'Exercício discursivo, de múltipla escolha ou de programação competitiva. O enunciado pode ser longo; campos estruturados preservam restrições, formato de entrada/saída, exemplos, dicas e uma solução rigorosa em blocos aninhados.',
    example: { type: 'exercise', number: '9.1', format: 'discursiva', difficulty: 'medio', prompt: 'Prove por bijeção que o número de subconjuntos de um conjunto de `n` elementos é `2^n`.', hint: 'Associe cada subconjunto a uma sequência de n escolhas binárias.', solutionBlocks: [{ type: 'paragraph', text: 'Para cada elemento do conjunto, decidir incluí-lo ou não define uma função entre subconjuntos e sequências binárias de comprimento `n`.' }] },
    defaults: function () {
      return { id: 'ex-' + Books.util.uid(''), number: '', format: 'discursiva', difficulty: '', prompt: 'Enunciado do exercício.', context: '', choices: [], constraints: '', inputFormat: '', outputFormat: '', examples: [], hint: '', complexity: '', solutionBlocks: [{ type: 'paragraph', text: 'Solução completa aqui.' }] };
    },
    fields: [
      { key: 'number', label: 'Número (ex.: 9.1)', kind: 'plain' },
      { key: 'format', label: 'Formato', kind: 'select', options: [['discursiva', 'Discursiva'], ['alternativa', 'Múltipla escolha'], ['programacao-competitiva', 'Programação competitiva']] },
      { key: 'difficulty', label: 'Dificuldade', kind: 'select', options: [['', '—'], ['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil']] },
      { key: 'prompt', label: 'Enunciado completo', kind: 'text', rows: 7, required: true },
      { key: 'context', label: 'Contexto ou história do problema (opcional)', kind: 'text', rows: 4 },
      { key: 'choices', label: 'Alternativas (use no formato múltipla escolha)', kind: 'group-list', itemLabel: 'alternativa', fields: [{ key: 'label', label: 'Texto da alternativa', kind: 'text', rows: 2 }, { key: 'correct', label: 'É a resposta correta', kind: 'bool' }] },
      { key: 'constraints', label: 'Restrições (programação competitiva)', kind: 'text', rows: 4 },
      { key: 'inputFormat', label: 'Formato da entrada', kind: 'text', rows: 3 },
      { key: 'outputFormat', label: 'Formato da saída', kind: 'text', rows: 3 },
      { key: 'examples', label: 'Exemplos de entrada/saída', kind: 'group-list', itemLabel: 'exemplo', fields: [{ key: 'input', label: 'Entrada', kind: 'code', rows: 3 }, { key: 'output', label: 'Saída', kind: 'code', rows: 3 }, { key: 'explanation', label: 'Explicação do exemplo', kind: 'text', rows: 2 }] },
      { key: 'hint', label: 'Dica (orienta sem entregar a resposta)', kind: 'text', rows: 3 },
      { key: 'complexity', label: 'Complexidade esperada', kind: 'line' },
      { key: 'solutionBlocks', label: 'Solução rigorosa e documentada', kind: 'blocks', required: true }
    ],
    summary: function (b) { return (b.number ? b.number + ' ' : '') + (FORMATS[b.format] ? '[' + FORMATS[b.format] + '] ' : '') + plain(b.prompt); },
    children: function (b) { return [{ key: 'solutionBlocks', blocks: b.solutionBlocks || [] }]; },
    render: function (b, ctx) {
      var revealed = false;
      var num = b.number ? h('span', { class: 'b-exercise__num' }, b.number) : null;
      var format = FORMATS[b.format] ? h('span', { class: 'b-exercise__format' }, FORMATS[b.format]) : null;
      var diff = b.difficulty && DIFFICULTY[b.difficulty] ? h('span', { class: 'b-exercise__difficulty b-exercise__difficulty--' + b.difficulty }, DIFFICULTY[b.difficulty]) : null;
      var meta = [];
      if (b.context) meta.push(textBlock('Contexto', b.context));
      if (b.format === 'programacao-competitiva') { meta.push(textBlock('Restrições', b.constraints, 'b-exercise__code-spec')); meta.push(textBlock('Entrada', b.inputFormat, 'b-exercise__code-spec')); meta.push(textBlock('Saída', b.outputFormat, 'b-exercise__code-spec')); meta.push(textBlock('Complexidade alvo', b.complexity)); }
      var toggle = h('button', { type: 'button', class: 'b-exercise__toggle', 'aria-expanded': 'false' }, h('span', { class: 'b-exercise__toggle-icon' }, Books.icons.get('down', 15)), h('span', { class: 'b-exercise__toggle-label' }, 'Ver solução'));
      var solutionInner = h('div', { class: 'b-exercise__solution-inner' }, B.renderList(b.solutionBlocks || [], ctx));
      var solution = h('div', { class: 'b-exercise__solution' }, solutionInner);
      function setRevealed(open) { solution.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.querySelector('.b-exercise__toggle-label').textContent = open ? 'Ocultar solução' : 'Ver solução'; var iconSlot = toggle.querySelector('.b-exercise__toggle-icon'); Books.util.clear(iconSlot); iconSlot.appendChild(Books.icons.get(open ? 'up' : 'down', 15)); }
      toggle.addEventListener('click', function () { if (!revealed) { toggle.disabled = true; Books.confirm('Você já tentou resolver este exercício? A solução completa aparece a seguir.', { title: 'Ver a solução?', confirmLabel: 'Ver solução', cancelLabel: 'Ainda não' }).then(function (ok) { toggle.disabled = false; if (!ok) return; revealed = true; setRevealed(true); }); return; } setRevealed(!solution.classList.contains('is-open')); });
      var el = h('div', { class: 'b-exercise b-exercise--' + (b.format || 'discursiva') },
        h('div', { class: 'b-exercise__head' }, num, format, diff),
        h('div', { class: 'b-exercise__prompt' }, inl(b.prompt)),
        meta.length ? h('div', { class: 'b-exercise__meta' }, meta) : null,
        b.format === 'alternativa' ? choicesView(b.choices) : null,
        b.format === 'programacao-competitiva' ? examplesView(b.examples) : null,
        b.hint ? h('div', { class: 'b-exercise__hint', tabIndex: 0, role: 'note', 'aria-label': 'Dica do exercício; aproxime o cursor para revelar' }, h('span', { class: 'b-exercise__hint-label' }, 'Dica:'), ' ', h('span', { class: 'b-exercise__hint-content' }, inl(b.hint))) : null,
        toggle, solution);
      return el;
    }
  });
})();
