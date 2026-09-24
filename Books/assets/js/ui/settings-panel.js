/*
 * Painel de personalização: tema de cores, plano de fundo, fonte e progresso de leitura.
 * Tema/fundo são uma grade de cartões com prévia, um clique aplica na hora
 * (Books.personalization.set, que já persiste — ver core/personalization.js). As duas primeiras
 * abas também permitem criar tema/fundo personalizado a partir de cores escolhidas na hora
 * (Books.personalization.createCustomTheme/createCustomBackground) — fica só neste navegador,
 * nunca no .zip do projeto (ver comentário em core/personalization.js). Aberto pelo botão de
 * configurações na página de livros (assets/js/ui/library.js emite "settings:open"; ver
 * Livros.html para o markup do modal).
 */
(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };
  var els = {};
  var activeTab = 'theme';
  var opener = null;
  var creatingTheme = false, creatingBg = false, selectedTheme = null;
  var TABS = [
    ['theme', 'Tema', 'palette'],
    ['background', 'Plano de fundo', 'layout-grid'],
    ['font', 'Fonte', 'typography'],
    ['reading', 'Leitura', 'library'],
    ['focus', 'Modo foco', 'focus'],
    ['keybinds', 'Atalhos', 'keyboard']
  ];
  var PATTERN_LABELS = { dots: 'Pontos', grid: 'Grade', graph: 'Papel milimetrado', diagonal: 'Linhas diagonais', checker: 'Xadrez', honeycomb: 'Favo de mel', waves: 'Ondas', stars: 'Estrelas', aurora: 'Aurora', noise: 'Textura granulada' };

  function deleteBtn(onClick) {
    var btn = h('button', { type: 'button', class: 'card-delete', title: 'excluir personalizado' }, Books.icons.get('trash', 12));
    btn.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
    return btn;
  }

  function themeCard(theme, current) {
    var family = typeof theme === 'string' ? theme : null;
    var familyInfo = family && Books.personalization.THEME_FAMILIES[family];
    var activeTheme = Books.personalization.themeById(current.theme);
    var variants = family && Books.personalization.themeVariants[family];
    var active = family ? activeTheme.family === family : theme.id === current.theme;
    var previewTheme = family
      ? Books.personalization.themeById(variants[active ? activeTheme.mode : familyInfo.defaultVariant])
      : theme;
    var preview = h('div', { class: 'theme-card__preview' }, previewTheme.swatch.map(function (c) { return h('span', { style: { background: c } }); }));
    var label = familyInfo ? familyInfo.label : theme.label;
    var variantSummary = familyInfo ? h('span', { class: 'theme-card__variants' }, Object.keys(familyInfo.variants).map(function (key) { return familyInfo.variants[key]; }).join(' · ')) : null;
    var card = h('button', { type: 'button', class: 'theme-card' + (active ? ' is-active' : '') },
      !family && theme.custom ? deleteBtn(function () { Books.personalization.removeCustomTheme(theme.id); draw(); }) : null,
      preview,
      h('div', { class: 'theme-card__label' }, h('span', null, label), active ? Books.icons.get('check', 14) : null),
      variantSummary);
    card.addEventListener('click', function () {
      if (!family) selectedTheme = theme;
      else {
        var activeFamily = activeTheme.family === family ? activeTheme : Books.personalization.themeById(variants[familyInfo.defaultVariant]);
        selectedTheme = { id: family, family: family, label: familyInfo.label, mode: activeFamily.mode, colorScheme: activeFamily.colorScheme };
      }
      draw();
    });
    return card;
  }

  function themeChoice(current) {
    if (!selectedTheme) return null;
    var family = selectedTheme.family;
    var variants = family ? Books.personalization.themeVariants[family] : null;
    var familyInfo = family && Books.personalization.THEME_FAMILIES[family];
    var mode = variants ? h('select', { 'aria-label': 'Variante do tema' }, Object.keys(variants).map(function (key) {
      return h('option', { value: key }, familyInfo.variants[key]);
    })) : null;
    if (mode) mode.value = selectedTheme.mode || familyInfo.defaultVariant;
    var intensity = h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(current.themeIntensity == null ? 50 : current.themeIntensity), 'aria-label': 'Intensidade dos tons escuros' });
    var value = h('output', null, intensity.value + '%');
    intensity.addEventListener('input', function () { value.textContent = intensity.value + '%'; });
    function updateIntensityAvailability() {
      var key = mode ? mode.value : selectedTheme.mode;
      var chosen = variants ? Books.personalization.themeById(variants[key]) : selectedTheme;
      intensity.disabled = (chosen.colorScheme || 'dark') !== 'dark';
      value.textContent = intensity.disabled ? 'não se aplica à variante clara' : intensity.value + '%';
    }
    if (mode) mode.addEventListener('change', updateIntensityAvailability);
    updateIntensityAvailability();
    var apply = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'aplicar');
    var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'cancelar');
    apply.addEventListener('click', function () {
      var chosen = variants ? Books.personalization.themeById(variants[mode.value]) : selectedTheme;
      Books.personalization.set({ theme: chosen.id, themeMode: chosen.mode || selectedTheme.mode || selectedTheme.colorScheme || 'dark', themeIntensity: Number(intensity.value) });
      selectedTheme = null; draw();
    });
    cancel.addEventListener('click', function () { selectedTheme = null; draw(); });
    var panel = h('div', { class: 'theme-choice', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Opções do tema' },
      h('h3', null, 'Opções de ', selectedTheme.label),
      mode ? h('label', { class: 'settings-form__row' }, h('span', null, 'Variante'), mode) : h('p', { class: 'hint' }, 'Este tema não tem variantes cadastradas.'),
      h('p', { class: 'hint theme-choice__hint' }, '0% = tons mais suaves · 50% = paleta original · 100% = tons mais profundos.'),
      h('label', { class: 'settings-form__row' }, h('span', null, 'Intensidade'), intensity, value),
      h('div', { class: 'creator-form__actions' }, apply, cancel));
    setTimeout(function () { (mode || intensity).focus(); }, 0);
    return panel;
  }

  function bgCard(bg, current) {
    var active = bg.id === current.background;
    var preview = h('div', { class: 'bg-card__preview', dataset: { bg: bg.basePattern || bg.id } });
    if (bg.vars) Object.keys(bg.vars).forEach(function (k) { preview.style.setProperty(k, bg.vars[k]); });
    if (bg.basePattern === 'image' && bg.src) {
      preview.style.backgroundImage = 'linear-gradient(color-mix(in srgb, var(--bg) 38%, transparent), color-mix(in srgb, var(--bg) 38%, transparent)), url("' + Books.personalization.resourceUrl(bg.src).replace(/"/g, '\\"') + '")';
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center';
      preview.appendChild(h('img', { src: Books.personalization.resourceUrl(bg.src), alt: '', class: 'bg-card__image-preview' }));
    }
    var card = h('button', { type: 'button', class: 'bg-card' + (active ? ' is-active' : '') },
      bg.custom ? deleteBtn(function () { Books.personalization.removeCustomBackground(bg.id); draw(); }) : null,
      preview,
      h('div', { class: 'bg-card__label' }, active ? Books.icons.get('check', 12) : null, ' ' + bg.label));
    card.addEventListener('click', function () { Books.personalization.set({ background: bg.id }); draw(); });
    return card;
  }

  function fontCard(font, current) {
    var active = font.id === current.font;
    Books.personalization.ensureFont(font.id); // carrega a folha de estilo para a prévia já aparecer na letra certa
    var card = h('button', { type: 'button', class: 'font-card' + (active ? ' is-active' : '') },
      font.custom ? deleteBtn(function () { Books.personalization.removeCustomFont(font.id); draw(); }) : null,
      h('div', { class: 'font-card__meta' },
        h('span', { class: 'font-card__cat' }, font.cat),
        h('span', { class: 'font-card__sample', style: { fontFamily: font.body } }, font.label)),
      active ? Books.icons.get('check', 16) : null);
    card.addEventListener('click', function () { Books.personalization.set({ font: font.id }); draw(); });
    return card;
  }

  /* ---- criar tema personalizado ---- */
  function colorField(label, value) {
    var input = h('input', { type: 'color', value: value });
    return { row: h('label', { class: 'color-field' }, h('span', null, label), input), input: input };
  }
  function createThemeCard(current) {
    if (!creatingTheme) {
      var open = h('button', { type: 'button', class: 'theme-card theme-card--add', title: 'Criar tema', 'aria-label': 'Criar tema' }, Books.icons.get('plus', 28));
      open.addEventListener('click', function () { creatingTheme = true; draw(); });
      return open;
    }
    var base = Books.personalization.themeById(current.theme);
    var seed = base.swatch || ['#0b0f14', '#182430', '#eef3f8', '#76a9fa'];
    var name = h('input', { type: 'text', placeholder: 'Nome do tema', class: 'theme-form__name' });
    var bgF = colorField('Fundo', seed[0]), panelF = colorField('Painel', seed[1]), textF = colorField('Texto', seed[2]), accentF = colorField('Destaque', seed[3]);
    var save = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, Books.icons.get('check', 13), h('span', null, 'salvar tema'));
    var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, h('span', null, 'cancelar'));
    save.addEventListener('click', function () {
      var theme = Books.personalization.createCustomTheme(name.value.trim(), { bg: bgF.input.value, panel: panelF.input.value, text: textF.input.value, accent: accentF.input.value });
      Books.personalization.set({ theme: theme.id });
      creatingTheme = false; draw();
    });
    cancel.addEventListener('click', function () { creatingTheme = false; draw(); });
    return h('div', { class: 'creator-form' },
      h('p', { class: 'creator-form__hint' }, 'Escolha 4 cores — o resto (painéis, bordas, texto secundário) é calculado a partir delas. Fica salvo só neste navegador.'),
      name,
      h('div', { class: 'creator-form__colors' }, bgF.row, panelF.row, textF.row, accentF.row),
      h('div', { class: 'creator-form__actions' }, save, cancel));
  }

  /* ---- criar plano de fundo por imagem ---- */
  function createBgCard() {
    if (!creatingBg) {
      var open = h('button', { type: 'button', class: 'bg-card bg-card--add', title: 'Criar plano', 'aria-label': 'Criar plano' }, Books.icons.get('plus', 28));
      open.addEventListener('click', function () { creatingBg = true; draw(); });
      return open;
    }
    var name = h('input', { type: 'text', placeholder: 'Nome do plano', class: 'theme-form__name' });
    var file = h('input', { type: 'file', accept: 'image/png,image/svg+xml,.png,.svg', class: 'settings__file' });
    var hint = h('p', { class: 'creator-form__hint' }, 'Selecione uma imagem PNG ou SVG. O PNG é copiado para os arquivos do projeto ao salvar; o SVG continua embutido e acompanha o tema com uma camada de adaptação.');
    var status = h('p', { class: 'hint' });
    var selected = { src: '', mime: '' };
    file.addEventListener('change', function () {
      var f = file.files[0];
      if (!f) return;
      var nameLower = f.name.toLowerCase();
      if (!/\.png$|\.svg$/.test(nameLower)) { status.textContent = 'Formato inválido. Use apenas PNG ou SVG.'; status.className = 'hint is-error'; return; }
      if (/\.svg$/.test(nameLower)) {
        Books.util.readFileAsText(f).then(function (source) {
          var safe = Books.sanitize.svg(source);
          if (!safe) throw new Error('SVG inválido ou vazio.');
          selected.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(safe.outerHTML);
          selected.mime = 'image/svg+xml';
          status.textContent = 'SVG pronto para aplicar.'; status.className = 'hint is-ok';
        }).catch(function (e) { status.textContent = e.message; status.className = 'hint is-error'; });
      } else {
        Books.util.readFileAsDataUrl(f).then(function (src) { selected.src = src; selected.mime = 'image/png'; status.textContent = 'PNG pronto para aplicar.'; status.className = 'hint is-ok'; });
      }
    });
    var save = h('button', { type: 'button', class: 'btn btn--primary btn--sm', disabled: true }, Books.icons.get('check', 13), h('span', null, 'salvar plano'));
    var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, h('span', null, 'cancelar'));
    file.addEventListener('change', function () { save.disabled = false; });
    save.addEventListener('click', function () {
      if (!selected.src) return;
      var bg = Books.personalization.createCustomImageBackground(name.value.trim(), selected.src, selected.mime);
      Books.personalization.set({ background: bg.id });
      creatingBg = false; draw();
    });
    cancel.addEventListener('click', function () { creatingBg = false; draw(); });
    return h('div', { class: 'creator-form' },
      hint,
      name,
      file,
      status,
      h('div', { class: 'creator-form__actions' }, save, cancel));
  }

  function bytesToDataUrl(bytes, mime) {
    var binary = '', chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return 'data:' + mime + ';base64,' + btoa(binary);
  }
  function importFontZip() {
    var file = h('input', { type: 'file', accept: 'application/zip,.zip', class: 'settings__file' });
    file.addEventListener('change', function () {
      var zipFile = file.files[0]; if (!zipFile) return;
      Books.zip.read(zipFile).then(function (entries) {
        var font = entries.find(function (entry) { return /\.(ttf|otf|woff2?|ttc)$/i.test(entry.name); });
        if (!font) throw new Error('O ZIP não contém uma fonte .ttf, .otf, .woff, .woff2 ou .ttc.');
        var filename = font.name.split('/').pop().replace(/\.[^.]+$/, '');
        var ext = /\.([^.]+)$/.exec(font.name)[1].toLowerCase();
        var mime = ext === 'otf' ? 'font/otf' : ext === 'woff' ? 'font/woff' : ext === 'woff2' ? 'font/woff2' : 'font/ttf';
        var created = Books.personalization.createCustomFont(filename, bytesToDataUrl(font.data, mime), ext === 'otf' ? 'opentype' : ext);
        Books.personalization.set({ font: created.id });
        Books.toast.show('Fonte importada e aplicada: ' + filename, { tone: 'ok' });
        draw();
      }).catch(function (e) { Books.toast.show('Não foi possível importar a fonte: ' + e.message, { tone: 'error' }); });
    });
    file.click();
  }

  /* ---- aba: leitura (progresso) ---- */
  function readingRow(entry) {
    var id = entry.id, title = entry.title || id;
    var p = Books.progress.get(id);
    var isNew = Books.progress.isNew(id);
    var status = isNew ? 'ainda não aberto' : p.finished ? 'concluído' : (p.percent || 0) + '% lido' + (p.sectionTitle ? ' — ' + p.sectionTitle : '');
    var reset = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', disabled: isNew ? true : null }, Books.icons.get('undo', 12), h('span', null, 'reiniciar'));
    reset.addEventListener('click', function () { Books.progress.reset(id); draw(); });
    return h('div', { class: 'reading-row' }, h('div', { class: 'reading-row__meta' }, h('span', { class: 'reading-row__title' }, title), h('span', { class: 'reading-row__status' }, status)), reset);
  }
  function renderReading(body) {
    var packages = (Books.state.catalog && Books.state.catalog.packages) || [];
    body.appendChild(h('p', { class: 'settings__section-title' }, 'Progresso salvo neste navegador (e na pasta do projeto, quando você salva pelo editor).'));
    if (!packages.length) { body.appendChild(h('p', { class: 'hint' }, 'Nenhum livro no catálogo ainda.')); return; }
    var list = h('div', { class: 'reading-list' });
    packages.forEach(function (entry) { list.appendChild(readingRow(entry)); });
    body.appendChild(list);
    var hasAny = packages.some(function (entry) { return !Books.progress.isNew(entry.id); });
    var resetAll = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', disabled: hasAny ? null : true }, Books.icons.get('trash', 13), h('span', null, 'reiniciar progresso de todos os livros'));
    resetAll.addEventListener('click', function () {
      if (!confirm('Reiniciar o progresso de todos os livros? Cada um volta a aparecer como "novo".')) return;
      Books.progress.resetAll(); draw();
    });
    body.appendChild(h('div', { class: 'reading-list__footer' }, resetAll));
  }

  function renderFocus(body) {
    var cfg = Books.personalization.focusConfig();
    body.appendChild(h('p', { class: 'settings__section-title' }, 'Escolha o que permanece visível durante a leitura concentrada.'));
    var bg = h('select', null, h('option', { value: 'solid' }, 'Plano liso'), h('option', { value: 'keep' }, 'Manter plano atual')); bg.value = cfg.background;
    var width = h('select', null, h('option', { value: 'comfortable' }, 'Largura confortável'), h('option', { value: 'wide' }, 'Largura ampla')); width.value = cfg.width;
    var scale = h('input', { type: 'range', min: '.9', max: '1.3', step: '.01', value: cfg.scale });
    var dock = h('input', { type: 'checkbox', checked: cfg.hideDock });
    var toc = h('input', { type: 'checkbox', checked: cfg.hideToc });
    function save() { Books.personalization.setFocusConfig({ background: bg.value, width: width.value, scale: Number(scale.value), hideDock: dock.checked, hideToc: toc.checked }); }
    [bg, width, scale, dock, toc].forEach(function (el) { el.addEventListener('change', save); });
    body.appendChild(h('label', { class: 'settings-form__row' }, h('span', null, 'Plano de fundo'), bg));
    body.appendChild(h('label', { class: 'settings-form__row' }, h('span', null, 'Largura do conteúdo'), width));
    body.appendChild(h('label', { class: 'settings-form__row' }, h('span', null, 'Escala dos textos e blocos'), scale));
    body.appendChild(h('label', { class: 'settings-form__check' }, dock, h('span', null, 'Ocultar botões durante o foco')));
    body.appendChild(h('label', { class: 'settings-form__check' }, toc, h('span', null, 'Ocultar sumário durante o foco')));
  }

  function renderKeybinds(body) {
    var cfg = Books.personalization.keybindConfig();
    body.appendChild(h('p', { class: 'settings__section-title' }, 'Selecione um campo e pressione a combinação desejada.'));
    [['next', 'Próxima seção'], ['previous', 'Seção anterior'], ['focus', 'Alternar modo foco']].forEach(function (row) {
      var input = h('input', { type: 'text', value: cfg[row[0]], readOnly: true, 'aria-label': row[1] });
      input.addEventListener('keydown', function (e) {
        e.preventDefault(); var value = [];
        if (e.ctrlKey) value.push('Ctrl'); if (e.altKey) value.push('Alt'); if (e.shiftKey) value.push('Shift');
        value.push(e.key); input.value = value.join('+'); var patch = {}; patch[row[0]] = input.value; Books.personalization.setKeybindConfig(patch);
      });
      body.appendChild(h('label', { class: 'settings-form__row' }, h('span', null, row[1]), input));
    });
  }

  function renderTabs() {
    var bar = Books.util.clear(els.tabs);
    TABS.forEach(function (t) {
      var btn = h('button', { type: 'button', class: 'settings-tab' + (activeTab === t[0] ? ' is-active' : ''), dataset: { tab: t[0] } }, Books.icons.get(t[2], 14), h('span', null, t[1]));
      btn.addEventListener('click', function () { activeTab = t[0]; creatingTheme = false; creatingBg = false; selectedTheme = null; draw(); });
      bar.appendChild(btn);
    });
  }

  function draw() {
    renderTabs();
    var body = Books.util.clear(els.body);
    var current = Books.personalization.get();
    if (activeTab === 'theme') {
      body.appendChild(h('p', { class: 'settings__section-title' }, 'Paleta de cores de toda a biblioteca. Aplica na hora.'));
      var themeGrid = h('div', { class: 'theme-grid' });
      Object.keys(Books.personalization.THEME_FAMILIES).forEach(function (family) { themeGrid.appendChild(themeCard(family, current)); });
      Books.personalization.THEMES.filter(function (t) { return !t.family; }).forEach(function (t) { themeGrid.appendChild(themeCard(t, current)); });
      if (!creatingTheme) themeGrid.appendChild(createThemeCard(current));
      body.appendChild(themeGrid);
      var chooser = themeChoice(current);
      if (chooser) body.appendChild(chooser);
      if (creatingTheme) body.appendChild(createThemeCard(current));
    } else if (activeTab === 'background') {
      body.appendChild(h('p', { class: 'settings__section-title' }, 'Textura atrás do conteúdo — acompanha as cores do tema escolhido (ou a cor própria, se personalizado).'));
      var bgGrid = h('div', { class: 'bg-grid' });
      Books.personalization.BACKGROUNDS.forEach(function (b) { bgGrid.appendChild(bgCard(b, current)); });
      if (!creatingBg) bgGrid.appendChild(createBgCard());
      body.appendChild(bgGrid);
      if (creatingBg) body.appendChild(createBgCard());
    } else if (activeTab === 'font') {
      body.appendChild(h('p', { class: 'settings__section-title' }, 'Fonte de leitura e de títulos — do técnico ao lúdico.'));
      var importFont = h('button', { type: 'button', class: 'btn btn--ghost btn--sm settings__font-import' }, Books.icons.get('upload', 13), h('span', null, 'adicionar nova fonte (.zip)'));
      importFont.addEventListener('click', importFontZip);
      body.appendChild(importFont);
      var fontList = h('div', { class: 'font-list' });
      Books.personalization.FONTS.forEach(function (f) { fontList.appendChild(fontCard(f, current)); });
      body.appendChild(fontList);
    } else if (activeTab === 'focus') {
      renderFocus(body);
    } else if (activeTab === 'keybinds') {
      renderKeybinds(body);
    } else {
      renderReading(body);
    }
  }

  function open() {
    opener = document.activeElement;
    els.root.hidden = false;
    document.body.classList.add('overlay-open', 'settings-open');
    draw();
    setTimeout(function () { els.close.focus(); }, 0);
  }
  function close() { els.root.hidden = true; document.body.classList.remove('overlay-open', 'settings-open'); creatingTheme = false; creatingBg = false; selectedTheme = null; if (opener && opener.focus) opener.focus(); }
  function isOpen() { return document.body.classList.contains('settings-open'); }

  function init() {
    els.root = document.getElementById('settingsOverlay');
    els.tabs = document.getElementById('settingsTabs');
    els.body = document.getElementById('settingsBody');
    els.close = document.getElementById('settingsClose');
    els.close.addEventListener('click', close);
    els.root.addEventListener('click', function (e) { if (e.target === els.root) close(); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var focusable = els.root.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]');
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    Books.events.on('settings:open', open);
  }

  Books.settingsPanel = { init: init, open: open, close: close, isOpen: isOpen };
})();
