(function () {
  'use strict';

  var SCHEMAS = {
    catalog: 'books.catalog.v2',
    package: 'books.package.v2',
    header: 'books.header.v2',
    section: 'books.section.v2',
    progress: 'books.progress.v2',
    bundle: 'books.bundle.v2'
  };
  var LEGACY_SCHEMAS = {
    catalog: 'memcpp.catalog.v1',
    package: 'memcpp.package.v1',
    header: 'memcpp.header.v1',
    section: 'memcpp.section.v1',
    progress: 'memcpp.progress.v1',
    bundle: 'memcpp.package-bundle.v1'
  };

  var ACCENTS = [
    { id: 'blue', label: 'Azul', legacy: 'text' },
    { id: 'teal', label: 'Verde-água', legacy: 'rodata' },
    { id: 'amber', label: 'Âmbar', legacy: 'data' },
    { id: 'gray', label: 'Cinza', legacy: 'bss' },
    { id: 'violet', label: 'Violeta', legacy: 'stack' },
    { id: 'orange', label: 'Laranja', legacy: 'heap' },
    { id: 'pink', label: 'Rosa', legacy: 'obj' },
    { id: 'slate', label: 'Ardósia', legacy: 'kernel' },
    { id: 'green', label: 'Verde' },
    { id: 'red', label: 'Vermelho' },
    { id: 'cyan', label: 'Ciano' }
  ];

  var TONES = ['ok', 'warn', 'bad', 'dim'].concat(ACCENTS.map(function (a) { return a.id; }));

  var LIMITS = { sectionId: /^[a-z0-9][a-z0-9-]*$/, bookId: /^[a-z0-9][a-z0-9-]*$/, anchorId: /^[A-Za-z][A-Za-z0-9_-]*$/ };

  function accentId(value) {
    if (!value) return '';
    var v = String(value).trim();
    var found = ACCENTS.find(function (a) { return a.id === v || a.legacy === v; });
    return found ? found.id : '';
  }
  function accentCss(value) {
    var id = accentId(value);
    if (id) return 'var(--accent-' + id + ')';
    if (/^#[0-9a-f]{3,8}$/i.test(String(value || '').trim())) return String(value).trim();
    return '';
  }

  Books.schema = { SCHEMAS: SCHEMAS, LEGACY_SCHEMAS: LEGACY_SCHEMAS, ACCENTS: ACCENTS, TONES: TONES,
    LIMITS: LIMITS, accentId: accentId, accentCss: accentCss };
})();
