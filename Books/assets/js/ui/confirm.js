/*
 * Diálogo de confirmação genérico e reutilizável — `await Books.confirm(mensagem, opts)`.
 * Diferente do `confirm()` nativo do navegador (usado hoje só no editor, para ações
 * destrutivas como excluir seção), este é estilizado com os tokens do projeto e pensado
 * para o LEITOR — por exemplo, confirmar antes de revelar a solução de um exercício
 * (ver assets/js/blocks/exercise.js). Cria e remove o próprio overlay a cada chamada: não
 * depende de nenhum elemento fixo no HTML, então qualquer bloco pode chamá-lo sem alterar
 * Livros.html.
 */
(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };

  function confirmDialog(message, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var done = false;
      var opener = document.activeElement;

      function close(result) {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey, true);
        overlay.classList.remove('is-visible');
        setTimeout(function () { overlay.remove(); }, 160);
        if (opener && typeof opener.focus === 'function') opener.focus();
        resolve(result);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); close(false); return; }
        if (e.key !== 'Tab') return;
        var focusables = panel.querySelectorAll('button');
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }

      var titleId = 'confirmTitle-' + Books.util.uid('');
      var cancelBtn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onClick: function () { close(false); } }, opts.cancelLabel || 'Cancelar');
      var okBtn = h('button', { type: 'button', class: 'btn btn--primary btn--sm', onClick: function () { close(true); } }, opts.confirmLabel || 'Confirmar');
      var panel = h('div', { class: 'confirm-dialog', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
        opts.title ? h('h3', { class: 'confirm-dialog__title', id: titleId }, opts.title) : null,
        h('p', { class: 'confirm-dialog__message', id: opts.title ? null : titleId }, message),
        h('div', { class: 'confirm-dialog__actions' }, cancelBtn, okBtn));
      var overlay = h('div', { class: 'confirm-overlay', onClick: function (e) { if (e.target === overlay) close(false); } }, panel);

      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKey, true);
      requestAnimationFrame(function () { overlay.classList.add('is-visible'); okBtn.focus(); });
    });
  }

  Books.confirm = confirmDialog;
})();
