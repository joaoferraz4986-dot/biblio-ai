(function () {
  'use strict';

  var ESCAPABLE = '\\`*{}[]()#+-.!~|_>';
  var TONE_RE = /^\{([a-z]+)\|/;

  function hasClose(s, from, token) { return s.indexOf(token, from) !== -1; }

  function parseRun(s, i, stop) {
    var nodes = [];
    var buf = '';
    function flush() { if (buf) { nodes.push({ t: 'text', v: buf }); buf = ''; } }
    while (i < s.length) {
      var c = s[i];

      if (stop && s.startsWith(stop, i) && i > 0 && !/\s/.test(s[i - 1]) &&
          !(stop === '*' && s.startsWith('**', i) && hasClose(s, i + 2, '**'))) {
        flush();
        return { nodes: nodes, i: i + stop.length, closed: true };
      }
      if (stop === ']' && s.startsWith(']', i)) { flush(); return { nodes: nodes, i: i + 1, closed: true }; }
      if (stop === '}' && s.startsWith('}', i)) { flush(); return { nodes: nodes, i: i + 1, closed: true }; }

      if (c === '\\' && i + 1 < s.length && ESCAPABLE.indexOf(s[i + 1]) !== -1) { buf += s[i + 1]; i += 2; continue; }
      if (c === '\n') { flush(); nodes.push({ t: 'br' }); i += 1; continue; }

      if (c === '`') {
        var n = 1;
        while (s[i + n] === '`') n += 1;
        var ticks = new Array(n + 1).join('`');
        var end = s.indexOf(ticks, i + n);
        while (end !== -1 && s[end + n] === '`') end = s.indexOf(ticks, end + n + 1);
        if (end !== -1) {
          var code = s.slice(i + n, end);
          if (code.length > 2 && code[0] === ' ' && code[code.length - 1] === ' ') code = code.slice(1, -1);
          flush(); nodes.push({ t: 'code', v: code }); i = end + n; continue;
        }
        buf += ticks; i += n; continue;
      }

      if (s.startsWith('**', i) && i + 2 < s.length && !/\s/.test(s[i + 2])) {
        var strong = parseRun(s, i + 2, '**');
        if (strong.closed && strong.nodes.length) { flush(); nodes.push({ t: 'strong', c: strong.nodes }); i = strong.i; continue; }
      }
      if (c === '*' && i + 1 < s.length && !/\s/.test(s[i + 1]) && s[i + 1] !== '*') {
        var em = parseRun(s, i + 1, '*');
        if (em.closed && em.nodes.length) { flush(); nodes.push({ t: 'em', c: em.nodes }); i = em.i; continue; }
      }
      if (s.startsWith('~~', i) && i + 2 < s.length && !/\s/.test(s[i + 2])) {
        var del = parseRun(s, i + 2, '~~');
        if (del.closed && del.nodes.length) { flush(); nodes.push({ t: 'del', c: del.nodes }); i = del.i; continue; }
      }
      if (c === '$' && i + 1 < s.length && !/\s/.test(s[i + 1]) && s[i + 1] !== '$') {
        var mEnd = -1, j = i + 1;
        while (j < s.length && s[j] !== '\n') {
          if (s[j] === '$' && !/\s/.test(s[j - 1]) && !/[0-9]/.test(s[j + 1] || '')) { mEnd = j; break; }
          j += 1;
        }
        if (mEnd !== -1) { flush(); nodes.push({ t: 'math', v: s.slice(i + 1, mEnd) }); i = mEnd + 1; continue; }
      }
      if (s.startsWith('[[', i)) {
        var close = s.indexOf(']]', i + 2);
        if (close !== -1 && close > i + 2 && s.slice(i + 2, close).indexOf('\n') === -1) {
          flush(); nodes.push({ t: 'kbd', v: s.slice(i + 2, close) }); i = close + 2; continue;
        }
      }
      if (c === '[') {
        var label = parseRun(s, i + 1, ']');
        if (label.closed && s[label.i] === '(') {
          var depth = 1, j = label.i + 1;
          while (j < s.length && depth > 0) { if (s[j] === '(') depth += 1; else if (s[j] === ')') depth -= 1; j += 1; }
          if (depth === 0) {
            flush(); nodes.push({ t: 'link', href: s.slice(label.i + 1, j - 1).trim(), c: label.nodes }); i = j; continue;
          }
        }
      }
      if (c === '{') {
        var m = TONE_RE.exec(s.slice(i, i + 16));
        if (m && Books.schema.TONES.indexOf(m[1]) !== -1) {
          var tone = parseRun(s, i + m[0].length, '}');
          if (tone.closed) { flush(); nodes.push({ t: 'tone', tone: m[1], c: tone.nodes }); i = tone.i; continue; }
        }
      }
      buf += c; i += 1;
    }
    flush();
    return { nodes: nodes, i: i, closed: stop === null };
  }

  function parse(src) { return parseRun(String(src == null ? '' : src), 0, null).nodes; }

  function toPlain(src) {
    function walk(nodes) {
      return nodes.map(function (n) {
        if (n.t === 'text' || n.t === 'code' || n.t === 'kbd') return n.v;
        if (n.t === 'math') return '$' + n.v + '$';
        if (n.t === 'br') return ' ';
        return walk(n.c || []);
      }).join('');
    }
    return walk(parse(src)).replace(/\s+/g, ' ').trim();
  }

  function build(nodes, parent) {
    var h = Books.util.h;
    nodes.forEach(function (n) {
      var el;
      switch (n.t) {
        case 'text': parent.appendChild(document.createTextNode(n.v)); return;
        case 'br': parent.appendChild(document.createElement('br')); return;
        case 'code': el = h('code', { class: 'inline' }, n.v); break;
        case 'kbd': el = h('kbd', null, n.v); break;
        case 'math': el = h('span', { class: 'math-inline' }); el.dataset.math = n.v; el.dataset.display = '0'; el.textContent = '$' + n.v + '$'; break;
        case 'strong': el = h('strong'); build(n.c, el); break;
        case 'em': el = h('em'); build(n.c, el); break;
        case 'del': el = h('del'); build(n.c, el); break;
        case 'tone': el = h('span', { class: 'tone tone--' + n.tone }); build(n.c, el); break;
        case 'link': {
          var href = Books.util.safeUrl(n.href, false);
          if (!href) { el = h('span'); build(n.c, el); break; }
          el = h('a', { href: href });
          if (/^https?:/i.test(href)) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
          build(n.c, el);
          break;
        }
        default: return;
      }
      parent.appendChild(el);
    });
  }

  function render(src) {
    var frag = document.createDocumentFragment();
    build(parse(src), frag);
    return frag;
  }

  function escape(text) {
    return String(text).replace(/([\\`*{}\[\]~])/g, '\\$1');
  }

  Books.inline = { parse: parse, render: render, toPlain: toPlain, escape: escape };
})();
