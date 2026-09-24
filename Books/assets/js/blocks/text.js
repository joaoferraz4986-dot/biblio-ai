/* Blocos de texto: heading, paragraph, list, quote, callout, steps, divider. */
(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var inl = function (t) { return Books.inline.render(t); };
  var plain = function (t) { return Books.inline.toPlain(t); };

  B.register({
    type: 'heading', label: 'Título', group: 'texto', icon: 'heading',
    doc: 'Subtítulo dentro de uma seção. `level` 3 é um título de tópico; `level` 4 é um título menor (ex.: dentro de subseções).',
    example: { type: 'heading', level: 3, text: 'Como funciona o alocador' },
    defaults: function () { return { level: 3, text: 'Novo título' }; },
    fields: [
      { key: 'level', label: 'Nível', kind: 'select', options: [[3, 'Título (h3)'], [4, 'Subtítulo (h4)']], required: true, number: true },
      { key: 'text', label: 'Texto', kind: 'line', required: true }
    ],
    summary: function (b) { return plain(b.text); },
    render: function (b) { return h('h' + (b.level === 4 ? 4 : 3), { class: 'b-heading b-heading--' + (b.level === 4 ? 4 : 3) }, inl(b.text)); }
  });

  B.register({
    type: 'paragraph', label: 'Parágrafo', group: 'texto', icon: 'paragraph',
    doc: 'Texto corrido com marcação inline. Use `lead: true` para o parágrafo de abertura de uma seção (texto maior).',
    example: { type: 'paragraph', text: 'Um **ponteiro** guarda um endereço; veja `std::unique_ptr` para posse exclusiva.' },
    defaults: function () { return { text: 'Escreva aqui o texto do parágrafo.' }; },
    fields: [
      { key: 'text', label: 'Texto', kind: 'text', required: true, rows: 4 },
      { key: 'lead', label: 'Parágrafo de abertura (texto maior)', kind: 'bool' }
    ],
    summary: function (b) { return plain(b.text); },
    render: function (b) { return h('p', { class: 'b-paragraph' + (b.lead ? ' b-paragraph--lead' : '') }, inl(b.text)); }
  });

  function renderItems(items, style) {
    var tag = style === 'number' ? 'ol' : 'ul';
    var ul = h(tag, { class: 'b-list b-list--' + (style || 'bullet') });
    (items || []).forEach(function (item) {
      var text = typeof item === 'string' ? item : item.text;
      var li = h('li', null, inl(text));
      if (item && typeof item === 'object' && item.items && item.items.length) li.appendChild(renderItems(item.items, style === 'number' ? 'number' : 'bullet'));
      ul.appendChild(li);
    });
    return ul;
  }
  B.register({
    type: 'list', label: 'Lista', group: 'texto', icon: 'list',
    doc: 'Lista com marcadores (`bullet`), numerada (`number`) ou de verificação (`check`). Cada item é uma string com marcação inline, ou `{ "text": "...", "items": [...] }` para sublistas.',
    example: { type: 'list', style: 'bullet', items: ['Primeiro item', { text: 'Item com sublista', items: ['Filho A', 'Filho B'] }] },
    defaults: function () { return { style: 'bullet', items: ['Primeiro item', 'Segundo item'] }; },
    fields: [
      { key: 'style', label: 'Estilo', kind: 'select', options: [['bullet', 'Marcadores'], ['number', 'Numerada'], ['check', 'Verificação']] },
      { key: 'items', label: 'Itens (um por linha; recue 2 espaços para sublista)', kind: 'items', required: true }
    ],
    summary: function (b) { return (b.items || []).map(function (i) { return plain(typeof i === 'string' ? i : i.text); }).join(' · '); },
    render: function (b) { return renderItems(b.items, b.style); }
  });

  B.register({
    type: 'quote', label: 'Citação', group: 'texto', icon: 'quote',
    doc: 'Citação com autoria opcional (`cite`).',
    example: { type: 'quote', text: 'Programas devem ser escritos para pessoas lerem.', cite: 'Abelson & Sussman' },
    defaults: function () { return { text: 'Texto da citação.', cite: '' }; },
    fields: [
      { key: 'text', label: 'Citação', kind: 'text', required: true, rows: 3 },
      { key: 'cite', label: 'Autoria / fonte', kind: 'line' }
    ],
    summary: function (b) { return plain(b.text); },
    render: function (b) {
      var q = h('blockquote', { class: 'b-quote' }, h('p', null, inl(b.text)));
      if (b.cite) q.appendChild(h('footer', null, inl(b.cite)));
      return q;
    }
  });

  var CALLOUTS = {
    note: ['Nota', 'note'], info: ['Informação', 'info'], key: ['Ponto-chave', 'key'], tip: ['Dica', 'tip'],
    warning: ['Atenção', 'warning'], danger: ['Perigo', 'danger'], definition: ['Definição', 'definition'], example: ['Exemplo', 'example']
  };
  B.register({
    type: 'callout', label: 'Callout', group: 'texto', icon: 'info',
    doc: 'Caixa de destaque. Variantes: `note` (nota), `info`, `key` (ponto-chave), `tip` (dica), `warning` (atenção), `danger` (perigo), `definition`, `example`. `title` é opcional (o rótulo da variante é usado se faltar). `text` aceita parágrafos separados por linha em branco; `blocks` permite conteúdo rico (ex.: código) abaixo do texto.',
    example: { type: 'callout', variant: 'warning', title: 'Cuidado com o dangling pointer', text: 'Depois do `delete`, o ponteiro continua guardando o endereço antigo.' },
    defaults: function () { return { variant: 'note', title: '', text: 'Escreva aqui o destaque.' }; },
    fields: [
      { key: 'variant', label: 'Tipo', kind: 'select', required: true, options: Object.keys(CALLOUTS).map(function (k) { return [k, CALLOUTS[k][0]]; }) },
      { key: 'title', label: 'Título (opcional)', kind: 'line' },
      { key: 'text', label: 'Texto', kind: 'text', rows: 4 },
      { key: 'blocks', label: 'Conteúdo extra (opcional)', kind: 'blocks', optional: true }
    ],
    summary: function (b) { return (b.title ? plain(b.title) + ' — ' : '') + plain(b.text); },
    children: function (b) { return b.blocks ? [{ key: 'blocks', blocks: b.blocks }] : []; },
    render: function (b, ctx) {
      var v = CALLOUTS[b.variant] ? b.variant : 'note';
      var head = h('div', { class: 'b-callout__head' }, h('span', { class: 'b-callout__icon' }, Books.icons.get(CALLOUTS[v][1], 18)),
        h('strong', { class: 'b-callout__title' }, b.title ? inl(b.title) : CALLOUTS[v][0]));
      var body = h('div', { class: 'b-callout__body' });
      String(b.text || '').split(/\n{2,}/).forEach(function (para) { if (para.trim()) body.appendChild(h('p', null, inl(para.trim()))); });
      if (b.blocks && b.blocks.length) body.appendChild(B.renderList(b.blocks, ctx));
      return h('aside', { class: 'b-callout b-callout--' + v }, head, body);
    }
  });

  B.register({
    type: 'steps', label: 'Passo a passo', group: 'texto', icon: 'steps',
    doc: 'Sequência numerada de passos, cada um com `title` e `text` (ambos com marcação inline).',
    example: { type: 'steps', items: [{ title: 'Compile', text: 'Rode `g++ -O0 -g main.cpp`.' }, { title: 'Inspecione', text: 'Use `objdump -d a.out`.' }] },
    defaults: function () { return { items: [{ title: 'Primeiro passo', text: 'Descreva o que fazer.' }, { title: 'Segundo passo', text: 'Descreva o próximo passo.' }] }; },
    fields: [{ key: 'items', label: 'Passos', kind: 'group-list', itemLabel: 'Passo', required: true,
      fields: [{ key: 'title', label: 'Título', kind: 'line', required: true }, { key: 'text', label: 'Texto', kind: 'text', rows: 2 }] }],
    summary: function (b) { return (b.items || []).map(function (i) { return plain(i.title); }).join(' → '); },
    render: function (b) {
      var ol = h('ol', { class: 'b-steps' });
      (b.items || []).forEach(function (item) {
        ol.appendChild(h('li', { class: 'b-steps__item' }, h('div', { class: 'b-steps__body' }, h('strong', null, inl(item.title)), item.text ? h('p', null, inl(item.text)) : null)));
      });
      return ol;
    }
  });

  B.register({
    type: 'divider', label: 'Divisor', group: 'estrutura', icon: 'divider',
    doc: 'Linha divisória entre trechos.',
    example: { type: 'divider' },
    defaults: function () { return {}; },
    fields: [],
    summary: function () { return '———'; },
    render: function () { return h('hr', { class: 'b-divider' }); }
  });
})();
