(function () {
  'use strict';
  var menu = null;
  var current = null;
  var blocks = typeof WeakMap === 'function' ? new WeakMap() : null;
  var h = function () { return Books.util.h.apply(null, arguments); };
  var CPP = {
    auto: 'deduz o tipo da variável a partir do inicializador',
    bool: 'tipo lógico com os valores true e false',
    char: 'tipo para um caractere ou unidade pequena de armazenamento',
    class: 'declara uma classe com membros privados por padrão',
    const: 'impede alterações por meio daquele identificador',
    constexpr: 'permite avaliação em tempo de compilação quando possível',
    consteval: 'exige que a função seja avaliada em tempo de compilação',
    constinit: 'exige inicialização estática de uma variável',
    concept: 'define uma restrição nomeada para parâmetros genéricos',
    co_await: 'suspende uma coroutine até uma operação assíncrona',
    co_return: 'retorna um valor ou encerra uma coroutine',
    co_yield: 'produz um valor intermediário de uma coroutine',
    decltype: 'obtém o tipo de uma expressão sem avaliá-la',
    default: 'solicita a implementação padrão ou o ramo padrão',
    delete: 'libera memória ou desabilita uma operação especial',
    enum: 'declara um conjunto de constantes nomeadas',
    explicit: 'impede conversões implícitas em construtores e operadores',
    export: 'marca uma declaração exportável em módulos ou templates',
    extern: 'declara algo definido em outra unidade de tradução',
    false: 'literal lógico que representa ausência de verdade',
    friend: 'concede acesso de uma classe a uma função ou classe externa',
    inline: 'sugere uma definição múltipla permitida e uma possível expansão',
    mutable: 'permite alterar membro mesmo em objeto const',
    namespace: 'agrupa nomes e evita colisões',
    nullptr: 'ponteiro nulo tipado de C++',
    operator: 'declara ou usa uma sobrecarga de operador',
    private: 'restringe acesso aos membros da classe',
    protected: 'permite acesso à classe e às classes derivadas',
    public: 'torna membros acessíveis pelo código cliente',
    requires: 'expressa restrições de um template ou conceito',
    static: 'controla armazenamento, ligação ou membro compartilhado',
    struct: 'declara uma estrutura com membros públicos por padrão',
    template: 'declara código genérico parametrizado',
    this: 'ponteiro para o objeto atual',
    thread_local: 'cria uma instância da variável por thread',
    throw: 'lança uma exceção',
    true: 'literal lógico que representa verdade',
    try: 'inicia uma região que pode capturar exceções',
    typeid: 'obtém informação de tipo em tempo de execução',
    typename: 'indica que um nome dependente é um tipo',
    union: 'permite compartilhar a mesma região de memória entre campos',
    using: 'cria alias, importa nomes ou introduz uma declaração',
    virtual: 'habilita despacho dinâmico e funções virtuais',
    void: 'indica ausência de valor ou tipo genérico de ponteiro',
    volatile: 'indica que o valor pode mudar fora do fluxo observado',
    wchar_t: 'tipo para caractere largo',
    while: 'repete enquanto a condição for verdadeira',
    constexpr_if: 'condição descartável em tempo de compilação',
    std: 'namespace da biblioteca padrão',
    vector: 'contêiner contíguo redimensionável',
    array: 'contêiner de tamanho fixo',
    map: 'contêiner ordenado de chaves e valores',
    unordered_map: 'contêiner hash de chaves e valores',
    set: 'contêiner ordenado de valores únicos',
    optional: 'representa valor presente ou ausente',
    variant: 'armazena uma alternativa entre vários tipos',
    tuple: 'agrupa valores de tipos possivelmente diferentes',
    string: 'sequência de caracteres da biblioteca padrão',
    unique_ptr: 'ponteiro inteligente com propriedade exclusiva',
    shared_ptr: 'ponteiro inteligente com propriedade compartilhada',
    weak_ptr: 'referência não proprietária para shared_ptr',
    move: 'converte para referência de rvalue para mover recursos',
    make_unique: 'cria unique_ptr com alocação segura',
    make_shared: 'cria shared_ptr com alocação combinada',
    begin: 'obtém iterador para o início de uma sequência',
    end: 'obtém iterador sentinela para o fim de uma sequência',
    size: 'obtém a quantidade de elementos',
    push_back: 'adiciona elemento ao final de um contêiner',
    emplace_back: 'constrói elemento diretamente no final',
    sort: 'ordena elementos usando um comparador',
    find: 'procura um elemento em uma sequência ou contêiner',
    lower_bound: 'localiza a primeira posição não menor que um valor',
    accumulate: 'acumula valores de uma sequência',
    lambda: 'função anônima, normalmente escrita com captura []'
  };
  var LATEX = {
    alpha: 'letra grega alfa', beta: 'letra grega beta', gamma: 'letra grega gama', delta: 'letra grega delta',
    epsilon: 'letra grega épsilon', theta: 'letra grega teta', lambda: 'letra grega lambda', mu: 'letra grega mi',
    pi: 'constante pi', sigma: 'letra grega sigma', phi: 'letra grega fi', psi: 'letra grega psi', omega: 'letra grega ômega',
    Gamma: 'letra grega gama maiúscula', Delta: 'letra grega delta maiúscula', Theta: 'letra grega teta maiúscula',
    Lambda: 'letra grega lambda maiúscula', Pi: 'letra grega pi maiúscula', Sigma: 'letra grega sigma maiúscula',
    Phi: 'letra grega fi maiúscula', Psi: 'letra grega psi maiúscula', Omega: 'letra grega ômega maiúscula',
    frac: 'fração: primeiro argumento é numerador e segundo é denominador', dfrac: 'fração em estilo de exibição',
    tfrac: 'fração em estilo compacto', sqrt: 'raiz quadrada ou raiz com índice opcional', root: 'raiz com índice explícito',
    sum: 'somatório', prod: 'produtório', int: 'integral', iint: 'integral dupla', oint: 'integral de contorno',
    lim: 'limite', min: 'mínimo', max: 'máximo', sup: 'supremo', inf: 'ínfimo',
    sin: 'seno', cos: 'cosseno', tan: 'tangente', log: 'logaritmo', ln: 'logaritmo natural', exp: 'exponencial',
    cdot: 'multiplicação por ponto', times: 'multiplicação', div: 'divisão', pm: 'mais ou menos', mp: 'menos ou mais',
    le: 'menor ou igual', leq: 'menor ou igual', ge: 'maior ou igual', geq: 'maior ou igual', neq: 'diferente',
    approx: 'aproximadamente igual', equiv: 'equivalente', sim: 'semelhante', propto: 'proporcional a', in: 'pertence a',
    notin: 'não pertence a', subset: 'subconjunto', subseteq: 'subconjunto ou igual', supset: 'superconjunto',
    forall: 'para todo', exists: 'existe', neg: 'negação lógica', land: 'e lógico', lor: 'ou lógico',
    rightarrow: 'implicação ou seta para a direita', leftarrow: 'seta para a esquerda', leftrightarrow: 'equivalência',
    mapsto: 'mapeia para', to: 'tende a ou seta', infty: 'infinito', partial: 'derivada parcial', nabla: 'operador nabla',
    mathbb: 'alfabeto de números ou conjuntos em negrito vazado', mathcal: 'alfabeto caligráfico', mathrm: 'fonte romana',
   mathbf: 'fonte matemática em negrito', mathit: 'fonte matemática itálica', overline: 'linha sobre a expressão',
    underline: 'linha sob a expressão', vec: 'vetor com seta', hat: 'acento de chapéu', bar: 'barra sobre a expressão',
    text: 'insere texto dentro do modo matemático', operatorname: 'nomeia um operador matemático',
    left: 'ajusta delimitador esquerdo ao tamanho interno', right: 'ajusta delimitador direito ao tamanho interno',
    begin: 'inicia um ambiente LaTeX', end: 'encerra um ambiente LaTeX', matrix: 'matriz sem delimitadores', pmatrix: 'matriz entre parênteses',
    bmatrix: 'matriz entre colchetes', cases: 'casos definidos por condições', overbrace: 'chave sobre a expressão',
    underbrace: 'chave sob a expressão', quad: 'espaço horizontal grande', qquad: 'espaço horizontal muito grande',
    textstyle: 'força estilo de texto', displaystyle: 'força estilo de exibição', cdots: 'reticências centradas', ldots: 'reticências na linha',
    dots: 'reticências adaptadas ao contexto', prime: 'linha ou derivada prima', dagger: 'adaga', angle: 'ângulo', degree: 'graus'
  };
  var BASIC = { if: 1, else: 1, for: 1, int: 1, char: 1, bool: 1, true: 1, false: 1, '(': 1, ')': 1, '[': 1, ']': 1, '{': 1, '}': 1, raiz: 1, log: 1 };
  function exerciseCopy(block) { var copy = Books.util.clone(block); delete copy.solutionBlocks; return copy; }
  function payloadFor(block, mode) { return block.type === 'exercise' && mode !== 'copy' ? exerciseCopy(block) : Books.util.clone(block); }
  function textFor(block, mode, doubt) {
    var lines = [];
    if (mode === 'prompt') lines.push('Explique detalhadamente o conteúdo do bloco abaixo, definindo termos, etapas, exemplos, limites e erros.');
    else if (mode === 'history') lines.push('Pesquise e confirme as fontes históricas e biográficas deste bloco. Separe fatos documentados de interpretação.');
    else if (mode === 'doubt') lines.push('Analise o bloco abaixo e responda à dúvida organizada ao final, sem inventar fatos.');
    else if (mode === 'hint') lines.push('Forneça somente mais uma dica progressiva, sem solução ou código final.');
    else if (mode === 'adjust') lines.push('Ajuste o diagrama SVG sem mudar seu significado e preserve acessibilidade.');
    else lines.push('Bloco Books:');
    lines.push('', '```json', JSON.stringify(payloadFor(block, mode), null, 2), '```');
    if (block.type === 'exercise' && mode === 'hint') lines.push('', 'DICA JÁ DISPONÍVEL:', block.hint || '(nenhuma)');
    if (doubt) lines.push('', 'DÚVIDA DO USUÁRIO:', doubt.trim());
    return lines.join('\n');
  }
  function isImageBlock(block) { return block && (block.type === 'image' || block.type === 'svg' || (block.type === 'ai-diagram' && block.engine === 'svg')); }
  function isSvgImage(block) { var src = block && (block.src || block.svg || block.source || ''); return block && (block.type === 'svg' || (block.type === 'ai-diagram' && block.engine === 'svg') || /(^data:image\/svg|\.svg(?:$|[?#]))/i.test(src)); }
  function imageSrc(block, element) { return element && element.querySelector && element.querySelector('img') ? element.querySelector('img').src : (block.src || block.svg || block.source || ''); }
  function copyImage(block, element) { var src = imageSrc(block, element); if (/^<svg/i.test(src)) return Books.util.copyText(src); return fetch(src).then(function (r) { return r.blob(); }).then(function (blob) { if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') return navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]); return Books.util.copyText(src); }).catch(function () { return Books.util.copyText(src); }); }
  function adjustSvg(block) {
    var overlay = h('div', { class: 'block-context__dialog', role: 'dialog', 'aria-modal': 'true' });
    var area = h('textarea', { rows: 6, placeholder: 'Ex.: alinhar rótulos, aumentar contraste e corrigir a legenda…' });
    var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'cancelar');
    var confirm = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'copiar prompt');
    var close = function () { overlay.remove(); };
    cancel.addEventListener('click', close);
    confirm.addEventListener('click', function () { var issue = area.value.trim(); if (!issue) { area.focus(); return; } copy('adjust', issue); close(); });
    overlay.appendChild(h('div', { class: 'block-context__dialog-card' }, h('h3', null, 'Problemas do diagrama SVG'), h('p', { class: 'hint' }, 'Descreva os ajustes em Markdown.'), area, h('div', { class: 'block-context__dialog-actions' }, cancel, confirm)));
    document.body.appendChild(overlay); area.focus();
  }
  function extractEntries(block) {
    var source = block.type === 'math' ? String(block.tex || '') : String(block.code || '');
    var map = block.type === 'math' ? LATEX : CPP;
    var found = [];
    if (block.type === 'math') {
      var matches = source.match(/\\[A-Za-z]+|[A-Za-z]+|[+\-*/=<>|()[\]{}_^]/g) || [];
      matches.forEach(function (token) { var key = token.charAt(0) === '\\' ? token.slice(1) : token; if (!BASIC[token] && !BASIC[key] && map[key] && found.indexOf(key) < 0) found.push(key); });
    } else {
      var matches = source.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
      matches.forEach(function (token) { if (!BASIC[token] && map[token] && found.indexOf(token) < 0) found.push(token); });
      (source.match(/::|->|<<|>>|<=|>=|==|!=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%|[{}()[\];,.:?&*<>!=+\-/]/g) || []).forEach(function (token) { if (!BASIC[token] && found.indexOf(token) < 0) found.push(token); });
    }
    return found.map(function (key) { return { key: key, description: map[key] || operatorDescription(key) }; });
  }
  function operatorDescription(key) { var values = { '::': 'acesso a membro de namespace ou classe', '->': 'acesso a membro por ponteiro', '<<': 'deslocamento à esquerda ou saída em stream', '>>': 'deslocamento à direita ou entrada em stream', '&&': 'e lógico', '||': 'ou lógico', '==': 'comparação de igualdade', '!=': 'comparação de diferença', '<=': 'menor ou igual', '>=': 'maior ou igual', '++': 'incremento', '--': 'decremento', '+=': 'soma e atribuição', '-=': 'subtração e atribuição', '*=': 'multiplicação e atribuição', '/=': 'divisão e atribuição', '%': 'resto da divisão', '&': 'endereço ou operação bit a bit', '*': 'desreferência, multiplicação ou ponteiro', '?': 'operador condicional', ':': 'separador de rótulo, tipo ou inicializador' }; return values[key] || 'símbolo estrutural usado pela linguagem'; }
  function describeSymbols(block) {
    var entries = extractEntries(block);
    var overlay = h('div', { class: 'block-context__dialog symbol-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': block.type === 'math' ? 'Descrição de símbolos LaTeX' : 'Descrição de palavras-chave C++' });
    var title = block.type === 'math' ? 'Descrever símbolos no LaTeX' : 'Descrever palavras-chave no C++';
    var search = h('input', { type: 'search', placeholder: 'buscar símbolo ou palavra-chave…', 'aria-label': 'Buscar descrição' });
    var list = h('div', { class: 'symbol-dialog__list' });
    function draw() { var q = search.value.toLowerCase(); Books.util.clear(list); var filtered = entries.filter(function (item) { return !q || item.key.toLowerCase().indexOf(q) !== -1 || item.description.toLowerCase().indexOf(q) !== -1; }); if (!filtered.length) list.appendChild(h('p', { class: 'hint' }, entries.length ? 'Nenhum resultado.' : 'Nenhum símbolo não básico foi encontrado neste bloco.')); filtered.forEach(function (item) { list.appendChild(h('article', { class: 'symbol-dialog__item' }, h('code', null, block.type === 'math' && item.key.length > 1 ? '\\' + item.key : item.key), h('p', null, item.description))); }); }
    search.addEventListener('input', draw);
    var close = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'fechar');
    close.addEventListener('click', function () { overlay.remove(); });
    overlay.appendChild(h('div', { class: 'block-context__dialog-card symbol-dialog__card' }, h('h3', null, title), h('p', { class: 'hint' }, 'Os itens básicos são ocultados para manter a leitura focada.'), search, list, h('div', { class: 'block-context__dialog-actions' }, close)));
    document.body.appendChild(overlay); draw(); search.focus();
  }
  function hide() { if (menu) menu.hidden = true; current = null; }
  function copy(mode, doubt) { if (!current) return; Books.util.copyText(textFor(current.block, mode, doubt)).then(function () { Books.toast.show(mode === 'hint' ? 'Exercício copiado sem resposta.' : 'Bloco copiado para a área de transferência.', { tone: 'ok' }); hide(); }); }
  function askDoubt() { var overlay = h('div', { class: 'block-context__dialog', role: 'dialog', 'aria-modal': 'true' }); var area = h('textarea', { rows: 5, placeholder: 'Ex.: explique o passo em que a hipótese é usada…' }); var cancel = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'cancelar'); var confirm = h('button', { type: 'button', class: 'btn btn--primary btn--sm' }, 'copiar'); var close = function () { overlay.remove(); }; cancel.addEventListener('click', close); confirm.addEventListener('click', function () { var value = area.value.trim(); if (!value) { area.focus(); return; } copy('doubt', value); close(); }); overlay.appendChild(h('div', { class: 'block-context__dialog-card' }, h('h3', null, 'Adicionar dúvida'), h('p', { class: 'hint' }, 'A dúvida será organizada ao final do prompt copiado.'), area, h('div', { class: 'block-context__dialog-actions' }, cancel, confirm))); document.body.appendChild(overlay); area.focus(); }
  function show(x, y, block, element) {
    current = { block: block, el: element }; Books.util.clear(menu); var items;
    if (isImageBlock(block)) { items = [['image-copy', 'Copiar imagem'], ['lens', 'Pesquisar com Google Lens']]; if (isSvgImage(block)) items.push(['adjust', 'Copiar prompt de ajuste do diagrama']); }
    else { items = [['copy', 'Copiar bloco'], ['prompt', 'Copiar bloco com um prompt'], ['doubt', 'Copiar bloco com dúvida']]; if (block.type === 'code') items.unshift(['describe-code', 'Descrever palavras-chave no C++']); if (block.type === 'math') items.unshift(['describe-math', 'Descrever símbolos no LaTeX']); if (block.type === 'exercise') items.push(['hint', 'Mais uma dica (sem resposta)']); if (block.type === 'history') items.push(['history', 'Copiar bio/hist com prompt de fontes']); }
    items.forEach(function (item) { var button = h('button', { type: 'button', class: 'block-context__item', role: 'menuitem' }, item[1]); button.addEventListener('click', function () { if (item[0] === 'describe-code' || item[0] === 'describe-math') { describeSymbols(block); hide(); } else if (item[0] === 'doubt') askDoubt(); else if (item[0] === 'image-copy') copyImage(block, current.el).then(function () { Books.toast.show('Imagem copiada.', { tone: 'ok' }); hide(); }); else if (item[0] === 'lens') { Books.util.copyText(imageSrc(block, current.el)).then(function () { window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(imageSrc(block, current.el)), '_blank', 'noopener'); hide(); }); } else if (item[0] === 'adjust') adjustSvg(block); else copy(item[0]); }); menu.appendChild(button); });
    menu.hidden = false; var rect = menu.getBoundingClientRect(); menu.style.left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)) + 'px'; menu.style.top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) + 'px';
  }
  function bind(el, block) { if (blocks) blocks.set(el, block); }
  function init() { menu = document.getElementById('blockContextMenu') || h('div', { class: 'block-context', role: 'menu', hidden: true }); if (!menu.parentNode) document.body.appendChild(menu); document.addEventListener('contextmenu', function (event) { var el = event.target.closest && event.target.closest('[data-block]'); if (!el || !blocks || !blocks.has(el)) return; event.preventDefault(); show(event.clientX, event.clientY, blocks.get(el), el); }); document.addEventListener('click', function (event) { if (!menu || menu.hidden || menu.contains(event.target)) return; hide(); }); window.addEventListener('blur', hide); window.addEventListener('resize', hide); document.addEventListener('keydown', function (event) { if (event.key === 'Escape') hide(); }); }
  Books.blockContext = { init: init, bind: bind, copyText: textFor };
})();
