(function () {
  'use strict';

  var types = {};
  var order = [];

  var GROUPS = [
    ['texto', 'Texto'], ['codigo', 'Código'], ['diagrama', 'Diagramas e mídia'],
    ['midia', 'Mídia incorporada'], ['dados', 'Dados'], ['estrutura', 'Estrutura'], ['avancado', 'Avançado']
  ];

  function register(def) {
    if (!def || !def.type) throw new Error('Bloco sem `type`.');
    types[def.type] = def;
    if (order.indexOf(def.type) === -1) order.push(def.type);
  }
  function get(type) { return types[type] || null; }
  function list() { return order.map(function (t) { return types[t]; }); }

  function create(type, overrides) {
    var def = types[type];
    if (!def) throw new Error('Tipo de bloco desconhecido: ' + type);
    var base = def.defaults ? def.defaults() : {};
    var block = { type: type };
    Object.keys(base).forEach(function (k) { block[k] = base[k]; });
    if (overrides) Object.keys(overrides).forEach(function (k) { block[k] = overrides[k]; });
    return block;
  }

  function walk(blocks, fn, path) {
    (blocks || []).forEach(function (block, index) {
      var here = (path || '') + '[' + index + ']';
      fn(block, here, blocks, index);
      var def = block && types[block.type];
      if (def && def.children) {
        def.children(block).forEach(function (childList, ci) { walk(childList.blocks, fn, here + '.' + childList.key + (childList.multi ? '[' + ci + ']' : '') + ''); });
      }
    });
  }

  function summary(block) {
    var def = types[block && block.type];
    var text = '';
    try { text = def && def.summary ? def.summary(block) : ''; } catch (e) { text = ''; }
    text = String(text || '').replace(/\s+/g, ' ').trim();
    return text.length > 90 ? text.slice(0, 87) + '…' : text;
  }

  function errorBox(block, error) {
    var h = Books.util.h;
    return h('div', { class: 'b-error', role: 'alert' },
      h('strong', null, 'Não foi possível exibir este bloco'),
      h('p', null, (block && block.type ? '(' + block.type + ') ' : '') + (error && error.message ? error.message : String(error))));
  }

  function render(block, ctx) {
    var def = block && types[block.type];
    if (!def) return errorBox(block, new Error('tipo de bloco desconhecido'));
    var el;
    try { el = def.render(block, ctx || {}); } catch (e) { console.error('[blocks]', block.type, e); return errorBox(block, e); }
    el.dataset.block = block.type;
    if (Books.blockContext && Books.blockContext.bind) Books.blockContext.bind(el, block);
    try { el.dataset.blockJson = JSON.stringify(block); } catch (e) { }
    if (block.id && !el.id) el.id = block.id;
    return el;
  }
  function renderList(blocks, ctx) {
    var frag = document.createDocumentFragment();
    (blocks || []).forEach(function (b) { frag.appendChild(render(b, ctx)); });
    return frag;
  }

  Books.blocks = { GROUPS: GROUPS, register: register, get: get, list: list, create: create, walk: walk,
    summary: summary, render: render, renderList: renderList };
})();
