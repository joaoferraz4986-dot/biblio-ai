(function () {
  'use strict';
  var B = Books.blocks;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var safeHttps = function (src) { return /^https:\/\//i.test(String(src || '')) ? String(src) : ''; };
  var localOrHttps = function (src) { return /^(?:data:video\/|https:\/\/|media\/|videos\/)/i.test(String(src || '')) ? String(src) : ''; };
  function caption(block) { return block.caption ? h('figcaption', { class: 'b-media__caption' }, Books.inline.render(block.caption)) : null; }
  function resolve(ctx, src) { return ctx && ctx.assetUrl ? ctx.assetUrl(src) : src; }

  B.register({
    type: 'iframe', label: 'Iframe seguro', group: 'midia', icon: 'external',
    doc: 'Iframe remoto somente por HTTPS. Use para documentação, mapas ou conteúdo incorporado confiável. O conteúdo permanece remoto e não é copiado para o livro offline; `sandbox`, `referrerPolicy` e `loading` são aplicados pelo leitor.',
    example: { type: 'iframe', src: 'https://example.com/documentacao', title: 'Documentação do projeto', height: 480, caption: 'Documentação externa' },
    defaults: function () { return { src: 'https://example.com', title: 'Conteúdo incorporado', height: 480, allowFullscreen: false, caption: '' }; },
    fields: [
      { key: 'src', label: 'URL HTTPS', kind: 'line', required: true },
      { key: 'title', label: 'Título acessível', kind: 'line', required: true },
      { key: 'height', label: 'Altura (px)', kind: 'number', min: 180, max: 1200, step: 10, required: true },
      { key: 'allowFullscreen', label: 'Permitir tela cheia', kind: 'bool' },
      { key: 'caption', label: 'Legenda', kind: 'line' }
    ],
    summary: function (b) { return b.title || b.src || 'Iframe'; },
    render: function (b) {
      var src = safeHttps(b.src);
      var frame = h('iframe', { src: src, title: b.title || 'Conteúdo incorporado', loading: 'lazy', referrerpolicy: 'no-referrer', sandbox: 'allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts', allowfullscreen: b.allowFullscreen ? true : null, style: { height: Math.max(180, Math.min(1200, Number(b.height) || 480)) + 'px' } });
      var fig = h('figure', { class: 'b-media b-media--iframe' }, frame, caption(b));
      if (!src) fig.insertBefore(h('div', { class: 'b-media__error' }, 'iframe inválido: use uma URL https://.'), frame);
      return fig;
    }
  });

  B.register({
    type: 'video', label: 'Vídeo MP4', group: 'midia', icon: 'external',
    doc: 'Vídeo MP4 com controles nativos, carregamento preguiçoso e caminho local. Ao salvar, Data URLs e arquivos escolhidos no editor são gravados em `media/`; URLs HTTPS são mantidas como referência externa.',
    example: { type: 'video', src: 'media/demonstracao.mp4', title: 'Demonstração do experimento', caption: 'Vídeo 1 — execução observada', controls: true, loop: false, muted: false },
    defaults: function () { return { src: '', title: 'Vídeo', controls: true, loop: false, muted: false, caption: '' }; },
    fields: [
      { key: 'src', label: 'Arquivo MP4 ou URL HTTPS', kind: 'video', required: true },
      { key: 'title', label: 'Título acessível', kind: 'line', required: true },
      { key: 'controls', label: 'Exibir controles', kind: 'bool' },
      { key: 'loop', label: 'Repetir', kind: 'bool' },
      { key: 'muted', label: 'Iniciar sem áudio', kind: 'bool' },
      { key: 'caption', label: 'Legenda', kind: 'line' }
    ],
    summary: function (b) { return b.title || b.src || 'Vídeo MP4'; },
    render: function (b, ctx) {
      var src = localOrHttps(b.src);
      var video = h('video', { src: src ? resolve(ctx, src) : '', controls: b.controls !== false, loop: !!b.loop, muted: !!b.muted, preload: 'metadata', playsinline: true, 'aria-label': b.title || 'Vídeo' });
      var fig = h('figure', { class: 'b-media b-media--video' }, video, caption(b));
      if (!src) fig.insertBefore(h('div', { class: 'b-media__error' }, 'Vídeo inválido: informe media/*.mp4 ou uma URL https://.'), video);
      video.addEventListener('error', function () { if (!fig.querySelector('.b-media__error')) fig.insertBefore(h('div', { class: 'b-media__error' }, 'Não foi possível carregar o vídeo: ' + b.src), video); });
      return fig;
    }
  });
})();
