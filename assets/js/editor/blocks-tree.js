(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };
  var F = Books.editorFields;
  var openState = new WeakMap();

  function addMenu(onPick, anchor) {
    var menu = document.getElementById('blockAddMenu');
    Books.util.clear(menu);
    var byGroup = {};
    Books.blocks.list().forEach(function (def) { (byGroup[def.group] = byGroup[def.group] || []).push(def); });
    Books.blocks.GROUPS.forEach(function (g) {
      var defs = byGroup[g[0]];
      if (!defs) return;
      menu.appendChild(h('div', { class: 'add-menu__group' }, g[1]));
      defs.forEach(function (def) {
        var item = h('button', { type: 'button', class: 'add-menu__item' }, Books.icons.get(def.icon || 'file', 15), h('span', null, def.label));
        item.addEventListener('click', function () { close(); onPick(def.type); });
        menu.appendChild(item);
      });
    });
    var rect = anchor.getBoundingClientRect();
    menu.style.left = Math.min(rect.left, window.innerWidth - 260) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    menu.hidden = false;
    function close() { menu.hidden = true; document.removeEventListener('click', onDoc, true); }
    function onDoc(e) { if (!menu.contains(e.target) && e.target !== anchor) close(); }
    setTimeout(function () { document.addEventListener('click', onDoc, true); }, 0);
  }

  function fieldsForBlock(def) { return def.fields.filter(function (f) { return f.key !== 'table'; }); }

  function renderBlockBody(def, block, ctx) {
    var body = h('div', { class: 'block-card__body' });
    if (block.type === 'table') {
      body.appendChild(F.tableEditor(block, ctx.onChange));
      body.appendChild(F.row({ key: 'caption', label: 'Legenda', kind: 'line' }, F.buildControl({ key: 'caption', kind: 'line' }, block, 'caption', ctx.onChange)));
      return body;
    }
    fieldsForBlock(def).forEach(function (field) {
      if (field.kind === 'blocks') {
        block[field.key] = block[field.key] || [];
        body.appendChild(h('div', { class: 'field field--nested' }, h('label', { class: 'field__label' }, field.label),
          renderList(block[field.key], ctx)));
      } else if (field.kind === 'columns') {
        body.appendChild(renderColumns(field, block, ctx));
      } else if (field.kind === 'group-list') {
        block[field.key] = block[field.key] || [];
        body.appendChild(h('div', { class: 'field field--nested' }, h('label', { class: 'field__label' }, field.label),
          F.groupListEditor(field, block[field.key], ctx.onChange, ctx.assetUrl)));
      } else {
        body.appendChild(F.row(field, F.buildControl(field, block, field.key, ctx.onChange, ctx.assetUrl)));
      }
    });
    return body;
  }

  function renderColumns(field, block, ctx) {
    var wrap = h('div', { class: 'field field--nested field--columns' }, h('label', { class: 'field__label' }, field.label));
    var cols = h('div', { class: 'columns-editor' });
    function draw() {
      Books.util.clear(cols);
      (block.columns || []).forEach(function (col, i) {
        col.blocks = col.blocks || [];
        var colBox = h('div', { class: 'columns-editor__col' },
          h('div', { class: 'columns-editor__head' }, h('span', null, 'Coluna ' + (i + 1)),
            h('button', { type: 'button', class: 'btn btn--ghost btn--sm', title: 'remover coluna' }, Books.icons.get('trash', 12))),
          renderList(col.blocks, ctx));
        colBox.querySelector('button').addEventListener('click', function () { if (block.columns.length > 1) { block.columns.splice(i, 1); ctx.onChange(); draw(); } });
        cols.appendChild(colBox);
      });
      if (block.columns.length < 4) {
        var add = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('plus', 12), h('span', null, 'coluna'));
        add.addEventListener('click', function () { block.columns.push({ blocks: [] }); ctx.onChange(); draw(); });
        cols.appendChild(h('div', { class: 'columns-editor__add' }, add));
      }
    }
    draw();
    wrap.appendChild(cols);
    return wrap;
  }

  function blockCard(block, list, index, ctx) {
    var def = Books.blocks.get(block.type);
    var key = openState.has(block) ? openState.get(block) : ctx.defaultOpen;
    var card = h('div', { class: 'block-card', dataset: { type: block.type } });
    var titleField = def.fields.find(function (f) { return f.key === 'title' || f.key === 'text' || f.key === 'summary'; });
    var head = h('div', { class: 'block-card__head' },
      h('button', { type: 'button', class: 'block-card__toggle' }, Books.icons.get(key ? 'down' : 'right', 14)),
      h('span', { class: 'block-card__icon' }, Books.icons.get(def.icon || 'file', 15)),
      h('div', { class: 'block-card__title' }, h('strong', null, def.label), h('span', { class: 'block-card__summary' }, Books.blocks.summary(block) || '(vazio)')),
      h('div', { class: 'block-card__ops' },
        h('button', { type: 'button', class: 'btn btn--icon', title: 'mover para cima', disabled: index === 0 ? true : null }, Books.icons.get('up', 14)),
        h('button', { type: 'button', class: 'btn btn--icon', title: 'mover para baixo', disabled: index === list.length - 1 ? true : null }, Books.icons.get('down', 14)),
        h('button', { type: 'button', class: 'btn btn--icon', title: 'duplicar' }, Books.icons.get('copy', 14)),
        h('button', { type: 'button', class: 'btn btn--icon btn--danger', title: 'excluir' }, Books.icons.get('trash', 14))));
    var ops = head.querySelectorAll('.block-card__ops button');
    ops[0].addEventListener('click', function () { if (index > 0) { list.splice(index, 1, list.splice(index - 1, 1, list[index])[0]); ctx.onChange(true); } });
    ops[1].addEventListener('click', function () { if (index < list.length - 1) { list.splice(index, 1, list.splice(index + 1, 1, list[index])[0]); ctx.onChange(true); } });
    ops[2].addEventListener('click', function () { list.splice(index + 1, 0, JSON.parse(JSON.stringify(block))); ctx.onChange(true); });
    ops[3].addEventListener('click', function () { if (confirm('Excluir este bloco (' + def.label + ')? Isso também remove o conteúdo dentro dele.')) { list.splice(index, 1); ctx.onChange(true); } });
    function toggle() { var next = !openState.get(block); openState.set(block, next); ctx.onChange(true); }
    head.querySelector('.block-card__toggle').addEventListener('click', toggle);
    head.addEventListener('click', function (e) { if (!e.target.closest('.block-card__ops') && !e.target.closest('.block-card__toggle')) toggle(); });
    card.appendChild(head);
    if (key) card.appendChild(renderBlockBody(def, block, Object.assign({}, ctx, { onChange: function () { ctx.onChange(); head.querySelector('.block-card__summary').textContent = Books.blocks.summary(block) || '(vazio)'; } })));
    if (!openState.has(block)) openState.set(block, ctx.defaultOpen);
    return card;
  }

  function renderList(list, parentCtx) {
    var ctx = Object.assign({ defaultOpen: false }, parentCtx);
    var wrap = h('div', { class: 'block-list' });
    function draw() {
      Books.util.clear(wrap);
      list.forEach(function (block, i) { wrap.appendChild(blockCard(block, list, i, Object.assign({}, ctx, { onChange: change }))); });
      var addBtn = h('button', { type: 'button', class: 'btn btn--dashed' }, Books.icons.get('plus', 14), h('span', null, 'adicionar bloco'));
      addBtn.addEventListener('click', function () {
        addMenu(function (type) { var b = Books.blocks.create(type); openState.set(b, true); list.push(b); change(true); }, addBtn);
      });
      wrap.appendChild(addBtn);
    }
    function change(needsRedraw) { ctx.onChange && ctx.onChange(); if (needsRedraw) draw(); }
    draw();
    wrap.redraw = draw;
    return wrap;
  }

  Books.editorBlocks = { renderList: renderList };
})();
