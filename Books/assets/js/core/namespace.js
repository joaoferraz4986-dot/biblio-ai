/*
 * Namespace global `Books`.
 *
 * O projeto usa scripts clássicos (não ES modules) de propósito: assim o site continua
 * abrindo por duplo clique (file://), onde navegadores bloqueiam `import`/`fetch`.
 * Cada arquivo registra um módulo em `Books.<nome>`; a ordem de carga está em Livros.html.
 * Os módulos "puros" (schema, blocks/*, content/validate) não tocam o DOM ao carregar e por
 * isso também rodam em Node (tools/validate.js, tools/gen-docs.js).
 */
(function (root) {
  'use strict';
  var Books = (root.Books = root.Books || {});
  Books.version = '2.0.0';
})(globalThis);
