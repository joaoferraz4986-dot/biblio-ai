(function () {
  'use strict';
  var timer;
  function show(message, options) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.className = 'toast is-visible' + (options && options.tone ? ' toast--' + options.tone : '');
    clearTimeout(timer);
    timer = setTimeout(function () { el.classList.remove('is-visible'); }, (options && options.duration) || 1800);
  }
  Books.toast = { show: show };
})();
