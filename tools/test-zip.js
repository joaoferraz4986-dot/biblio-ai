#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('assets/js/editor/zip.js', 'utf8');
const context = { Books: {}, Blob, TextEncoder, TextDecoder, Uint8Array, Uint32Array, DecompressionStream, Response, Promise };
vm.runInNewContext(source, context);
async function main() {
  const blob = context.Books.zip.build([
    { name: 'content/catalog.json', data: '{"packages":[{"id":"teste"}]}' },
    { name: 'content/packages/teste/manifest.json', data: '{"id":"teste"}' },
    { name: 'content/packages/teste/media/demo.mp4', data: new Uint8Array([0, 1, 2, 3, 4]) }
  ]);
  const entries = await context.Books.zip.read(blob);
  const names = entries.map((e) => e.name).sort();
  const expected = [
    'content/catalog.json',
    'content/packages/teste/manifest.json',
    'content/packages/teste/media/demo.mp4'
  ];
  if (JSON.stringify(names) !== JSON.stringify(expected)) throw new Error('round-trip de ZIP falhou: ' + names.join(', '));
  const media = entries.find((e) => /demo\.mp4$/.test(e.name));
  if (media.data.length !== 5 || media.data[4] !== 4) throw new Error('bytes de mídia foram alterados');
  let rejected = false;
  try { context.Books.zip.build([{ name: '../unsafe.json', data: '{}' }]); } catch (e) { rejected = true; }
  if (!rejected) throw new Error('caminho inseguro não foi rejeitado');
  console.log('ZIP round-trip: OK; caminho inseguro: OK; mídia binária: OK');
}
main().catch((error) => { console.error(error); process.exit(1); });
