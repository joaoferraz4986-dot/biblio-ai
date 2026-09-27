(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var inl = function (t) { return Books.inline.render(t); };
  var plain = function (t) { return Books.inline.toPlain(t); };

  var DIFFICULTY = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

  B.register({
    type: 'exercise', label: 'Exercício (com solução expansível)', group: 'texto', icon: 'check',
    doc: 'Exercício com solução recolhida. `prompt` é o enunciado (sempre visível); `hint` é uma dica curta opcional, sempre visível; `solutionBlocks` é a solução completa, em blocos aninhados (parágrafo, código, lista, fórmula, tabela, callout…) — só aparece depois que a pessoa confirma no popup que quer ver a resposta.',
    example: { type: 'exercise', number: '9.1', difficulty: 'medio', prompt: 'Prove por bijeção que o número de subconjuntos de um conjunto de `n` elementos é `2^n`.',
      hint: 'Associe cada subconjunto a uma sequência de n escolhas binárias.',
      solutionBlocks: [{ type: 'paragraph', text: 'Para cada elemento do conjunto, decidir incluí-lo ou não define uma função entre subconjuntos e sequências binárias de comprimento `n`…' }] },
    defaults: function () {
      return { id: 'ex-' + Books.util.uid(''), number: '', difficulty: '', prompt: 'Enunciado do exercício.', hint: '',
        solutionBlocks: [{ type: 'paragraph', text: 'Solução completa aqui.' }] };
    },
    fields: [
      { key: 'number', label: 'Número (ex.: 9.1)', kind: 'plain' },
      { key: 'difficulty', label: 'Dificuldade', kind: 'select', options: [['', '—'], ['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil']] },
      { key: 'prompt', label: 'Enunciado', kind: 'text', rows: 3, required: true },
      { key: 'hint', label: 'Dica (opcional, sempre visível)', kind: 'text', rows: 2 },
      { key: 'solutionBlocks', label: 'Solução completa (recolhida até confirmar)', kind: 'blocks', required: true }
    ],
    summary: function (b) { return (b.number ? b.number + ' ' : '') + plain(b.prompt); },
    children: function (b) { return [{ key: 'solutionBlocks', blocks: b.solutionBlocks || [] }]; },
    render: function (b, ctx) {
      var revealed = false;

      var num = b.number ? h('span', { class: 'b-exercise__num' }, b.number) : null;
      var diff = b.difficulty && DIFFICULTY[b.difficulty]
        ? h('span', { class: 'b-exercise__difficulty b-exercise__difficulty--' + b.difficulty }, DIFFICULTY[b.difficulty])
        : null;

      var toggle = h('button', { type: 'button', class: 'b-exercise__toggle', 'aria-expanded': 'false' },
        h('span', { class: 'b-exercise__toggle-icon' }, Books.icons.get('down', 15)),
        h('span', { class: 'b-exercise__toggle-label' }, 'Ver solução'));

      var solutionInner = h('div', { class: 'b-exercise__solution-inner' }, B.renderList(b.solutionBlocks, ctx));
      var solution = h('div', { class: 'b-exercise__solution' }, solutionInner);

      function setRevealed(open) {
        solution.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.querySelector('.b-exercise__toggle-label').textContent = open ? 'Ocultar solução' : 'Ver solução';
        var iconSlot = toggle.querySelector('.b-exercise__toggle-icon');
        Books.util.clear(iconSlot);
        iconSlot.appendChild(Books.icons.get(open ? 'up' : 'down', 15));
      }

      toggle.addEventListener('click', function () {
        if (!revealed) {
          toggle.disabled = true;
          Books.confirm('Você já tentou resolver este exercício? A solução completa aparece a seguir.', {
            title: 'Ver a solução?', confirmLabel: 'Ver solução', cancelLabel: 'Ainda não'
          }).then(function (ok) {
            toggle.disabled = false;
            if (!ok) return;
            revealed = true;
            setRevealed(true);
          });
          return;
        }
        setRevealed(!solution.classList.contains('is-open'));
      });

      var el = h('div', { class: 'b-exercise' },
        h('div', { class: 'b-exercise__head' }, num, diff),
        h('div', { class: 'b-exercise__prompt' }, inl(b.prompt)),
        b.hint ? h('div', { class: 'b-exercise__hint', tabIndex: 0, role: 'note', 'aria-label': 'Dica do exercício; aproxime o cursor para revelar' }, h('span', { class: 'b-exercise__hint-label' }, 'Dica:'), ' ', h('span', { class: 'b-exercise__hint-content' }, inl(b.hint))) : null,
        toggle,
        solution);
      return el;
    }
  });
})();
