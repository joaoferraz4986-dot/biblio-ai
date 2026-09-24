/* Ícones SVG inline (24×24, traço). Uso: Books.icons.get('info', 16) → <svg>. */
(function () {
  'use strict';
  var C = function (cx, cy, r) { return { c: [cx, cy, r] }; };
  var R = function (x, y, w, h, rx) { return { r: [x, y, w, h, rx || 0] }; };

  var ICONS = {
    info: [C(12, 12, 10), 'M12 16v-4', 'M12 8h.01'],
    note: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5', 'M9 13h6', 'M9 17h6'],
    key: ['M6 3h12v18l-6-4-6 4z'],
    tip: ['M9 18h6', 'M10 22h4', 'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z'],
    warning: ['M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
    danger: ['M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9z', 'M12 8v4', 'M12 16h.01'],
    definition: ['M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z', 'M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z'],
    example: ['M9 2h6', 'M10 2v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2', 'M7 15h10'],
    copy: [R(9, 9, 13, 13, 2), 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
    check: ['M20 6L9 17l-5-5'],
    up: ['M18 15l-6-6-6 6'],
    down: ['M6 9l6 6 6-6'],
    right: ['M9 18l6-6-6-6'],
    plus: ['M12 5v14', 'M5 12h14'],
    minus: ['M5 12h14'],
    trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6', 'M14 11v6'],
    close: ['M18 6L6 18', 'M6 6l12 12'],
    library: [R(3, 4, 4, 16, 1), R(9, 4, 4, 16, 1), 'M16 5.5l3.6-1 3 14.6-3.6 1z'],
    edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
    focus: ['M8 3H5a2 2 0 0 0-2 2v3', 'M21 8V5a2 2 0 0 0-2-2h-3', 'M3 16v3a2 2 0 0 0 2 2h3', 'M16 21h3a2 2 0 0 0 2-2v-3'],
    image: [R(3, 3, 18, 18, 2), C(8.5, 8.5, 1.5), 'M21 15l-5-5L5 21'],
    code: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
    table: [R(3, 3, 18, 18, 2), 'M3 9h18', 'M3 15h18', 'M9 3v18'],
    list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
    diagram: [C(6, 6, 2.5), C(18, 8, 2.5), C(6, 18, 2.5), 'M6 8.5v7', 'M18 10.5a8 8 0 0 1-9.6 5.6'],
    quote: ['M3 21c3 0 7-1 7-8V5H4v8h4', 'M15 21c3 0 7-1 7-8V5h-6v8h4'],
    columns: [R(3, 3, 18, 18, 2), 'M12 3v18'],
    steps: ['M10 6h11', 'M10 12h11', 'M10 18h11', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
    sparkles: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 3v4', 'M17 5h4', 'M5 17v4', 'M3 19h4'],
    details: [R(3, 3, 18, 18, 2), 'M9 10l3 3 3-3'],
    heading: ['M6 4v16', 'M18 4v16', 'M6 12h12'],
    paragraph: ['M13 4v16', 'M17 4v16', 'M13 4H9.5a4.5 4.5 0 0 0 0 9H13'],
    undo: ['M9 14L4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
    redo: ['M15 14l5-5-5-5', 'M20 9H9.5a5.5 5.5 0 0 0 0 11H13'],
    save: ['M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'M17 21v-8H7v8', 'M7 3v5h8'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
    upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
    folder: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
    external: ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14L21 3'],
    divider: ['M3 12h4', 'M10 12h4', 'M17 12h4'],
    chart: ['M4 20h16', 'M6 20V10', 'M12 20V4', 'M18 20v-8'],
    sliders: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
    braces: ['M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1', 'M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1'],
    top: ['M12 19V5', 'M5 12l7-7 7 7'],
    eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', C(12, 12, 3)],
    layers: ['M12 2l10 5-10 5L2 7z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
    file: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5'],
    x: ['M18 6L6 18', 'M6 6l12 12'],
    alert: [C(12, 12, 10), 'M12 8v4', 'M12 16h.01'],
    settings: ['M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z', C(12, 12, 3)],
    palette: ['M12 21a9 9 0 0 1 0-18c4.97 0 9 3.582 9 8c0 1.06-.474 2.078-1.318 2.828c-.844.75-1.989 1.172-3.182 1.172h-2.5a2 2 0 0 0-1 3.75a1.3 1.3 0 0 1-1 2.25', C(7.5, 10.5, 0.6), C(12, 7.5, 0.6), C(16.5, 10.5, 0.6)],
    'layout-grid': [R(4, 4, 6, 6, 1), R(14, 4, 6, 6, 1), R(4, 14, 6, 6, 1), R(14, 14, 6, 6, 1)],
    typography: ['M4 20h4', 'M14 20h7', 'M6.9 15h6.9', 'M10.2 6.3l5.8 13.7', 'M5 20l6-16h2l7 16']
    ,keyboard: [R(3, 6, 18, 12, 2), 'M6 10h.01', 'M9 10h.01', 'M12 10h.01', 'M15 10h.01', 'M18 10h.01', 'M6 14h.01', 'M9 14h6', 'M18 14h.01']
  };

  var NS = 'http://www.w3.org/2000/svg';
  function get(name, size) {
    var def = ICONS[name] || ICONS.info;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size || 16);
    svg.setAttribute('height', size || 16);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('icon', 'icon-' + name);
    def.forEach(function (part) {
      var el;
      if (typeof part === 'string') { el = document.createElementNS(NS, 'path'); el.setAttribute('d', part); }
      else if (part.c) { el = document.createElementNS(NS, 'circle'); el.setAttribute('cx', part.c[0]); el.setAttribute('cy', part.c[1]); el.setAttribute('r', part.c[2]); }
      else { el = document.createElementNS(NS, 'rect'); el.setAttribute('x', part.r[0]); el.setAttribute('y', part.r[1]); el.setAttribute('width', part.r[2]); el.setAttribute('height', part.r[3]); if (part.r[4]) el.setAttribute('rx', part.r[4]); }
      svg.appendChild(el);
    });
    return svg;
  }
  Books.icons = { get: get, has: function (n) { return !!ICONS[n]; } };
})();
