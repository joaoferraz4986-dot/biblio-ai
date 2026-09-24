/*
 * Renderização genérica de campos de bloco a partir da definição em Books.blocks.
 * Um único lugar entende cada `kind` de campo (ver registry.js) — usado tanto pelo
 * editor de blocos quanto, futuramente, por qualquer outro formulário do mesmo formato.
 */
(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };

  function row(field, control, extra) {
    var id = 'f-' + Books.util.uid('field');
    var label = h('label', { class: 'field__label', for: id }, field.label, field.required ? h('span', { class: 'field__req', 'aria-hidden': 'true' }, ' *') : null);
    var wrap = h('div', { class: 'field field--' + field.kind }, label, control, extra || null);
    control.id = control.id || id;
    return wrap;
  }

  function textInput(value, onChange, opts) {
    var el = h('input', Object.assign({ type: 'text', value: value || '' }, opts || {}));
    el.addEventListener('input', function () { onChange(el.value); });
    return el;
  }
  function textArea(value, onChange, rows) {
    var el = h('textarea', { rows: rows || 4 }, value || '');
    el.value = value || '';
    el.addEventListener('input', function () { onChange(el.value); });
    return el;
  }
  function monoArea(value, onChange, rows) {
    var el = textArea(value, onChange, rows);
    el.classList.add('field__mono');
    el.spellcheck = false;
    el.wrap = 'off';
    return el;
  }
  function checkbox(value, onChange) {
    var wrap = h('label', { class: 'field__check' });
    var el = h('input', { type: 'checkbox' });
    el.checked = !!value;
    el.addEventListener('change', function () { onChange(el.checked); });
    wrap.appendChild(el);
    wrap.appendChild(document.createTextNode(' ativado'));
    wrap.htmlFor = '';
    return wrap;
  }
  function select(value, options, onChange) {
    var el = h('select');
    options.forEach(function (o) { el.appendChild(h('option', { value: o[0] }, o[1])); });
    el.value = value;
    el.addEventListener('change', function () { onChange(el.tagName ? el.value : el.value); });
    return el;
  }
  function accentPicker(value, onChange) {
    var wrap = h('div', { class: 'accent-picker' });
    var presetHex = { blue: '#76a9fa', teal: '#2dd4bf', amber: '#f2b84b', gray: '#9aa7b4', violet: '#b39ef3', orange: '#f2955c', pink: '#f19ec2', slate: '#8fa3c8', green: '#6fcf7d', red: '#f27272', cyan: '#63d4e8' };
    function currentHex() { return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : presetHex[Books.schema.accentId(value)] || '#76a9fa'; }
    var color = h('input', { type: 'color', value: currentHex(), class: 'accent-picker__color', title: 'Escolher cor' });
    var swatch = h('button', { type: 'button', class: 'accent-picker__current', title: 'Clique para escolher a cor' });
    var custom = textInput(Books.schema.accentId(value) ? '' : (value || ''), function (v) { value = v; color.value = currentHex(); update(); onChange(v); }, { placeholder: '#hex', class: 'accent-picker__custom', inputMode: 'text' });
    function update() {
      swatch.style.background = Books.schema.accentCss(value) || currentHex();
      swatch.setAttribute('aria-label', 'Cor selecionada ' + (value || 'blue'));
      color.value = currentHex();
    }
    swatch.addEventListener('click', function () { color.click(); });
    color.addEventListener('input', function () { value = color.value; custom.value = color.value; update(); onChange(value); });
    wrap.appendChild(swatch); wrap.appendChild(color); wrap.appendChild(custom); update();
    return wrap;
  }
  function imagePicker(obj, key, onChange, resolveAsset) {
    var value = obj[key];
    var wrap = h('div', { class: 'image-picker' });
    var preview = h('div', { class: 'image-picker__preview', style: { aspectRatio: Books.util.aspectRatioCss(obj.ratio) } });
    function renderPreview() {
      Books.util.clear(preview);
      var src = Books.util.safeUrl(value);
      // Resolve caminhos relativos (ex.: "images/foo.png") contra a pasta do livro, na mesma ordem
      // que o leitor usa (safeUrl → assetUrl) — sem isso, editar a capa/imagem de um livro já salvo
      // mostrava sempre "sem imagem" (o caminho relativo era tratado como se fosse a partir da raiz
      // do site em vez de content/packages/<id>/…).
      if (src && resolveAsset) src = resolveAsset(src);
      if (src) preview.appendChild(h('img', { src: src, alt: '' }));
      else preview.appendChild(h('span', null, 'sem imagem'));
    }
    var urlInput = textInput(value, function (v) { value = v; onChange(v); renderPreview(); }, { placeholder: 'caminho, URL https:// (baixada ao salvar) ou envie um arquivo' });
    var file = h('input', { type: 'file', accept: 'image/*', class: 'image-picker__file' });
    file.addEventListener('change', function () {
      var f = file.files[0];
      if (!f) return;
      Books.util.readFileAsDataUrl(f).then(function (dataUrl) { value = dataUrl; urlInput.value = dataUrl; onChange(dataUrl); renderPreview(); });
    });
    var pick = h('button', { type: 'button', class: 'btn btn--ghost' }, Books.icons.get('upload', 14), h('span', null, 'enviar arquivo'));
    pick.addEventListener('click', function () { file.click(); });
    renderPreview();
    wrap.appendChild(preview);
    wrap.appendChild(h('div', { class: 'image-picker__row' }, urlInput, pick, file));
    // exposto para quem tiver um campo de proporção irmão (ex.: capa do livro) atualizar a prévia ao vivo.
    wrap.updatePreviewRatio = function (ratio) { preview.style.setProperty('aspect-ratio', Books.util.aspectRatioCss(ratio)); };
    return wrap;
  }

  function historyImagePicker(obj, key, onChange, resolveAsset) {
    obj[key] = obj[key] || { src: '', alt: '' };
    var image = obj[key];
    var wrap = h('div', { class: 'history-image-editor' });
    var picker = imagePicker(image, 'src', function (v) { image.src = v; onChange(image); }, resolveAsset);
    wrap.appendChild(picker);
    wrap.appendChild(row({ key: 'alt', label: 'Texto alternativo', kind: 'line', required: true }, textInput(image.alt, function (v) { image.alt = v; onChange(image); })));
    return wrap;
  }

  /* ---- itens de lista (texto simples, 2 espaços = sub-nível) ---- */
  function itemsToText(items, depth) {
    depth = depth || 0;
    return (items || []).map(function (it) {
      var text = typeof it === 'string' ? it : it.text;
      var line = '  '.repeat(depth) + text;
      var sub = typeof it === 'object' && it.items ? itemsToText(it.items, depth + 1) : '';
      return sub ? line + '\n' + sub : line;
    }).join('\n');
  }
  function textToItems(text) {
    var lines = String(text || '').split('\n').filter(function (l) { return l.trim(); });
    var root = [], stack = [{ indent: -1, list: root }];
    lines.forEach(function (line) {
      var indent = Math.floor((line.match(/^ */)[0].length) / 2);
      var content = line.replace(/^ +/, '');
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      var item = content;
      var parentList = stack[stack.length - 1].list;
      parentList.push(item);
      stack.push({ indent: indent, list: null, ref: item, parentList: parentList });
    });
    // segunda passada: transforma item que tem filhos em objeto {text, items}
    function attach(list) { return list; }
    // implementação simplificada: refazer com pilha de objetos
    root.length = 0; stack.length = 0;
    stack.push({ indent: -1, items: root });
    lines.forEach(function (line) {
      var indent = Math.floor((line.match(/^ */)[0].length) / 2);
      var content = line.replace(/^ +/, '');
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      var parent = stack[stack.length - 1];
      var node = { text: content, items: [] };
      var last = parent.items[parent.items.length - 1];
      parent.items.push(node);
      stack.push({ indent: indent, items: node.items });
    });
    function simplify(items) { return items.map(function (it) { return it.items.length ? { text: it.text, items: simplify(it.items) } : it.text; }); }
    return simplify(root);
  }

  /* ---- tabela ---- */
  function tableEditor(block, onChange) {
    var wrap = h('div', { class: 'table-editor' });
    function cols() { return Math.max(1, (block.header || []).length); }
    function renderGrid() {
      Books.util.clear(wrap);
      var grid = h('div', { class: 'table-editor__grid' });
      grid.style.setProperty('--cols', cols());
      (block.header || []).forEach(function (val, c) {
        var input = textInput(val, function (v) { block.header[c] = v; onChange(); });
        input.classList.add('table-editor__cell', 'is-header');
        grid.appendChild(input);
      });
      var rmCol = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', title: 'remover última coluna' }, Books.icons.get('minus', 12));
      rmCol.addEventListener('click', function () {
        if (cols() <= 1) return;
        block.header.pop(); (block.rows || []).forEach(function (r) { r.pop(); }); onChange(); renderGrid();
      });
      grid.appendChild(rmCol);
      (block.rows || []).forEach(function (rowArr, r) {
        rowArr.forEach(function (val, c) {
          var input = textInput(val, function (v) { block.rows[r][c] = v; onChange(); });
          input.classList.add('table-editor__cell');
          grid.appendChild(input);
        });
        var rmRow = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', title: 'remover linha' }, Books.icons.get('trash', 12));
        rmRow.addEventListener('click', function () { block.rows.splice(r, 1); onChange(); renderGrid(); });
        grid.appendChild(rmRow);
      });
      wrap.appendChild(grid);
      var actions = h('div', { class: 'table-editor__actions' },
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('plus', 12), h('span', null, 'coluna')),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('plus', 12), h('span', null, 'linha')));
      actions.children[0].addEventListener('click', function () { block.header.push('Coluna'); (block.rows || []).forEach(function (r) { r.push(''); }); onChange(); renderGrid(); });
      actions.children[1].addEventListener('click', function () { block.rows = block.rows || []; block.rows.push(block.header.map(function () { return ''; })); onChange(); renderGrid(); });
      wrap.appendChild(actions);
    }
    renderGrid();
    return wrap;
  }

  /* ---- lista de objetos (steps) ---- */
  function groupListEditor(field, items, onChange, resolveAsset) {
    var wrap = h('div', { class: 'group-list' });
    function draw() {
      Books.util.clear(wrap);
      items.forEach(function (item, i) {
        var card = h('div', { class: 'group-list__item' },
          h('div', { class: 'group-list__head' }, h('span', null, field.itemLabel + ' ' + (i + 1)),
            h('button', { type: 'button', class: 'btn btn--ghost btn--sm', title: 'remover' }, Books.icons.get('trash', 12))));
        card.querySelector('button').addEventListener('click', function () { items.splice(i, 1); onChange(); draw(); });
        field.fields.forEach(function (f) {
          card.appendChild(row(f, buildControl(f, item, f.key, function () { onChange(); }, resolveAsset)));
        });
        wrap.appendChild(card);
      });
      var add = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('plus', 12), h('span', null, 'adicionar ' + field.itemLabel.toLowerCase()));
      add.addEventListener('click', function () {
        var blank = {}; field.fields.forEach(function (f) { blank[f.key] = f.kind === 'bool' ? false : ''; });
        items.push(blank); onChange(); draw();
      });
      wrap.appendChild(add);
    }
    draw();
    return wrap;
  }

  /** Constrói o controle para um campo simples (usado por formulários de bloco e listas aninhadas).
   * `resolveAsset`, quando fornecido, resolve caminhos relativos de imagem contra a pasta do livro
   * (ignorado por todo `kind` que não seja 'image'). */
  function buildControl(field, obj, key, notify, resolveAsset) {
    var value = obj[key];
    var set = function (v) { obj[key] = v; notify(); };
    switch (field.kind) {
      case 'line': return textInput(value, set, { placeholder: field.placeholder || '' });
      case 'plain': return textInput(value, set, { placeholder: field.placeholder || '' });
      case 'lines': return textInput(value, set, { placeholder: 'ex.: 2,4-6' });
      case 'text': return textArea(value, set, field.rows);
      case 'code': return monoArea(value, set, field.rows);
      case 'bool': return checkbox(value, set);
      case 'select': return select(String(value), field.options.map(function (o) { return [String(o[0]), o[1]]; }), function (v) {
        var raw = field.options.find(function (o) { return String(o[0]) === v; });
        set(field.number ? Number(v) : (raw ? raw[0] : v));
      });
      case 'accent': return accentPicker(value, set);
      case 'image': return imagePicker(obj, key, set, resolveAsset);
      case 'history-image': return historyImagePicker(obj, key, set, resolveAsset);
      case 'items': return textArea(itemsToText(value), function (t) { set(textToItems(t)); }, 5);
      default: return textInput(String(value == null ? '' : value), set);
    }
  }

  Books.editorFields = { row: row, buildControl: buildControl, tableEditor: tableEditor, groupListEditor: groupListEditor,
    itemsToText: itemsToText, textToItems: textToItems, textInput: textInput, textArea: textArea, monoArea: monoArea };
})();
