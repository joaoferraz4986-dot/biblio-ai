(function () {
  'use strict';

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === false || value == null) return;
        if (key === 'class' || key === 'className') el.className = value;
        else if (key === 'dataset') Object.keys(value).forEach(function (k) { el.dataset[k] = value[k]; });
        else if (key === 'style' && typeof value === 'object') {
          Object.keys(value).forEach(function (prop) {
            if (prop.slice(0, 2) === '--') el.style.setProperty(prop, value[prop]);
            else el.style[prop] = value[prop];
          });
        }
        else if (key.slice(0, 2) === 'on' && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
        else if (key === 'value') el.value = value;
        else if (value === true) el.setAttribute(key, '');
        else el.setAttribute(key, value);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) child.forEach(function (c) { append(el, c); });
    else if (child instanceof Node) el.appendChild(child);
    else el.appendChild(document.createTextNode(String(child)));
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function debounce(fn, ms) {
    var timer;
    var wrapped = function () {
      var args = arguments, self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, ms);
    };
    wrapped.flush = function () { clearTimeout(timer); };
    return wrapped;
  }
  var counter = 0;
  function uid(prefix) { counter += 1; return (prefix || 'u') + counter.toString(36); }
  function slugify(text) {
    return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result)); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(file);
    });
  }
  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result)); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsText(file);
    });
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = h('textarea', { style: { position: 'fixed', opacity: '0' } });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); } catch (e) { reject(e); }
      ta.remove();
    });
  }
  function aspectRatioCss(ratio) {
    var m = /^(\d+)\s*:\s*(\d+)$/.exec(String(ratio || '').trim());
    return m ? m[1] + ' / ' + m[2] : '16 / 9';
  }
  function safeUrl(url, allowData) {
    var u = String(url || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(u)) return u;
    if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml|avif);/i.test(u)) return allowData === false ? '' : u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
    return u; // caminho relativo
  }

  Books.util = { h: h, append: append, clear: clear, clone: clone, debounce: debounce, uid: uid,
    slugify: slugify, download: download, readFileAsDataUrl: readFileAsDataUrl,
    readFileAsText: readFileAsText, copyText: copyText, safeUrl: safeUrl, aspectRatioCss: aspectRatioCss };
})();
