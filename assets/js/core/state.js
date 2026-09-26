(function () {
  'use strict';
  Books.state = {
    catalog: null,     // catálogo carregado
    pkg: null,         // pacote aberto: { manifest, header, sections[] } (pode conter edições não salvas)
    original: null,    // cópia do pacote como foi carregado (para "restaurar")
    dirty: false,      // há edições não salvas na pasta
    fileProgress: {}   // progresso base vindo de content/progress.json
  };
})();
