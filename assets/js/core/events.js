/* Barramento de eventos mínimo para desacoplar UI, leitor e editor. */
(function () {
  'use strict';
  var handlers = {};
  Books.events = {
    on: function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); return function () { Books.events.off(name, fn); }; },
    off: function (name, fn) { handlers[name] = (handlers[name] || []).filter(function (f) { return f !== fn; }); },
    emit: function (name, payload) { (handlers[name] || []).slice().forEach(function (fn) { try { fn(payload); } catch (e) { console.error('[events]', name, e); } }); }
  };
})();
