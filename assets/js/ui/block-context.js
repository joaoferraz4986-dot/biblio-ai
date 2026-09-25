(function () {
  'use strict';
  var menu = null;
  var current = null;
  var blocks = typeof WeakMap === 'function' ? new WeakMap() : null;
  var h = function () { return Books.util.h.apply(null, arguments); };

  function exerciseCopy(block) {
    var copy = Books.util.clone(block);
    delete copy.solutionBlocks;
    return copy;
  }
  function payloadFor(block, mode) {
    if (block.type === 'exercise' && mode !== 'copy') return exerciseCopy(block);
    return Books.util.clone(block);
  }
  function textFor(block, mode, doubt) {
    var lines = [];
    if (mode === 'prompt') {
      lines.push('Explique detalhadamente o conteúdo do bloco abaixo, definindo os termos, mostrando as etapas intermediárias, exemplos, limites e possíveis erros.');
    } else if (mode === 'history') {
      lines.push('Pesquise e confirme as fontes históricas e biográficas deste bloco. Separe fatos documentados de interpretação, preserve a atribuição da imagem e sugira fontes primárias ou institucionais.');
    } else if (mode === 'doubt') {
      lines.push('Analise o bloco abaixo e responda à dúvida organizada ao final. Preserve o contexto, explique passo a passo e não invente fatos.');
    } else if (mode === 'hint') {
      lines.push('Pesquise e confirme o enunciado do exercício antes de responder. Forneça somente mais uma dica progressiva, sem solução, sem gabarito e sem revelar a resposta. Não repita a dica existente nem entregue código final.');
    } else if (mode === 'adjust') {
      lines.push('Ajuste o diagrama SVG abaixo sem mudar seu significado. Preserve acessibilidade, viewBox, contraste, proporções e identidade visual. Devolva somente um SVG válido e explique brevemente as alterações.');
    } else {
      lines.push('Bloco Books:');
    }
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(payloadFor(block, mode), null, 2));
    lines.push('```');
    if (block.type === 'exercise' && mode === 'hint') {
      lines.push('', 'DICA JÁ DISPONÍVEL:', block.hint || '(nenhuma)', '');
    }
    if (doubt) lines.push('', 'DÚVIDA DO USUÁRIO:', doubt.trim(), '', 'Organize a resposta distinguindo evidência, hipótese e conclusão.');
    return lines.join('\n');
  }
  function isImageBlock(block) { return block && (block.type === 'image' || block.type === 'svg' || (block.type === 'ai-diagram' && block.engine === 'svg')); }
  function isSvgImage(block) {
    var src = block && (block.src || block.svg || block.source || '');
    return block && (block.type === 'svg' || (block.type === 'ai-diagram' && block.engine === 'svg') || /(^data:image\/svg|\.svg(?:$|[?#]))/i.test(src));
  }
  function imageSrc(block, element) { return element && element.querySelector && element.querySelector('img') ? element.querySelector('img').src : (block.src || block.svg || block.source || ''); }
  function copyImage(block, element) {
    var src = imageSrc(block, element);
    if (/^<svg/i.test(src)) return Books.util.copyText(src);
    return fetch(src).then(function (r) { return r.blob(); }).then(function (blob) {
      if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') return navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
      return Books.util.copyText(src);
    }).catch(function () { return Books.util.copyText(src); });
  }
  function adjustSvg(block) {
    var overlay = h('div', { class: 'block-context__dialog', role: 'dialog', 'aria-modal': 'true' });
    var area = h('textarea', { rows: 6, placeholder: 'Ex.: alinhar os rótulos, aumentar contraste e corrigir a legenda…' });
    var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'cancelar');
    var confirm = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'copiar prompt');
    var close = function () { overlay.remove(); };
    cancel.addEventListener('click', close);
    confirm.addEventListener('click', function () { var issue = area.value.trim(); if (!issue) { area.focus(); return; } copy('adjust', issue); close(); });
    overlay.appendChild(h('div', { class: 'block-context__dialog-card' }, h('h3', null, 'Problemas do diagrama SVG'), h('p', { class: 'hint' }, 'Descreva os ajustes em Markdown.'), area, h('div', { class: 'block-context__dialog-actions' }, cancel, confirm)));
    document.body.appendChild(overlay); area.focus();
  }
  function hide() {
    if (menu) menu.hidden = true;
    current = null;
  }
  function copy(mode, doubt) {
    if (!current) return;
    Books.util.copyText(textFor(current.block, mode, doubt)).then(function () {
      Books.toast.show(mode === 'hint' ? 'Exercício copiado sem resposta, com pedido de mais uma dica.' : 'Bloco copiado para a área de transferência.', { tone: 'ok' });
      hide();
    });
  }
  function askDoubt() {
    var overlay = h('div', { class: 'block-context__dialog', role: 'dialog', 'aria-modal': 'true' });
    var area = h('textarea', { rows: 5, placeholder: 'Ex.: explique o passo em que a hipótese é usada…' });
    var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'cancelar');
    var confirm = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'copiar');
    var close = function () { overlay.remove(); };
    cancel.addEventListener('click', close);
    confirm.addEventListener('click', function () { var value = area.value.trim(); if (!value) { area.focus(); return; } copy('doubt', value); close(); });
    overlay.appendChild(h('div', { class: 'block-context__dialog-card' }, h('h3', null, 'Adicionar dúvida'), h('p', { class: 'hint' }, 'A dúvida será organizada ao final do prompt copiado.'), area, h('div', { class: 'block-context__dialog-actions' }, cancel, confirm)));
    document.body.appendChild(overlay);
    area.focus();
  }
  function show(x, y, block, element) {
    current = { block: block, el: element };
    Books.util.clear(menu);
    var items;
    if (isImageBlock(block)) {
      items = [['image-copy', 'Copiar imagem'], ['lens', 'Pesquisar com Google Lens']];
      if (isSvgImage(block)) items.push(['adjust', 'Copiar prompt de ajuste do diagrama']);
    } else {
      items = [['copy', 'Copiar bloco'], ['prompt', 'Copiar bloco com um prompt'], ['doubt', 'Copiar bloco com dúvida']];
      if (block.type === 'exercise') items.push(['hint', 'Mais uma dica (sem resposta)']);
      if (block.type === 'history') items.push(['history', 'Copiar bio/hist com prompt de fontes']);
    }
    items.forEach(function (item) {
      var button = h('button', { type: 'button', class: 'block-context__item', role: 'menuitem' }, item[1]);
      button.addEventListener('click', function () {
        if (item[0] === 'doubt') askDoubt();
        else if (item[0] === 'image-copy') { copyImage(block, current.el).then(function () { Books.toast.show('Imagem copiada.', { tone: 'ok' }); hide(); }); }
        else if (item[0] === 'lens') { Books.util.copyText(imageSrc(block, current.el)).then(function () { window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(imageSrc(block, current.el)), '_blank', 'noopener'); hide(); }); }
        else if (item[0] === 'adjust') adjustSvg(block);
        else copy(item[0]);
      });
      menu.appendChild(button);
    });
    menu.hidden = false;
    var rect = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)) + 'px';
    menu.style.top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) + 'px';
  }
  function bind(el, block) { if (blocks) blocks.set(el, block); }
  function init() {
    menu = document.getElementById('blockContextMenu') || h('div', { class: 'block-context', role: 'menu', hidden: true });
    if (!menu.parentNode) document.body.appendChild(menu);
    document.addEventListener('contextmenu', function (event) {
      var el = event.target.closest && event.target.closest('[data-block]');
      if (!el || !blocks || !blocks.has(el)) return;
      event.preventDefault();
      show(event.clientX, event.clientY, blocks.get(el), el);
    });
    document.addEventListener('click', function (event) { if (!menu || menu.hidden || menu.contains(event.target)) return; hide(); });
    window.addEventListener('blur', hide);
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') hide(); });
  }
  Books.blockContext = { init: init, bind: bind, copyText: textFor };
})();
