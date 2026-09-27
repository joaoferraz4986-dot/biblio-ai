(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };

  B.register({
    type: 'table', label: 'Tabela', group: 'dados', icon: 'table',
    doc: 'Tabela simples. `header` é a lista de títulos de coluna; `rows` é uma lista de linhas, cada uma com uma string (marcação inline) por coluna. Toda linha deve ter o mesmo número de colunas que `header`. Use `{ok|Sim}`, `{bad|Não}`, `{warn|Talvez}` para células coloridas e `\\n` para quebra de linha dentro da célula.',
    example: { type: 'table', caption: 'Regiões', header: ['Região', 'Guarda', 'Cresce'], rows: [['`.text`', 'código', '{dim|não}'], ['stack', 'quadros de função', 'para baixo']] },
    defaults: function () { return { caption: '', header: ['Coluna A', 'Coluna B'], rows: [['', ''], ['', '']] }; },
    fields: [
      { key: 'table', label: 'Tabela', kind: 'table', required: true },
      { key: 'caption', label: 'Legenda', kind: 'line' }
    ],
    summary: function (b) { return (b.header || []).map(function (c) { return Books.inline.toPlain(c); }).join(' | ') + ' (' + (b.rows || []).length + ' linhas)'; },
    render: function (b) {
      var head = b.header || [];
      var cols = Math.max(head.length, (b.rows || []).reduce(function (m, r) { return Math.max(m, r.length); }, 0));
      var table = h('table', { class: 'b-table__table' });
      if (b.caption) table.appendChild(h('caption', null, Books.inline.render(b.caption)));
      if (head.length) {
        var tr = h('tr');
        for (var c = 0; c < cols; c++) tr.appendChild(h('th', { scope: 'col' }, Books.inline.render(head[c] || '')));
        table.appendChild(h('thead', null, tr));
      }
      var tbody = h('tbody');
      (b.rows || []).forEach(function (row) {
        var r = h('tr');
        for (var c = 0; c < cols; c++) r.appendChild(h('td', null, Books.inline.render(row[c] || '')));
        tbody.appendChild(r);
      });
      table.appendChild(tbody);
      return h('div', { class: 'b-table' }, h('div', { class: 'b-table__scroll', tabindex: '0' }, table));
    }
  });
})();
