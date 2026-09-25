/*
 * Navegação de leitura:
 *   • Alt + → / ←           → próxima / anterior SEÇÃO (capítulo)
 *   • Alt + Shift + ↓ / ↑   → próxima / anterior SUBSEÇÃO (percorre também as subseções)
 *   • sumário lateral com item ativo, barra de progresso, botão "topo" e links internos (#id)
 * Nos extremos (antes da primeira / depois da última) nada é rolado: só um aviso discreto.
 */
(function () {
  'use strict';
  var TOLERANCE = 8;
  var pending = null;   // { y, until } enquanto uma rolagem suave está em andamento
  var els = {};
  var activeId = '';

  function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function main() { return document.getElementById('mainContent'); }
  function targets(deep) { return Array.prototype.slice.call(main().querySelectorAll(deep ? '.chapter, .b-subsection[id]' : '.chapter')); }
  function margin(el) { return parseFloat(getComputedStyle(el).scrollMarginTop) || 0; }
  function topOf(el) { return el.getBoundingClientRect().top + window.scrollY - margin(el); }
  function effectiveY() { return pending && Date.now() < pending.until ? pending.y : window.scrollY; }

  function scrollToY(y, behavior) {
    var target = Math.max(0, Math.round(y));
    var smooth = behavior !== 'instant' && !reduced();
    pending = smooth ? { y: target, until: Date.now() + 900 } : null;
    window.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
  }
  function scrollToElement(el, behavior) {
    scrollToY(topOf(el), behavior);
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  function scrollToId(id, behavior) {
    var el = document.getElementById(id);
    if (!el) return false;
    scrollToElement(el, behavior);
    return true;
  }

  function step(direction, deep) {
    var list = targets(deep);
    if (!list.length) return;
    var y = effectiveY();
    var cur = -1;
    list.forEach(function (el, i) { if (topOf(el) <= y + TOLERANCE) cur = i; });
    var noun = deep ? 'subseção' : 'seção';

    if (direction > 0) {
      if (cur + 1 >= list.length) { Books.toast.show('Você já está na última ' + noun); return; }
      scrollToElement(list[cur + 1]);
      return;
    }
    if (cur === -1) { if (y > TOLERANCE) scrollToY(0); else Books.toast.show('Você já está no início do livro'); return; }
    if (y - topOf(list[cur]) > TOLERANCE) { scrollToElement(list[cur]); return; }   // dentro da seção: volta ao início dela
    if (cur === 0) { if (y > TOLERANCE) scrollToY(0); else Books.toast.show('Você já está na primeira ' + noun); return; }
    scrollToElement(list[cur - 1]);
  }

  function isEditable(node) {
    if (!node || node === document.body) return false;
    var tag = node.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
  }
  function matchesKey(event, combo) {
    var parts = String(combo || '').split('+');
    var key = parts.pop();
    return (parts.indexOf('Alt') > -1) === event.altKey && (parts.indexOf('Ctrl') > -1) === event.ctrlKey && (parts.indexOf('Shift') > -1) === event.shiftKey && String(event.key).toLowerCase() === String(key).toLowerCase();
  }
  function onKeyDown(event) {
    if (event.ctrlKey || event.metaKey) return;
    if (isEditable(event.target) || document.body.classList.contains('overlay-open') || !Books.state.pkg) return;
    var keys = Books.personalization ? Books.personalization.keybindConfig() : { next: 'Alt+ArrowRight', previous: 'Alt+ArrowLeft' };
    var next = matchesKey(event, keys.next);
    var previous = matchesKey(event, keys.previous);
    if (!next && !previous) return;
    event.preventDefault();
    step(next ? 1 : -1, false);
  }

  /* ───────────── sumário: item ativo ───────────── */
  function computeActive() {
    var list = targets(true);
    var line = window.scrollY + window.innerHeight * 0.28;
    var found = '';
    list.forEach(function (el) { if (topOf(el) + margin(el) <= line) found = el.id; });
    if (!found && list[0]) found = '';
    return found;
  }
  function markActive(id) {
    if (id === activeId) return;
    activeId = id;
    var links = els.toc.querySelectorAll('a[href^="#"]');
    var parentId = '';
    var activeEl = id && document.getElementById(id);
    if (activeEl) { var chapter = activeEl.closest('.chapter'); parentId = chapter ? chapter.id : ''; }
    links.forEach(function (a) {
      var target = a.getAttribute('href').slice(1);
      if (target === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      a.classList.toggle('is-parent', target === parentId && target !== id);
    });
    var current = els.toc.querySelector('a[aria-current="true"]');
    if (current && getComputedStyle(els.toc).overflowY !== 'visible') {
      var box = els.toc.getBoundingClientRect(), r = current.getBoundingClientRect();
      if (r.top < box.top + 40) els.toc.scrollTop -= box.top + 40 - r.top;
      else if (r.bottom > box.bottom - 40) els.toc.scrollTop += r.bottom - box.bottom + 40;
    }
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      els.bar.style.transform = 'scaleX(' + Math.min(1, window.scrollY / max) + ')';
      els.top.classList.toggle('visible', window.scrollY > 500);
      markActive(computeActive());
    });
  }

  function onDocumentClick(event) {
    var a = event.target.closest && event.target.closest('a[href^="#"]');
    if (!a || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (!id) return;
    if (scrollToId(id)) { event.preventDefault(); try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// */ } }
  }

  function init() {
    els.toc = document.querySelector('nav.toc');
    els.bar = document.getElementById('readProgress');
    els.top = document.getElementById('backTop');
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onDocumentClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    els.top.addEventListener('click', function () { scrollToY(0); });
    Books.events.on('book:rendered', function () { activeId = '\u0000'; onScroll(); });
  }

  Books.nav = { init: init, step: step, scrollToId: scrollToId, scrollToY: scrollToY, refresh: function () { activeId = '\u0000'; onScroll(); }, currentId: computeActive };
})();
