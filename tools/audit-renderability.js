#!/usr/bin/env node
/* Auditoria de renderização real para conteúdo v2.
 * Verifica KaTeX via a mesma versão vendorizada, referências de assets, SVG e
 * heurísticas de padronização de exercícios/fórmulas. Mermaid é verificado por
 * sintaxe estrutural aqui e renderizado pelo script auxiliar no relatório.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const katex = require('../assets/vendor/katex.min.js');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const content = path.join(root, 'content');
const catalog = JSON.parse(fs.readFileSync(path.join(content, 'catalog.json'), 'utf8'));
const errors = [], warnings = [], stats = { books: 0, sections: 0, mathBlocks: 0, inlineMath: 0, mermaid: 0, svg: 0, images: 0, exercises: 0, subsections: 0, compatibilityFixtures: 0 };
const inlineKeys = new Set(['text', 'caption', 'shortBio', 'insight', 'title', 'subtitle', 'guideText', 'footer', 'prompt', 'hint', 'reading', 'description', 'name']);
const formulaCommand = /\\(?:frac|dfrac|tfrac|sqrt|sum|prod|int|oint|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|phi|Phi|psi|Psi|rho|omega|operatorname|mathbb|mathbf|mathrm|left|right|langle|rangle|lvert|rvert|binom|infty|leq|geq|cdot|times|rightarrow|to|approx|sim|notin|subset|cup|cap|begin|end|text|overline|dagger|qquad|quad|,|;|!|\s)/;

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function add(list, book, location, message) { list.push({ book, location, message }); }
function normalizeTex(tex) {
  return String(tex || '').replace(/\\\s+(?=[A-Za-z])/g, '\\').replace(/\\rac\b/g, '\\frac').replace(/\\ange\b/g, '\\rangle');
}
function renderTex(tex, display, book, location) {
  stats.inlineMath += display ? 0 : 1;
  try {
    katex.renderToString(normalizeTex(tex), { displayMode: !!display, throwOnError: true, strict: 'ignore', trust: false, macros: {
      '\\ket': '\\left|#1\\right\\rangle', '\\bra': '\\left\\langle#1\\right|', '\\braket': '\\left\\langle#1\\middle|#2\\right\\rangle',
      '\\abs': '\\left|#1\\right|', '\\norm': '\\left\\lVert#1\\right\\rVert', '\\R': '\\mathbb{R}', '\\C': '\\mathbb{C}'
    } });
  } catch (e) {
    add(errors, book, location, 'KaTeX: ' + e.message + ' | tex=' + JSON.stringify(String(tex)));
  }
}
function inspectInline(value, book, location) {
  if (typeof value !== 'string' || value.indexOf('$') === -1) return;
  let i = 0;
  while (i < value.length) {
    const start = value.indexOf('$', i);
    if (start < 0 || value[start - 1] === '\\') break;
    let end = start + 1;
    while (end < value.length) {
      if (value[end] === '$' && value[end - 1] !== '\\') break;
      end += 1;
    }
    if (end >= value.length) {
      add(errors, book, location, 'delimitador $ sem fechamento');
      break;
    }
    const tex = value.slice(start + 1, end);
    if (tex.trim() && !/^\d/.test(tex.trim()) && formulaCommand.test(tex)) renderTex(tex, false, book, location);
    i = end + 1;
  }
}
function walk(value, book, location, pkgDir) {
  if (Array.isArray(value)) return value.forEach((item, i) => walk(item, book, location + '[' + i + ']', pkgDir));
  if (!value || typeof value !== 'object') return;
  if (value.type === 'math') {
    stats.mathBlocks += 1;
    renderTex(value.tex, true, book, location + '.tex');
    if (typeof value.reading !== 'string' || !value.reading.trim()) add(errors, book, location + '.reading', 'bloco math sem leitura em português');
  }
  if (value.type === 'mermaid') {
    stats.mermaid += 1;
    if (typeof value.code !== 'string' || !/^(?:\s*%%[^\n]*\n\s*)*(?:---[\s\S]*?---\s*)?(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline|sankey(?:-beta)?|xychart(?:-beta)?|block(?:-beta)?|packet(?:-beta)?|architecture(?:-beta)?|C4Context|C4Container|C4Component|C4Dynamic|C4Container|kanban)\b/.test(value.code)) add(warnings, book, location + '.code', 'Mermaid não começa com um tipo reconhecido');
  }
  if (value.type === 'ai-diagram' && value.engine === 'mermaid') {
    stats.mermaid += 1;
    if (typeof value.source !== 'string' || !/^(?:\s*%%[^\n]*\n\s*)*(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline|sankey(?:-beta)?|xychart(?:-beta)?|block(?:-beta)?|packet(?:-beta)?|architecture(?:-beta)?|kanban)\b/.test(value.source)) add(warnings, book, location + '.source', 'fonte Mermaid não começa com um tipo reconhecido');
  }
  if (value.type === 'svg' || (value.type === 'ai-diagram' && value.engine === 'svg')) {
    stats.svg += 1;
    const svg = value.svg || value.source || '';
    if (!/<svg(?:\s|>)/i.test(svg)) add(errors, book, location, 'SVG sem elemento raiz <svg>');
    if (/<(?:script|foreignObject|iframe)\b/i.test(svg) || /\bon[a-z]+\s*=/i.test(svg)) add(errors, book, location, 'SVG contém elemento ou atributo executável');
  }
  if (value.type === 'image') {
    stats.images += 1;
    if (!value.alt || !String(value.alt).trim()) add(errors, book, location + '.alt', 'imagem sem texto alternativo');
    if (value.src && !/^(?:data:|https?:|blob:|\/)/i.test(value.src)) {
      const file = path.join(pkgDir, value.src);
      if (!fs.existsSync(file)) add(errors, book, location + '.src', 'asset ausente: ' + value.src);
    }
  }
  if (value.type === 'subsection') stats.subsections += 1;
  if (value.type === 'exercise') {
    stats.exercises += 1;
    if (!Array.isArray(value.solutionBlocks) || !value.solutionBlocks.length) add(errors, book, location + '.solutionBlocks', 'exercício sem solução expansível');
    if (!value.prompt || !String(value.prompt).trim()) add(errors, book, location + '.prompt', 'exercício sem enunciado');
  }
  Object.keys(value).forEach(key => {
    if (inlineKeys.has(key)) inspectInline(value[key], book, location + '.' + key);
    if (key !== 'type') walk(value[key], book, location + '.' + key, pkgDir);
  });
}

for (const entry of catalog.packages || []) {
  stats.books += 1;
  const manifestFile = path.join(content, entry.manifest);
  const manifest = readJson(manifestFile);
  const pkgDir = path.dirname(manifestFile);
  const header = readJson(path.join(pkgDir, manifest.header));
  if (header.cover && header.cover.src && !/^(?:data:|https?:|blob:|\/)/i.test(header.cover.src)) {
    if (!fs.existsSync(path.join(pkgDir, header.cover.src))) add(errors, entry.id, 'header.cover.src', 'capa ausente: ' + header.cover.src);
  }
  for (const sectionRef of manifest.sections || []) {
    stats.sections += 1;
    const section = readJson(path.join(pkgDir, sectionRef));
    walk(section, entry.id, 'sections.' + section.id, pkgDir);
  }
}

for (const [label, tex] of [
  ['malformed-rac', '\\Phi^+\\ angle = \\rac{|00\\ angle + |11\\ angle}{\\sqrt{2}}'],
  ['malformed-space-frac', '\\alpha|0\\ angle + \\beta|1\\ angle,\\qquad |\\alpha|^2+|\\beta|^2=1']
]) {
  stats.compatibilityFixtures += 1;
  renderTex(tex, true, 'compatibility-fixture', label);
}

const out = { generatedAt: new Date().toISOString(), stats, errors, warnings };
console.log(JSON.stringify(out, null, 2));
process.exitCode = errors.length ? 1 : 0;
