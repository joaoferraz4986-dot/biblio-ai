#!/usr/bin/env node
/*
 * Valida todos os livros listados em content/catalog.json.
 * Roda em Node (sem navegador) reaproveitando os mesmos módulos usados no site
 * (assets/js/core, blocks, content) — a validação nunca fica dessincronizada do formato real.
 *
 * Uso:
 *   node tools/validate.js               # valida content/catalog.json
 *   node tools/validate.js <pasta>        # valida <pasta>/content/catalog.json
 *
 * Saída: 0 se não houver erros (avisos não bloqueiam); 1 caso contrário.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const contentDir = path.join(root, 'content');

const MODULES = [
  'core/namespace.js', 'core/util.js', 'core/schema.js',
  'content/inline.js', 'content/sanitize.js', 'content/highlight.js', 'content/icons.js',
  'blocks/registry.js', 'blocks/text.js', 'blocks/code.js', 'blocks/diagram.js', 'blocks/history.js', 'blocks/data.js', 'blocks/layout.js', 'blocks/math.js', 'blocks/exercise.js', 'blocks/media.js',
  'content/validate.js', 'content/migrate.js'
];

// Sandbox mínimo: só o necessário para os módulos "puros" (sem DOM) funcionarem em Node.
function fakeElement() {
  const el = {
    style: {}, attributes: {}, children: [], childNodes: [],
    setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; },
    appendChild(c) { this.children.push(c); this.childNodes.push(c); return c; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    remove() {}, classList: { add() {}, remove() {}, toggle() {} },
  };
  return el;
}
const sandbox = {
  console,
  document: {
    createElement: fakeElement, createElementNS: fakeElement,
    createDocumentFragment: fakeElement, createTextNode: (t) => ({ nodeType: 3, textContent: t }),
  },
  globalThis: undefined,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const rel of MODULES) {
  const file = path.join(root, 'assets', 'js', rel);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: rel });
}
const Books = sandbox.Books;

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const catalog = readJson(path.join(contentDir, 'catalog.json'));
let totalErrors = 0, totalWarnings = 0;

if (!catalog.packages || !catalog.packages.length) {
  console.log('Nenhum livro no catálogo.');
  process.exit(0);
}

catalog.packages.forEach((entry) => {
  const manifestPath = path.join(contentDir, entry.manifest);
  const pkgDir = path.dirname(manifestPath);
  const manifest = readJson(manifestPath);
  const header = readJson(path.join(pkgDir, manifest.header));
  const sections = manifest.sections.map((s) => readJson(path.join(pkgDir, s)));
  const normalized = Books.migrate.normalizePackage({ manifest, header, sections });
  const report = Books.validate.package(normalized);
  console.log(`\n== ${entry.id} (${sections.length} seções) ==`);
  if (!report.errors.length && !report.warnings.length) console.log('  OK');
  else console.log(report.format().split('\n').map((l) => '  ' + l).join('\n'));
  totalErrors += report.errors.length;
  totalWarnings += report.warnings.length;
});

console.log(`\n${totalErrors} erro(s), ${totalWarnings} aviso(s) no total.`);
process.exit(totalErrors > 0 ? 1 : 0);
