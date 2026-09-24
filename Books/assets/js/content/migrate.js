/*
 * Normalização de pacotes: aceita o formato legado (v1, `memcpp.*`, seções com HTML) e o v2,
 * e sempre devolve um pacote v2 pronto para validar/renderizar. Pura (sem DOM).
 *
 * A conversão de HTML→blocos "de verdade" é feita por tools/migrate_v1_to_v2.py.
 * Aqui, seções v1 viram um único bloco `html` (sanitizado no render), sem perda de conteúdo.
 */
(function () {
  'use strict';
  var S = Books.schema;
  var LEGACY_ACCENT = {};
  S.ACCENTS.forEach(function (a) { if (a.legacy) LEGACY_ACCENT[a.legacy] = a.id; });

  function legacyColor(value) {
    var m = /^var\(--c-([a-z]+)\)$/.exec(String(value || ''));
    return m && LEGACY_ACCENT[m[1]] ? LEGACY_ACCENT[m[1]] : value;
  }
  function stripTags(html) { return String(html || '').replace(/<[^>]+>/g, ''); }

  function normalizeHeader(header, id) {
    var h = Books.util.clone(header || {});
    h.schema = S.SCHEMAS.header; h.kind = 'book-header'; h.id = h.id || (id + '-header');
    if (Array.isArray(h.legend)) h.legend = h.legend.map(function (item) { return { label: item.label, color: legacyColor(item.color) }; });
    if (h.cover && typeof h.cover.src === 'string' && /^packages\/[^/]+\//.test(h.cover.src)) h.cover.src = h.cover.src.replace(/^packages\/[^/]+\//, '');
    return h;
  }
  function normalizeSection(section) {
    var s = Books.util.clone(section);
    var legacy = s.schema === S.LEGACY_SCHEMAS.section;
    s.schema = S.SCHEMAS.section; s.kind = 'book-section';
    if (!Array.isArray(s.blocks)) {
      s.blocks = typeof s.html === 'string' ? [{ type: 'html', html: s.html.replace(/^\s*<h2[\s\S]*?<\/h2>/i, '') }] : [];
    }
    if (legacy || s.html !== undefined) {
      var m = /^\s*(\d+(?:\.\d+)*)\.?\s+(.*)$/.exec(s.title || '');
      if (m && !s.number) { s.number = m[1]; s.title = m[2]; }
      s.title = stripTags(s.title);
    }
    delete s.html; delete s.style;
    if (s.number == null) s.number = '';
    return s;
  }

  /** raw: { manifest, header, sections } em qualquer versão. */
  function normalizePackage(raw) {
    var pkg = Books.util.clone(raw);
    var manifest = pkg.manifest || {};
    manifest.schema = S.SCHEMAS.package; manifest.kind = 'book-package';
    if (!Array.isArray(manifest.tags)) manifest.tags = [];
    if (!manifest.language) manifest.language = 'pt-BR';
    if (typeof manifest.description === 'string' && /<[a-z][\s\S]*>/i.test(manifest.description)) {
      manifest.description = manifest.description.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`').replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**').replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*').replace(/<[^>]+>/g, '');
    }
    var sections = (pkg.sections || []).slice();
    if (sections.some(function (s) { return s && typeof s.order === 'number'; })) sections.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    var out = { manifest: manifest, header: normalizeHeader(pkg.header, manifest.id), sections: sections.map(normalizeSection) };
    out.sections.forEach(function (s) { delete s.order; });
    return out;
  }

  Books.migrate = { normalizePackage: normalizePackage, normalizeSection: normalizeSection, legacyColor: legacyColor };
})();
