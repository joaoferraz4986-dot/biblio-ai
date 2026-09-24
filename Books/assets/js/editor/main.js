/*
 * Editor: painel completo para criar/editar um livro — informações, capa, seções (com
 * edição visual de blocos) e importação/exportação de JSON (para colar conteúdo pronto,
 * inclusive gerado por IA). Ver docs/FORMATO-DO-LIVRO.md para o formato e docs/PROMPT-IA.md
 * para o prompt sugerido ao pedir um livro completo a uma IA.
 */
(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };
  var els = {}, pkg = null, activeTab = 'info', activeSection = null, dirHandle = null;

  /** Resolve o caminho de uma imagem (capa, bloco de diagrama, etc.) contra a pasta do livro sendo
   * editado — mesmo resolvedor que o leitor usa (Books.repo.assetUrl) — para a prévia no editor
   * mostrar imagens já existentes em vez de "sem imagem". */
  function resolveAsset(src) { return Books.repo ? Books.repo.assetUrl(pkg.manifest.id, src) : src; }

  function blankPackage(id, title) {
    return {
      manifest: { schema: Books.schema.SCHEMAS.package, kind: 'book-package', id: id, title: title, description: '', language: 'pt-BR', tags: [] },
      header: { schema: Books.schema.SCHEMAS.header, kind: 'book-header', id: id + '-header', kicker: '', title: title, subtitle: '', guideTitle: 'Como usar este livro', guideText: '', cover: null, legend: [], footer: '' },
      sections: [{ schema: Books.schema.SCHEMAS.section, kind: 'book-section', id: 'introducao', number: '1', title: 'Introdução', blocks: [Books.blocks.create('paragraph', { text: 'Comece a escrever aqui.', lead: true })] }]
    };
  }

  /* ───────────── validação e estado sujo ───────────── */
  function refreshValidation() {
    var report = Books.validate.package(pkg);
    var box = els.validation;
    Books.util.clear(box);
    if (!report.errors.length && !report.warnings.length) { box.hidden = true; return; }
    box.hidden = false;
    report.errors.forEach(function (e) { box.appendChild(h('div', { class: 'validation__item is-error' }, Books.icons.get('alert', 14), h('code', null, e.path), ' — ' + e.message)); });
    report.warnings.forEach(function (w) { box.appendChild(h('div', { class: 'validation__item is-warn' }, Books.icons.get('info', 14), h('code', null, w.path), ' — ' + w.message)); });
    els.saveBtn.disabled = report.errors.length > 0;
    document.querySelectorAll('[data-editor-export]').forEach(function (button) { button.disabled = report.errors.length > 0; });
    return report;
  }
  function markDirty() { Books.state.dirty = true; refreshValidation(); }

  /* ───────────── aba: informações ───────────── */
  function renderInfo() {
    var m = pkg.manifest, hd = pkg.header;
    var wrap = h('div', { class: 'editor-panel' });
    function f(label, obj, key, kind, extra) { return Books.editorFields.row({ key: key, label: label, kind: kind }, Books.editorFields.buildControl({ key: key, kind: kind }, obj, key, markDirty), extra); }
    wrap.appendChild(h('h3', null, 'Identidade do livro'));
    wrap.appendChild(f('ID (usado em pastas e links; não mude após publicar)', m, 'id', 'plain'));
    wrap.appendChild(f('Título do catálogo', m, 'title', 'line'));
    wrap.appendChild(f('Descrição (aparece na biblioteca)', m, 'description', 'text'));
    wrap.appendChild(f('Tags (separadas por vírgula)', { tags: (m.tags || []).join(', ') }, 'tags', 'line'));
    wrap.lastChild.querySelector('input').addEventListener('input', function (e) { m.tags = e.target.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); markDirty(); });
    wrap.appendChild(h('h3', null, 'Capa de texto (topo do livro)'));
    wrap.appendChild(f('Selo (kicker, pequeno texto acima do título)', hd, 'kicker', 'line'));
    wrap.appendChild(f('Título grande', hd, 'title', 'line'));
    wrap.appendChild(f('Subtítulo', hd, 'subtitle', 'text'));
    wrap.appendChild(f('Título do quadro de leitura', hd, 'guideTitle', 'line'));
    wrap.appendChild(f('Texto do quadro de leitura', hd, 'guideText', 'text'));
    wrap.appendChild(f('Rodapé', hd, 'footer', 'text'));
    wrap.appendChild(h('h3', null, 'Legenda de cores'));
    wrap.appendChild(legendEditor(hd));
    return wrap;
  }
  function legendEditor(hd) {
    hd.legend = hd.legend || [];
    var box = h('div', { class: 'legend-editor' });
    function draw() {
      Books.util.clear(box);
      hd.legend.forEach(function (item, i) {
        var labelInput = Books.editorFields.textInput(item.label, function (v) { item.label = v; markDirty(); });
        var accent = Books.editorFields.buildControl({ kind: 'accent' }, item, 'color', markDirty);
        var rm = h('button', { type: 'button', class: 'btn btn--icon btn--danger' }, Books.icons.get('trash', 13));
        rm.addEventListener('click', function () { hd.legend.splice(i, 1); markDirty(); draw(); });
        box.appendChild(h('div', { class: 'legend-editor__row' }, accent, labelInput, rm));
      });
      var add = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('plus', 13), h('span', null, 'adicionar item'));
      add.addEventListener('click', function () { hd.legend.push({ label: 'Novo item', color: 'blue' }); markDirty(); draw(); });
      box.appendChild(add);
    }
    draw();
    return box;
  }

  /* ───────────── aba: capa ───────────── */
  function renderCover() {
    var hd = pkg.header;
    hd.cover = hd.cover || { src: '', alt: '', ratio: '16:9' };
    var wrap = h('div', { class: 'editor-panel' });
    wrap.appendChild(h('h3', null, 'Imagem de capa'));
    wrap.appendChild(h('p', { class: 'hint' }, 'Aparece na biblioteca e pode ser reaproveitada onde o tema do livro precisar. Envie um arquivo ou informe um caminho/URL.'));
    var imageControl = Books.editorFields.buildControl({ kind: 'image' }, hd.cover, 'src', markDirty, resolveAsset);
    wrap.appendChild(Books.editorFields.row({ label: 'Imagem', kind: 'image' }, imageControl));
    wrap.appendChild(Books.editorFields.row({ label: 'Texto alternativo', kind: 'line' }, Books.editorFields.buildControl({ kind: 'line' }, hd.cover, 'alt', markDirty)));
    var ratioControl = Books.editorFields.buildControl({ kind: 'select', options: [['16:9', '16:9 (paisagem)'], ['3:4', '3:4 (retrato)'], ['1:1', '1:1 (quadrada)'], ['9:16', '9:16 (vertical)']] }, hd.cover, 'ratio', function () { markDirty(); imageControl.updatePreviewRatio(hd.cover.ratio); });
    wrap.appendChild(Books.editorFields.row({ label: 'Proporção', kind: 'select' }, ratioControl));
    var clear = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('trash', 13), h('span', null, 'remover capa'));
    clear.addEventListener('click', function () { hd.cover = null; markDirty(); renderTab(); });
    wrap.appendChild(clear);
    return wrap;
  }

  /* ───────────── aba: seções ───────────── */
  function sectionMeta(section) {
    var box = h('div', { class: 'section-meta' });
    function f(label, key, kind, extra) { return Books.editorFields.row({ key: key, label: label, kind: kind }, Books.editorFields.buildControl({ key: key, kind: kind }, section, key, function () { markDirty(); renderSectionsList(); }), extra); }
    box.appendChild(f('ID (âncora, sem espaços)', 'id', 'plain'));
    box.appendChild(f('Número (ex.: 1, 2.3)', 'number', 'plain'));
    box.appendChild(f('Título', 'title', 'line'));
    return box;
  }
  function renderSectionsList() {
    var box = Books.util.clear(els.sectionsList);
    pkg.sections.forEach(function (section, i) {
      var item = h('div', { class: 'section-item' + (activeSection === section ? ' is-active' : '') },
        h('span', { class: 'section-item__num' }, section.number || '–'),
        h('span', { class: 'section-item__title' }, Books.inline.toPlain(section.title) || '(sem título)'),
        h('div', { class: 'section-item__ops' },
          h('button', { type: 'button', class: 'btn btn--icon', title: 'mover para cima', disabled: i === 0 ? true : null }, Books.icons.get('up', 13)),
          h('button', { type: 'button', class: 'btn btn--icon', title: 'mover para baixo', disabled: i === pkg.sections.length - 1 ? true : null }, Books.icons.get('down', 13)),
          h('button', { type: 'button', class: 'btn btn--icon btn--danger', title: 'excluir seção' }, Books.icons.get('trash', 13))));
      item.addEventListener('click', function (e) { if (e.target.closest('button')) return; activeSection = section; renderSectionEditor(); renderSectionsList(); });
      var ops = item.querySelectorAll('.section-item__ops button');
      ops[0].addEventListener('click', function (e) { e.stopPropagation(); if (i > 0) { pkg.sections.splice(i, 1, pkg.sections.splice(i - 1, 1, pkg.sections[i])[0]); markDirty(); renderSectionsList(); } });
      ops[1].addEventListener('click', function (e) { e.stopPropagation(); if (i < pkg.sections.length - 1) { pkg.sections.splice(i, 1, pkg.sections.splice(i + 1, 1, pkg.sections[i])[0]); markDirty(); renderSectionsList(); } });
      ops[2].addEventListener('click', function (e) {
        e.stopPropagation();
        if (!confirm('Excluir a seção "' + Books.inline.toPlain(section.title) + '" e todo o seu conteúdo?')) return;
        pkg.sections.splice(i, 1);
        if (activeSection === section) activeSection = pkg.sections[0] || null;
        markDirty(); renderSectionsList(); renderSectionEditor();
      });
      box.appendChild(item);
    });
    var add = h('button', { type: 'button', class: 'btn btn--dashed' }, Books.icons.get('plus', 14), h('span', null, 'nova seção'));
    add.addEventListener('click', function () {
      var s = { schema: Books.schema.SCHEMAS.section, kind: 'book-section', id: 'secao-' + Books.util.uid(''), number: String(pkg.sections.length + 1), title: 'Nova seção', blocks: [] };
      pkg.sections.push(s); activeSection = s; markDirty(); renderSectionsList(); renderSectionEditor();
    });
    box.appendChild(add);
  }
  function renderSectionEditor() {
    var box = Books.util.clear(els.sectionEditor);
    if (!activeSection) { box.appendChild(h('p', { class: 'hint' }, 'Selecione ou crie uma seção à esquerda.')); return; }
    box.appendChild(sectionMeta(activeSection));
    box.appendChild(h('h4', null, 'Conteúdo'));
    activeSection.blocks = activeSection.blocks || [];
    box.appendChild(Books.editorBlocks.renderList(activeSection.blocks, { onChange: markDirty, defaultOpen: activeSection.blocks.length <= 3, assetUrl: resolveAsset }));
  }
  function renderSections() {
    var wrap = h('div', { class: 'editor-panel editor-panel--sections' },
      h('div', { class: 'sections-layout' },
        h('div', { class: 'sections-layout__list', id: 'sectionsListMount' }),
        h('div', { class: 'sections-layout__editor', id: 'sectionEditorMount' })));
    els.sectionsList = wrap.querySelector('#sectionsListMount');
    els.sectionEditor = wrap.querySelector('#sectionEditorMount');
    if (!activeSection) activeSection = pkg.sections[0] || null;
    renderSectionsList();
    renderSectionEditor();
    return wrap;
  }

  function bytesToDataUrl(bytes, mime) {
    var binary = '', chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return 'data:' + (mime || 'application/octet-stream') + ';base64,' + btoa(binary);
  }
  function zipMime(name) {
    var ext = String(name || '').split('.').pop().toLowerCase();
    return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' })[ext] || 'application/octet-stream';
  }
  function importZip(file) {
    return Books.zip.read(file).then(function (entries) {
      var byName = {}; entries.forEach(function (entry) { byName[entry.name.replace(/^\.\//, '')] = entry; });
      var manifestEntry = entries.find(function (entry) { return /(^|\/)manifest\.json$/i.test(entry.name); });
      if (!manifestEntry) throw new Error('O ZIP precisa conter manifest.json.');
      var manifest = JSON.parse(manifestEntry.text());
      var manifestParts = manifestEntry.name.split('/'); manifestParts.pop();
      var root = manifestParts.length ? manifestParts.join('/') + '/' : '';
      function entryFor(path) { return byName[root + String(path || '').replace(/^\//, '')] || byName[String(path || '').replace(/^\//, '')]; }
      var headerEntry = entryFor(manifest.header || 'header.json');
      if (!headerEntry) throw new Error('O ZIP não contém o header.json indicado pelo manifest.');
      var header = JSON.parse(headerEntry.text());
      var sections = (manifest.sections || []).map(function (path) {
        var entry = entryFor(path); if (!entry) throw new Error('Seção não encontrada no ZIP: ' + path);
        return JSON.parse(entry.text());
      });
      function localizeImageRef(src) {
        if (!src || /^(data:|https?:|blob:|\/)/i.test(src)) return src;
        var imageEntry = entryFor(src);
        return imageEntry ? bytesToDataUrl(imageEntry.data, zipMime(imageEntry.name)) : src;
      }
      if (header.cover && header.cover.src) header.cover.src = localizeImageRef(header.cover.src);
      sections.forEach(function (section) { Books.blocks.walk(section.blocks, function (block) { if (block.type === 'image' && block.src) block.src = localizeImageRef(block.src); }); });
      pkg = Books.migrate.normalizePackage({ manifest: manifest, header: header, sections: sections });
      activeSection = pkg.sections[0] || null;
      Books.state.dirty = true;
      return pkg;
    });
  }
  function copyPromptZip(book) {
    var prompt = Books.aiPrompt.build(book);
    var example = JSON.stringify({
      schema: 'books.section.v2', kind: 'book-section', id: 'exemplo', number: '1', title: 'Exemplo mínimo',
      blocks: [{ type: 'paragraph', text: 'Conteúdo com **marcação inline**.' }, { type: 'history', name: 'Pessoa ou ideia', shortBio: 'Descrição curta.', insight: 'Explique o porquê e/ou como.', image: { src: 'images/exemplo.svg', alt: 'Ilustração do exemplo' } }]
    }, null, 2) + '\n';
    var readme = ['PACOTE DE ESPECIFICAÇÕES BOOKS', '', 'PROMPT-IA.txt é o prompt completo gerado pelo editor.', 'FORMATO-DO-LIVRO.md resume o contrato e os blocos registrados.', 'EXEMPLO-minimo.json é uma seção válida para colar no editor.', 'Não inclua HTML executável, scripts, URLs externas ou caminhos com .. em livros gerados.', 'O bloco history usa name, shortBio, insight e image {src, alt}; direitos ficam no image-rights.json do pacote.'].join('\n') + '\n';
    var blob = Books.zip.build([
      { name: 'PROMPT-IA.txt', data: prompt },
      { name: 'FORMATO-DO-LIVRO.md', data: prompt },
      { name: 'README.txt', data: readme },
      { name: 'EXEMPLO-minimo.json', data: example },
      { name: 'schemas/history.json', data: JSON.stringify({ type: 'history', fields: ['name', 'shortBio', 'insight', 'image.src', 'image.alt'] }, null, 2) + '\n' }
    ]);
    if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
      navigator.clipboard.write([new ClipboardItem({ 'application/zip': blob })]).then(function () { Books.toast.show('ZIP do prompt copiado para a área de transferência.', { tone: 'ok' }); }).catch(function () { Books.util.copyText(Books.aiPrompt.build(book)).then(function () { Books.toast.show('O navegador não permitiu ZIP na área de transferência; prompt em texto copiado.', { tone: 'ok' }); }); });
    } else {
      Books.util.copyText(Books.aiPrompt.build(book)).then(function () { Books.toast.show('ZIP não é aceito na área de transferência deste navegador; prompt em texto copiado.', { tone: 'ok' }); });
    }
  }

  /* ───────────── aba: importar / exportar JSON ───────────── */
  function renderImport() {
    var wrap = h('div', { class: 'editor-panel' });
    var exportActions = h('div', { class: 'editor-import__actions' });
    var exportBtn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', dataset: { editorExport: 'zip' } }, Books.icons.get('download', 13), h('span', null, 'exportar .zip'));
    exportBtn.addEventListener('click', function () { exportZip(); });
    wrap.appendChild(h('div', { class: 'editor-import__head' }, h('div', null, h('h3', null, 'Importar / Exportar'), h('p', { class: 'hint' }, 'Use JSON para colar conteúdo ou ZIP para importar um livro completo com capa, imagens e arquivos relacionados.'))));
    var zipInput = h('input', { type: 'file', accept: 'application/zip,.zip', class: 'editor__file-input' });
    var zipButton = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, Books.icons.get('upload', 13), h('span', null, 'importar .zip'));
    var zipMsg = h('div', { class: 'hint' });
    zipButton.addEventListener('click', function () { zipInput.click(); });
    zipInput.addEventListener('change', function () {
      var file = zipInput.files[0]; if (!file) return;
      importZip(file).then(function () { zipMsg.textContent = 'ZIP carregado. Revise o livro e clique em salvar para gravar os arquivos.'; zipMsg.className = 'hint is-ok'; renderShell(); })
        .catch(function (e) { zipMsg.textContent = 'Não foi possível importar o ZIP: ' + e.message; zipMsg.className = 'hint is-error'; });
    });
    exportBtn.className = 'btn btn--ghost btn--sm';
    wrap.appendChild(h('div', { class: 'editor-import__zip' }, zipButton, exportBtn, zipInput, zipMsg));
    wrap.appendChild(h('h3', null, 'Colar um livro completo (JSON)'));
    wrap.appendChild(h('p', { class: 'hint' }, 'Cole aqui um objeto { "manifest": …, "header": …, "sections": [...] } — por exemplo, a resposta de uma IA a que você pediu um livro. Isso substitui o livro que está sendo editado.'));
    var area = Books.editorFields.monoArea('', function () {}, 10);
    var msg = h('div', { class: 'hint' });
    var apply = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'Carregar');
    apply.addEventListener('click', function () {
      var parsed;
      try { parsed = JSON.parse(area.value); } catch (e) { msg.textContent = 'JSON inválido: ' + e.message; msg.className = 'hint is-error'; return; }
      var normalized = Books.migrate.normalizePackage(parsed);
      var report = Books.validate.package(normalized);
      if (!report.ok()) { msg.textContent = 'Corrigido, mas com problemas: ' + report.errors.slice(0, 3).map(function (e) { return e.path + ' — ' + e.message; }).join('; '); msg.className = 'hint is-error'; }
      else { msg.textContent = 'Livro carregado com sucesso.'; msg.className = 'hint is-ok'; }
      pkg = normalized; activeSection = pkg.sections[0] || null;
      renderShell();
    });
    wrap.appendChild(area); wrap.appendChild(apply); wrap.appendChild(msg);

    wrap.appendChild(h('h3', null, 'Colar uma seção (JSON)'));
    wrap.appendChild(h('p', { class: 'hint' }, 'Cole um objeto de seção { "id", "title", "blocks": [...] }. Se o id já existir, a seção é substituída; senão, é adicionada ao fim.'));
    var sarea = Books.editorFields.monoArea('', function () {}, 6);
    var smsg = h('div', { class: 'hint' });
    var sapply = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'Adicionar / substituir seção');
    sapply.addEventListener('click', function () {
      var parsed;
      try { parsed = JSON.parse(sarea.value); } catch (e) { smsg.textContent = 'JSON inválido: ' + e.message; smsg.className = 'hint is-error'; return; }
      var normalized = Books.migrate.normalizeSection(parsed);
      var report = Books.validate.section(normalized);
      var idx = pkg.sections.findIndex(function (s) { return s.id === normalized.id; });
      if (idx === -1) pkg.sections.push(normalized); else pkg.sections[idx] = normalized;
      activeSection = normalized;
      smsg.textContent = report.ok() ? 'Seção "' + normalized.id + '" carregada.' : 'Carregada com avisos/erros — veja abaixo.';
      smsg.className = report.ok() ? 'hint is-ok' : 'hint is-error';
      markDirty(); activeTab = 'sections'; renderShell();
    });
    wrap.appendChild(sarea); wrap.appendChild(sapply); wrap.appendChild(smsg);

    wrap.appendChild(h('h3', null, 'Exportar JSON deste livro'));
    var exportArea = Books.editorFields.monoArea(JSON.stringify(pkg, null, 2), function () {}, 10);
    exportArea.readOnly = true;
    var copyBtn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('copy', 13), h('span', null, 'copiar'));
    copyBtn.addEventListener('click', function () { Books.util.copyText(exportArea.value).then(function () { Books.toast.show('JSON copiado.'); }); });
    wrap.appendChild(exportArea); wrap.appendChild(copyBtn);

    wrap.appendChild(h('h3', null, 'Pedir a uma IA para escrever este livro'));
    wrap.appendChild(h('p', { class: 'hint' }, 'Copie o prompt completo em texto ou como ZIP. A IA deve devolver um ZIP no formato ideal para importar aqui, com JSONs, capas e imagens na estrutura correta.'));
    var promptBtn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('sparkles', 13), h('span', null, 'copiar prompt para IA'));
    promptBtn.addEventListener('click', function () { Books.util.copyText(Books.aiPrompt.build(pkg)).then(function () { Books.toast.show('Prompt copiado — cole na sua IA preferida.'); }); });
    wrap.appendChild(promptBtn);
    var promptZipBtn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, Books.icons.get('download', 13), h('span', null, 'copiar prompt em ZIP'));
    promptZipBtn.addEventListener('click', function () { copyPromptZip(pkg); });
    wrap.appendChild(promptZipBtn);
    return wrap;
  }

  /* ───────────── shell / abas ───────────── */
  var TABS = [['info', 'Informações', 'file'], ['cover', 'Capa', 'image'], ['sections', 'Seções e conteúdo', 'layers'], ['import', 'Importar / Exportar', 'braces']];
  function renderTab() {
    var body = Books.util.clear(els.body);
    if (activeTab === 'info') body.appendChild(renderInfo());
    else if (activeTab === 'cover') body.appendChild(renderCover());
    else if (activeTab === 'sections') body.appendChild(renderSections());
    else body.appendChild(renderImport());
  }
  function renderTabs() {
    var bar = Books.util.clear(els.tabs);
    TABS.forEach(function (t) {
      var btn = h('button', { type: 'button', class: 'editor-tab' + (activeTab === t[0] ? ' is-active' : ''), dataset: { tab: t[0] } }, Books.icons.get(t[2], 14), h('span', null, t[1]));
      btn.addEventListener('click', function () { activeTab = t[0]; renderShell(); });
      bar.appendChild(btn);
    });
  }
  function renderShell() {
    els.title.textContent = (pkg.manifest.title || 'Novo livro') + ' — edição';
    renderTabs();
    renderTab();
    refreshValidation();
  }

  /* ───────────── salvar ─────────────
   * Duas ações distintas e explícitas (nunca uma cai na outra silenciosamente):
   * "salvar na pasta" grava somente via File System Access API. Exportar ZIP é uma ação
   * separada na aba Importar / Exportar e nunca é acionada por este botão. */
  async function saveOfflineFallback() {
    var offline = await Books.repo.saveOffline({ pkg: pkg, catalog: Books.state.catalog, settings: Books.personalization ? Books.personalization.get() : {} });
    Books.state.catalog = Books.repo.normalizeCatalog(offline.catalog);
    Books.repo.bumpAssetVersion();
    Books.state.pkg = Books.util.clone(offline.pkg);
    pkg = Books.util.clone(offline.pkg);
    Books.state.dirty = false;
    Books.events.emit('catalog:changed', Books.state.pkg);
    Books.toast.show('Salvo neste navegador. As alterações serão carregadas novamente ao abrir o projeto neste navegador.', { tone: 'ok', duration: 6000 });
  }

  async function saveToFolder() {
    var report = refreshValidation();
    if (report && !report.ok()) { Books.toast.show('Corrija os erros antes de salvar.', { tone: 'error' }); return; }
    if (Books.native && Books.native.isAvailable()) {
      try {
        var nativeRoot = Books.native.projectRoot();
        if (!nativeRoot) nativeRoot = await Books.native.chooseProjectDirectory();
        if (!nativeRoot) return;
        var nativeResult = await Books.repo.saveNative({
          root: nativeRoot, pkg: pkg, catalog: Books.state.catalog, progress: Books.progress.all(),
          settings: Books.personalization ? Books.personalization.get() : null,
          resolvePackage: function (id) {
            if (id === pkg.manifest.id) return null;
            var meta = Books.state.catalog.packages.find(function (p) { return p.id === id; });
            return meta ? Books.repo.loadPackage(meta) : Promise.resolve(null);
          }
        });
        Books.state.catalog = Books.repo.normalizeCatalog(nativeResult.catalog);
        Books.repo.bumpAssetVersion();
        Books.state.pkg = Books.util.clone(nativeResult.pkg || pkg);
        pkg = Books.util.clone(nativeResult.pkg || pkg);
        Books.state.dirty = false;
        Books.events.emit('catalog:changed', Books.state.pkg);
        Books.toast.show('Salvo na pasta do projeto.', { tone: 'ok' });
      } catch (e) {
        console.error(e);
        Books.toast.show('Não foi possível salvar na pasta: ' + e.message, { tone: 'error' });
      }
      return;
    }
    if (!window.showDirectoryPicker) {
      try {
        await saveOfflineFallback();
      } catch (e) {
        console.error('[editor] fallback offline:', e);
        Books.toast.show('Não foi possível salvar localmente neste navegador: ' + e.message, { tone: 'error', duration: 6500 });
      }
      return;
    }
    var handle;
    try {
      handle = dirHandle || await window.showDirectoryPicker({ id: 'books-project', mode: 'readwrite' });
    } catch (e) {
      if (e && e.name === 'AbortError') return; // usuário cancelou o seletor de pasta — nada a fazer
      console.warn('[editor] seletor de pasta indisponível; usando armazenamento offline:', e);
      try {
        await saveOfflineFallback();
      } catch (offlineError) {
        console.error('[editor] fallback offline:', offlineError);
        Books.toast.show('Não foi possível salvar localmente neste navegador: ' + offlineError.message, { tone: 'error', duration: 6500 });
      }
      return;
    }
    try {
      dirHandle = handle;
      var result = await Books.repo.saveToFolder({
        root: dirHandle, pkg: pkg, catalog: Books.state.catalog, progress: Books.progress.all(),
        settings: Books.personalization ? Books.personalization.get() : null,
        resolvePackage: function (id) { return id === pkg.manifest.id ? null : Books.repo.loadPackage(Books.state.catalog.packages.find(function (p) { return p.id === id; })); }
      });
      Books.state.catalog = Books.repo.normalizeCatalog(result.catalog);
      Books.repo.bumpAssetVersion();
      // O pacote local pode conter uma capa/imagem importada como data URL, que ainda não
      // existe na origem HTTP atual. Passe a versão salva ao leitor em vez de forçar um
      // reload que poderia reabrir o arquivo antigo em cache.
      Books.state.pkg = Books.util.clone(result.pkg || pkg);
      pkg = Books.util.clone(result.pkg || pkg);
      Books.state.dirty = false;
      Books.events.emit('catalog:changed', Books.state.pkg);
      Books.toast.show('Salvo na pasta do projeto.', { tone: 'ok' });
    } catch (e) {
      console.error(e);
      Books.toast.show('Não foi possível salvar na pasta: ' + e.message, { tone: 'error' });
    }
  }
  async function exportZip(saveFallback) {
    var report = refreshValidation();
    if (report && !report.ok()) { Books.toast.show('Corrija os erros antes de exportar.', { tone: 'error' }); return; }
    var catalog = Books.util.clone(Books.state.catalog);
    var files = [];
    var pkgClone = Books.util.clone(pkg);
    // extrai capa/imagens (data: URL → arquivo; URL http(s) → baixada) ANTES de montar a entrada do
    // catálogo, senão o catálogo aponta para o endereço antigo em vez do arquivo recém-salvo. SVG
    // fica embutido (não vira arquivo) — mesma regra do salvamento direto na pasta.
    var assets = await Books.repo.localizeAssets(pkgClone);
    var existingAssets = await Books.repo.collectLocalAssets(pkgClone, null);
    existingAssets.forEach(function (asset) { if (!assets.some(function (current) { return current.path === asset.path; })) assets.push(asset); });
    var settingsResult = Books.personalization ? await Books.repo.localizeSettingsAssets(Books.personalization.get(), null) : { settings: null, assets: [] };
    var entry = Books.repo.catalogEntry(pkgClone);
    var idx = catalog.packages.findIndex(function (p) { return p.id === entry.id; });
    if (idx === -1) catalog.packages.push(entry); else catalog.packages[idx] = entry;
    var pf = Books.repo.packageFiles(pkgClone);
    Object.keys(pf).forEach(function (p) { files.push({ name: 'content/packages/' + pkg.manifest.id + '/' + p, data: JSON.stringify(pf[p], null, 2) + '\n' }); });
    for (var a = 0; a < assets.length; a++) {
      var bytes = new Uint8Array(await assets[a].blob.arrayBuffer());
      files.push({ name: 'content/packages/' + pkg.manifest.id + '/' + assets[a].path, data: bytes });
    }
    for (var sa = 0; sa < settingsResult.assets.length; sa++) {
      var settingBytes = new Uint8Array(await settingsResult.assets[sa].blob.arrayBuffer());
      files.push({ name: 'content/' + settingsResult.assets[sa].path, data: settingBytes });
    }
    files.push({ name: 'content/catalog.json', data: JSON.stringify(catalog, null, 2) + '\n' });
    files.push({ name: 'content/progress.json', data: JSON.stringify({ schema: Books.schema.SCHEMAS.progress, kind: 'book-progress', version: 2, progress: Books.progress.all() || {} }, null, 2) + '\n' });
    if (settingsResult.settings) files.push({ name: 'content/settings.json', data: JSON.stringify({ schema: 'books.settings.v1', kind: 'book-settings', version: 1, settings: settingsResult.settings }, null, 2) + '\n' });
    var blob = Books.zip.build(files);
    var saved = await Books.util.download(pkg.manifest.id + '.zip', await blob.arrayBuffer().then(function (b) { return new Uint8Array(b); }), 'application/zip');
    if (!saved) return;
    Books.repo.remember(pkg);
    Books.toast.show(saveFallback ? 'ZIP completo baixado. Extraia na raiz do projeto para substituir os arquivos atualizados.' : 'ZIP completo baixado com JSON, capa e imagens.', { tone: 'ok', duration: 5000 });
  }

  /* ───────────── abrir / fechar ───────────── */
  function open(id) {
    activeSection = null;
    var entry = id && Books.state.catalog.packages.find(function (p) { return p.id === id; });
    var ready = entry ? Books.repo.loadPackage(entry) : Promise.resolve(blankPackage(promptNewId(), 'Novo livro'));
    ready.then(function (loaded) {
      pkg = Books.util.clone(loaded);
      els.root.hidden = false;
      document.body.classList.add('overlay-open', 'editor-open');
      renderShell();
    }).catch(function (e) { Books.toast.show('Não foi possível abrir para edição: ' + e.message, { tone: 'error' }); });
  }
  function promptNewId() {
    var n = 1, id;
    do { id = 'novo-livro' + (n > 1 ? '-' + n : ''); n++; } while (Books.state.catalog.packages.some(function (p) { return p.id === id; }));
    return id;
  }
  function close() {
    if (Books.state.dirty && !confirm('Sair sem salvar? As alterações deste livro serão perdidas.')) return;
    Books.state.dirty = false;
    els.root.hidden = true;
    document.body.classList.remove('overlay-open', 'editor-open');
  }

  function init() {
    els.root = document.getElementById('editorOverlay');
    els.title = document.getElementById('editorTitle');
    els.tabs = document.getElementById('editorTabs');
    els.body = document.getElementById('editorBody');
    els.validation = document.getElementById('editorValidation');
    els.saveBtn = document.getElementById('editorSave');
    els.closeBtn = document.getElementById('editorClose');
    els.closeBtn.addEventListener('click', close);
    // Em navegadores sem escrita direta, o botão usa o snapshot offline persistente; exportar ZIP
    // continua disponível separadamente na aba Importar / Exportar.
    els.saveBtn.addEventListener('click', saveToFolder);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('editor-open')) close(); });
    Books.events.on('library:new', function () { Books.library.close(); open(null); });
    Books.events.on('editor:open', function (id) { open(id); });
  }

  Books.editor = { init: init, open: open, close: close };
})();
