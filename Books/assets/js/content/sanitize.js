/*
 * Sanitização de SVG e HTML vindos do JSON (blocos `svg` e `html`).
 * Usa listas de permissão: o que não estiver na lista é removido. Nenhum script,
 * manipulador on*, foreignObject, <style> ou URL externa sobrevive.
 */
(function () {
  'use strict';

  var SVG_TAGS = ['svg', 'g', 'defs', 'title', 'desc', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
    'path', 'text', 'tspan', 'textPath', 'marker', 'linearGradient', 'radialGradient', 'stop', 'pattern',
    'clipPath', 'mask', 'symbol', 'use'];
  var URL_ATTRS = ['fill', 'stroke', 'marker-start', 'marker-mid', 'marker-end', 'clip-path', 'mask', 'filter'];

  function cleanStyle(value) {
    var v = String(value || '');
    if (/expression|javascript:|@import|behavior|url\(\s*['"]?(?!#)/i.test(v)) return '';
    return v;
  }

  function sanitizeSvg(markup, prefix) {
    var tpl = document.createElement('template');
    tpl.innerHTML = String(markup || '');
    var svg = tpl.content.querySelector('svg');
    if (!svg) return null;
    prefix = prefix || Books.util.uid('svg');

    var ids = {};
    svg.querySelectorAll('[id]').forEach(function (el) { ids[el.id] = prefix + '-' + el.id; });
    svg.id && (ids[svg.id] = prefix + '-' + svg.id);

    function rewriteRefs(value) {
      return String(value).replace(/url\(\s*['"]?#([^)'"\s]+)['"]?\s*\)/g, function (m, id) { return ids[id] ? 'url(#' + ids[id] + ')' : m; });
    }

    (function walk(el) {
      Array.prototype.slice.call(el.children).forEach(function (child) {
        if (SVG_TAGS.indexOf(child.localName) === -1) { child.remove(); return; }
        walk(child);
      });
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var name = attr.name, value = attr.value;
        if (/^on/i.test(name)) { el.removeAttribute(name); return; }
        if (name === 'href' || name === 'xlink:href') {
          if (value.charAt(0) === '#' && ids[value.slice(1)]) el.setAttribute(name, '#' + ids[value.slice(1)]);
          else el.removeAttribute(name);
          return;
        }
        if (name === 'id') { el.setAttribute('id', ids[value] || value); return; }
        if (name === 'aria-labelledby' || name === 'aria-describedby') {
          el.setAttribute(name, value.split(/\s+/).map(function (t) { return ids[t] || t; }).join(' '));
          return;
        }
        if (name === 'style') {
          var cleaned = cleanStyle(value);
          if (cleaned) el.setAttribute('style', rewriteRefs(cleaned)); else el.removeAttribute('style');
          return;
        }
        if (URL_ATTRS.indexOf(name) !== -1) {
          if (/url\(/i.test(value) && !/url\(\s*['"]?#/i.test(value)) el.removeAttribute(name);
          else el.setAttribute(name, rewriteRefs(value));
        }
      });
    })(svg);

    if (!svg.getAttribute('viewBox')) {
      var w = parseFloat(svg.getAttribute('width')), hgt = parseFloat(svg.getAttribute('height'));
      if (w > 0 && hgt > 0) svg.setAttribute('viewBox', '0 0 ' + w + ' ' + hgt);
    }
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!svg.getAttribute('role')) svg.setAttribute('role', 'img');
    return svg;
  }

  var HTML_TAGS = ['a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
    'h3', 'h4', 'hr', 'i', 'img', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'small', 'span', 'strong', 'sub',
    'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul'];
  var DROP_WITH_CONTENT = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'input', 'button',
    'textarea', 'select', 'noscript', 'template', 'svg', 'math', 'base'];
  var HEADING_MAP = { h1: 'h3', h2: 'h3', h5: 'h4', h6: 'h4' };

  function sanitizeHtml(markup) {
    var tpl = document.createElement('template');
    tpl.innerHTML = String(markup || '');
    var out = document.createDocumentFragment();

    function copy(node, into) {
      if (node.nodeType === 3) { into.appendChild(document.createTextNode(node.nodeValue)); return; }
      if (node.nodeType !== 1) return;
      var tag = node.localName;
      if (DROP_WITH_CONTENT.indexOf(tag) !== -1) return;
      tag = HEADING_MAP[tag] || tag;
      if (HTML_TAGS.indexOf(tag) === -1) { Array.prototype.forEach.call(node.childNodes, function (c) { copy(c, into); }); return; }
      var el = document.createElement(tag);
      var cls = (node.getAttribute('class') || '').split(/\s+/).filter(function (c) { return /^[a-z0-9_-]+$/i.test(c); });
      if (cls.length) el.className = cls.join(' ');
      if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) el.id = node.id;
      if (node.getAttribute('title')) el.title = node.getAttribute('title');
      if (tag === 'a') {
        var href = Books.util.safeUrl(node.getAttribute('href'), false);
        if (href) { el.setAttribute('href', href); if (/^https?:/i.test(href)) { el.target = '_blank'; el.rel = 'noopener noreferrer'; } }
      }
      if (tag === 'img') {
        var src = Books.util.safeUrl(node.getAttribute('src'));
        if (!src) return;
        el.setAttribute('src', src);
        el.setAttribute('alt', node.getAttribute('alt') || '');
      }
      if (tag === 'td' || tag === 'th') {
        ['colspan', 'rowspan'].forEach(function (a) { var n = parseInt(node.getAttribute(a), 10); if (n > 0 && n < 50) el.setAttribute(a, n); });
      }
      Array.prototype.forEach.call(node.childNodes, function (c) { copy(c, el); });
      into.appendChild(el);
    }
    Array.prototype.forEach.call(tpl.content.childNodes, function (c) { copy(c, out); });
    return out;
  }

  Books.sanitize = { svg: sanitizeSvg, html: sanitizeHtml };
})();
