(function () {
  'use strict';
  var h = function () { return Books.util.h.apply(null, arguments); };
  var $ = function (id) { return document.getElementById(id); };

  function context(pkg) {
    return { pkg: pkg, imageRights: pkg.imageRights || {}, assetUrl: function (src) { return Books.repo ? Books.repo.assetUrl(pkg.manifest.id, src) : src; } };
  }

  function sectionLabel(section) {
    return (section.number ? section.number + '. ' : '') + Books.inline.toPlain(section.title);
  }
  function subsectionLabel(b) { return (b.number ? b.number + ' ' : '') + Books.inline.toPlain(b.title); }

  function tocEntries(pkg) {
    return pkg.sections.map(function (section) {
      var subs = [];
      Books.blocks.walk(section.blocks, function (b) {
        if (b.type === 'subsection' && b.id) subs.push({ id: b.id, label: subsectionLabel(b) });
      });
      return { id: section.id, label: sectionLabel(section), children: subs };
    });
  }

  function renderHeader(pkg) {
    var hd = pkg.header, inl = Books.inline.render;
    function fill(id, text) { var el = $(id); Books.util.clear(el); el.appendChild(inl(text || '')); return el; }
    fill('heroKicker', hd.kicker);
    fill('heroTitle', hd.title || pkg.manifest.title);
    fill('heroSubtitle', hd.subtitle || pkg.manifest.description);
    fill('guideTitle', hd.guideTitle || 'Como usar este livro');
    fill('guideText', hd.guideText);
    $('readingNote').hidden = !(hd.guideText || hd.guideTitle);
    var legend = Books.util.clear($('legend'));
    (hd.legend || []).forEach(function (item) {
      var dot = h('span', { class: 'dot' });
      dot.style.background = Books.schema.accentCss(item.color) || 'var(--text)';
      legend.appendChild(h('span', { class: 'chip' }, dot, item.label || ''));
    });
    var footer = $('bookFooter');
    Books.util.clear(footer.querySelector('.wrap'));
    footer.querySelector('.wrap').appendChild(inl(hd.footer || ''));
    footer.hidden = !hd.footer;
    var title = Books.inline.toPlain(hd.title || pkg.manifest.title);
    document.title = title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', Books.inline.toPlain(hd.subtitle || pkg.manifest.description || title).slice(0, 300));
    document.documentElement.lang = pkg.manifest.language || 'pt-BR';
  }

  function renderToc(pkg) {
    var list = Books.util.clear($('tocList'));
    tocEntries(pkg).forEach(function (entry) {
      var li = h('li', null, h('a', { href: '#' + entry.id, dataset: { level: '1' } }, entry.label));
      if (entry.children.length) {
        var sub = h('ol', { class: 'sub' });
        entry.children.forEach(function (c) { sub.appendChild(h('li', null, h('a', { href: '#' + c.id, dataset: { level: '2' } }, c.label))); });
        li.appendChild(sub);
      }
      list.appendChild(li);
    });
  }

  function renderBody(pkg) {
    var main = Books.util.clear($('mainContent'));
    var ctx = context(pkg);
    pkg.sections.forEach(function (section) {
      var title = h('h2', { class: 'chapter__title' }, section.number ? h('span', { class: 'num' }, section.number + '.') : null, Books.inline.render(section.title));
      main.appendChild(h('section', { class: 'chapter', id: section.id, dataset: { chapter: section.id } },
        h('header', { class: 'chapter__head' }, title),
        h('div', { class: 'chapter__body' }, Books.blocks.renderList(section.blocks, ctx))));
    });
  }

  function renderBook(pkg) {
    renderHeader(pkg);
    renderBody(pkg);
    renderToc(pkg);
    Books.events.emit('book:rendered', pkg);
    return Promise.all([Books.diagrams.renderAll($('mainContent')), Books.math.renderAll($('mainContent'))]);
  }

  Books.render = { book: renderBook, context: context, tocEntries: tocEntries, sectionLabel: sectionLabel };
})();
