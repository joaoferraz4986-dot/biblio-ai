(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var plain = function (t) { return Books.inline.toPlain(t); };

  B.register({
    type: 'subsection', label: 'Subseção', group: 'estrutura', icon: 'layers',
    doc: 'Cartão de subseção com título numerado, etiqueta colorida (`tag`) e cor de destaque. Aparece no sumário lateral e precisa de um `id` único no livro (só letras minúsculas, números e hífens).',
    example: { type: 'subsection', id: 'sec-heap', number: '3.6', tag: 'HEAP', accent: 'orange', title: 'Monte dinâmico (`heap`)', blocks: [{ type: 'paragraph', text: 'Região para alocação sob demanda.' }] },
    defaults: function () { return { id: 'sec-' + Books.util.uid('nova'), number: '', tag: '', accent: 'blue', title: 'Nova subseção', blocks: [{ type: 'paragraph', text: 'Conteúdo da subseção.' }] }; },
    fields: [
      { key: 'id', label: 'ID (âncora)', kind: 'plain', required: true, pattern: '^[a-z0-9][a-z0-9-]*$' },
      { key: 'number', label: 'Número (ex.: 3.1)', kind: 'plain' },
      { key: 'title', label: 'Título', kind: 'line', required: true },
      { key: 'tag', label: 'Etiqueta (ex.: HEAP)', kind: 'plain' },
      { key: 'accent', label: 'Cor', kind: 'accent' },
      { key: 'blocks', label: 'Conteúdo', kind: 'blocks', required: true }
    ],
    summary: function (b) { return (b.number ? b.number + ' ' : '') + plain(b.title); },
    children: function (b) { return [{ key: 'blocks', blocks: b.blocks || [] }]; },
    render: function (b, ctx) {
      var css = Books.schema.accentCss(b.accent);
      var head = h('header', { class: 'b-subsection__head' },
        b.tag ? h('span', { class: 'b-subsection__tag' }, b.tag) : null,
        h('h3', { class: 'b-subsection__title' }, b.number ? h('span', { class: 'num' }, b.number) : null, Books.inline.render(b.title)));
      var el = h('section', { class: 'b-subsection', id: b.id || null }, head, h('div', { class: 'b-subsection__body' }, B.renderList(b.blocks, ctx)));
      if (css) el.style.setProperty('--accent', css);
      return el;
    }
  });

  B.register({
    type: 'details', label: 'Bloco recolhível', group: 'estrutura', icon: 'details',
    doc: 'Conteúdo recolhido por padrão (`open: true` para vir aberto). Bom para material de referência longo.',
    example: { type: 'details', summary: 'Ver o diagrama completo', blocks: [{ type: 'mermaid', code: 'flowchart TD\n  A --> B' }] },
    defaults: function () { return { summary: 'Ver mais', open: false, blocks: [{ type: 'paragraph', text: 'Conteúdo recolhido.' }] }; },
    fields: [
      { key: 'summary', label: 'Rótulo', kind: 'line', required: true },
      { key: 'open', label: 'Aberto por padrão', kind: 'bool' },
      { key: 'blocks', label: 'Conteúdo', kind: 'blocks', required: true }
    ],
    summary: function (b) { return plain(b.summary); },
    children: function (b) { return [{ key: 'blocks', blocks: b.blocks || [] }]; },
    render: function (b, ctx) {
      var d = h('details', { class: 'b-details' }, h('summary', null, Books.icons.get('right', 14), h('span', null, Books.inline.render(b.summary))),
        h('div', { class: 'b-details__body' }, B.renderList(b.blocks, ctx)));
      if (b.open) d.open = true;
      return d;
    }
  });

  B.register({
    type: 'columns', label: 'Colunas', group: 'estrutura', icon: 'columns',
    doc: 'De 2 a 3 colunas lado a lado (empilham no celular). Cada coluna tem sua própria lista de `blocks`.',
    example: { type: 'columns', columns: [{ blocks: [{ type: 'paragraph', text: '**Stack**: rápida, automática.' }] }, { blocks: [{ type: 'paragraph', text: '**Heap**: flexível, manual.' }] }] },
    defaults: function () { return { columns: [{ blocks: [{ type: 'paragraph', text: 'Coluna 1' }] }, { blocks: [{ type: 'paragraph', text: 'Coluna 2' }] }] }; },
    fields: [{ key: 'columns', label: 'Colunas', kind: 'columns', required: true }],
    summary: function (b) { return (b.columns || []).length + ' colunas'; },
    children: function (b) { return (b.columns || []).map(function (c) { return { key: 'columns', multi: true, blocks: c.blocks || [] }; }); },
    render: function (b, ctx) {
      var cols = b.columns || [];
      var el = h('div', { class: 'b-columns b-columns--' + Math.min(4, Math.max(1, cols.length)) });
      cols.forEach(function (c) { el.appendChild(h('div', { class: 'b-columns__col' }, B.renderList(c.blocks, ctx))); });
      return el;
    }
  });

  B.register({
    type: 'html', label: 'HTML (avançado)', group: 'avancado', icon: 'braces',
    doc: 'Válvula de escape: HTML simples e sanitizado (sem scripts, estilos ou eventos). Prefira os blocos tipados; use `html` só para algo que nenhum outro bloco cobre.',
    example: { type: 'html', html: '<p>Texto com <mark>destaque</mark>.</p>' },
    defaults: function () { return { html: '<p>HTML simples aqui.</p>' }; },
    fields: [{ key: 'html', label: 'HTML', kind: 'code', rows: 8, required: true }],
    summary: function (b) { return String(b.html || '').replace(/<[^>]+>/g, ' '); },
    render: function (b) { return h('div', { class: 'b-html' }, Books.sanitize.html(b.html)); }
  });
})();
