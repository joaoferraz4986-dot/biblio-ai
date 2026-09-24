/* Blocos visuais: mermaid, ai-diagram (diagrama com proveniência de IA), svg e image. */
(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var ACCENT_FIELD = { key: 'accent', label: 'Cor de destaque', kind: 'accent' };

  function accentStyle(b) {
    var css = Books.schema.accentCss(b.accent);
    return css ? { '--accent': css } : null;
  }
  function figure(cls, b, caption, canvas, extra) {
    var style = accentStyle(b);
    var fig = h('figure', { class: 'b-diagram ' + cls }, caption, canvas, extra);
    if (style) Object.keys(style).forEach(function (k) { fig.style.setProperty(k, style[k]); });
    return fig;
  }
  function captionEl(b, badge) {
    if (!b.caption && !badge) return null;
    return h('figcaption', { class: 'b-diagram__cap' }, b.caption ? Books.inline.render(b.caption) : null, badge);
  }
  function mermaidCanvas(source) {
    return h('div', { class: 'b-diagram__canvas', dataset: { engine: 'mermaid', source: String(source || '') } },
      h('span', { class: 'b-diagram__pending' }, 'renderizando diagrama…'));
  }
  function svgCanvas(markup, alt) {
    var svg = Books.sanitize.svg(markup);
    var canvas = h('div', { class: 'b-diagram__canvas b-diagram__canvas--svg svg-frame' });
    if (!svg) { canvas.appendChild(h('p', { class: 'b-diagram__error' }, 'SVG inválido ou vazio.')); return canvas; }
    if (alt && !svg.getAttribute('aria-label') && !svg.querySelector('title')) svg.setAttribute('aria-label', alt);
    canvas.appendChild(svg);
    return canvas;
  }

  B.register({
    type: 'mermaid', label: 'Diagrama Mermaid', group: 'diagrama', icon: 'diagram',
    doc: 'Diagrama descrito em sintaxe Mermaid (flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, mindmap, timeline, gitGraph…). Escreva SOMENTE o código do diagrama, sem cercas ```. Coloque rótulos entre aspas duplas quando tiverem acentos ou parênteses: A["Texto (com parênteses)"].',
    example: { type: 'mermaid', caption: 'ciclo de vida do objeto', accent: 'blue', code: 'flowchart LR\n  A["new"] --> B["construtor"] --> C["uso"] --> D["destrutor"] --> E["delete"]' },
    defaults: function () { return { caption: '', code: 'flowchart LR\n  A["Início"] --> B["Fim"]' }; },
    fields: [
      { key: 'code', label: 'Código Mermaid', kind: 'code', rows: 9, required: true },
      { key: 'caption', label: 'Legenda', kind: 'line' },
      ACCENT_FIELD
    ],
    summary: function (b) { return (b.caption ? Books.inline.toPlain(b.caption) + ' · ' : '') + String(b.code || '').split('\n')[0]; },
    render: function (b) { return figure('b-diagram--mermaid', b, captionEl(b), mermaidCanvas(b.code)); }
  });

  B.register({
    type: 'ai-diagram', label: 'Diagrama com IA', group: 'diagrama', icon: 'sparkles',
    doc: 'Diagrama gerado por IA a partir de um prompt. Guarda o `prompt` (proveniência e reprodução) e o resultado em `source`, que pode ser Mermaid (`engine: "mermaid"`) ou SVG (`engine: "svg"`). No editor há botões para copiar um prompt pronto e colar a resposta da IA.',
    example: { type: 'ai-diagram', engine: 'mermaid', prompt: 'Mostre como um std::shared_ptr compartilha o bloco de controle entre cópias.', caption: 'contagem de referências', source: 'flowchart LR\n  A["shared_ptr A"] --> C["bloco de controle"]\n  B["shared_ptr B"] --> C\n  C --> O["objeto"]' },
    defaults: function () { return { engine: 'mermaid', prompt: '', caption: '', source: 'flowchart LR\n  A["Ideia"] --> B["Diagrama"]' }; },
    fields: [
      { key: 'engine', label: 'Formato do resultado', kind: 'select', options: [['mermaid', 'Mermaid'], ['svg', 'SVG']], required: true },
      { key: 'prompt', label: 'Prompt (o que a IA deve desenhar)', kind: 'text', rows: 3 },
      { key: 'source', label: 'Resultado da IA (código)', kind: 'code', rows: 9, required: true },
      { key: 'caption', label: 'Legenda', kind: 'line' },
      ACCENT_FIELD
    ],
    summary: function (b) { return (b.caption ? Books.inline.toPlain(b.caption) : '') || String(b.prompt || '').slice(0, 80); },
    render: function (b) {
      var badge = h('span', { class: 'b-diagram__badge', title: 'Diagrama gerado com auxílio de IA' }, Books.icons.get('sparkles', 12), 'IA');
      var canvas = b.engine === 'svg' ? svgCanvas(b.source, b.caption) : mermaidCanvas(b.source);
      var details = b.prompt ? h('details', { class: 'b-diagram__prompt' }, h('summary', null, 'prompt usado'), h('p', null, b.prompt)) : null;
      return figure('b-diagram--ai', b, captionEl(b, badge) || h('figcaption', { class: 'b-diagram__cap' }, badge), canvas, details);
    }
  });

  B.register({
    type: 'svg', label: 'SVG', group: 'diagrama', icon: 'chart',
    doc: 'Ilustração vetorial inline (mapas de memória, layouts, esquemas). O SVG é sanitizado: scripts, estilos e links externos são removidos. Use viewBox; largura e altura são ignoradas (o desenho escala para a largura da página).',
    example: { type: 'svg', alt: 'Dois retângulos ligados por uma seta', svg: '<svg viewBox="0 0 300 80"><rect x="10" y="20" width="100" height="40" rx="6" fill="#243b53" stroke="#76a9fa"/><rect x="190" y="20" width="100" height="40" rx="6" fill="#163b38" stroke="#2dd4bf"/><path d="M110 40h80" stroke="#9fb3c8" stroke-width="2"/></svg>' },
    defaults: function () { return { alt: '', caption: '', svg: '<svg viewBox="0 0 300 80"><rect x="10" y="10" width="280" height="60" rx="8" fill="#243b53" stroke="#76a9fa"/><text x="150" y="46" fill="#f1f5f9" font-size="16" text-anchor="middle">SVG</text></svg>' }; },
    fields: [
      { key: 'svg', label: 'Código SVG', kind: 'code', rows: 9, required: true },
      { key: 'alt', label: 'Descrição para leitores de tela', kind: 'line' },
      { key: 'caption', label: 'Legenda', kind: 'line' }
    ],
    summary: function (b) { return b.alt || b.caption || 'SVG'; },
    render: function (b) {
      var fig = h('figure', { class: 'b-diagram b-diagram--svg' }, svgCanvas(b.svg, b.alt));
      if (b.caption) fig.appendChild(h('figcaption', { class: 'b-diagram__cap b-diagram__cap--below' }, Books.inline.render(b.caption)));
      return fig;
    }
  });

  B.register({
    type: 'image', label: 'Imagem', group: 'diagrama', icon: 'image',
    doc: 'Imagem. `src` pode ser um caminho relativo à pasta do livro (ex.: "images/mapa.png"), uma URL https ou um Data URL — ao salvar, o editor grava o arquivo em `images/` dentro da pasta do livro (SVG fica embutido em vez de virar arquivo; para vetores, prefira o bloco `svg`). Remover o bloco ou trocar a imagem apaga o arquivo antigo. `alt` é obrigatório para acessibilidade.',
    example: { type: 'image', src: 'images/mapa.png', alt: 'Mapa de memória de um processo', caption: 'Figura 1 — visão geral' },
    defaults: function () { return { src: '', alt: '', caption: '' }; },
    fields: [
      { key: 'src', label: 'Imagem', kind: 'image', required: true },
      { key: 'alt', label: 'Texto alternativo', kind: 'line', required: true },
      { key: 'caption', label: 'Legenda', kind: 'line' }
    ],
    summary: function (b) { return b.alt || b.caption || b.src; },
    render: function (b, ctx) {
      var src = Books.util.safeUrl(b.src);
      var url = src && ctx && ctx.assetUrl ? ctx.assetUrl(src) : src;
      var fig = h('figure', { class: 'b-image' });
      if (!url) fig.appendChild(h('div', { class: 'b-image__empty' }, 'imagem não definida'));
      else fig.appendChild(h('img', { src: url, alt: b.alt || '', loading: 'lazy' }));
      if (b.caption) fig.appendChild(h('figcaption', null, Books.inline.render(b.caption)));
      return fig;
    }
  });
})();
