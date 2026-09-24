# Arquitetura

Sem bundler, sem framework: scripts clássicos (`<script src>`, não `type="module"`)
para que `Livros.html` continue abrindo por duplo clique (`file://`), onde
navegadores bloqueiam `import`/`fetch`. Cada arquivo define um único módulo em
`Books.<nome>`; a ordem de carregamento em `Livros.html` respeita as dependências
entre eles.

## Por que essa organização

O projeto anterior tinha um `app.js` de ~300 linhas fazendo leitura, edição e
persistência ao mesmo tempo, e um CSS de ~175 linhas sem separação clara entre
tokens, layout e componentes — qualquer mudança pequena exigia entender o
arquivo inteiro. Esta versão separa por responsabilidade: cada arquivo faz uma
coisa, é pequeno o bastante para ler de uma vez, e tem um comentário no topo
explicando seu papel.

## Mapa dos módulos JS

```
core/         sem DOM — rodam em navegador e em Node (tools/validate.js)
  namespace.js   window.Books
  util.js        h(), clone, debounce, uid, slugify, download, safeUrl…
  events.js      barramento pub/sub (Books.events.on/emit)
  store.js       localStorage com tratamento de erro
  schema.js      constantes do formato (schemas, paleta de cores, tons)
  state.js       estado compartilhado (catálogo, pacote aberto, progresso)
  personalization.js  tema/plano de fundo/fonte: catálogo de opções (THEMES/BACKGROUNDS/FONTS),
                       aplica via data-theme/data-bg + variáveis --font-*, persiste em
                       localStorage e (ao salvar) em content/settings.json

content/      lógica de conteúdo — a maior parte também roda em Node
  inline.js      parser da marcação inline (**negrito**, {tom|texto}…)
  sanitize.js    sanitização de SVG e HTML (listas de permissão)
  highlight.js   realce de sintaxe (tokenizer por regex, sem dependência)
  icons.js       ícones SVG inline
  validate.js    valida um pacote contra o formato (Books.validate)
  migrate.js     normaliza pacotes v1 (legado) e v2 para o formato atual
  repository.js  carrega catálogo/pacotes (fetch ou bundle embutido), localiza
                 capas/imagens e persiste pacote, catálogo, progresso, settings
                 e bundle na pasta do projeto (File System Access API)

blocks/       um tipo de bloco por arquivo, todos via Books.blocks.register()
  registry.js    registro central: create/render/walk/summary
  text.js        heading, paragraph, list, quote, callout, steps, divider
  code.js        code (realce de sintaxe)
  diagram.js     mermaid, ai-diagram, svg, image
  data.js        table
  layout.js      subsection, details, columns, html
  math.js        math — equação LaTeX em destaque (matemática inline vive em
                  content/inline.js, não é um bloco)

render/       desenha o LIVRO (leitor)
  diagrams.js    renderização preguiçosa de diagramas Mermaid
  math.js        renderização preguiçosa de fórmulas LaTeX (KaTeX) — inline e em bloco
  book.js        cabeçalho, sumário, seções — usa Books.blocks.render()

ui/           interações do leitor
  toast.js, progress.js (grava percentual/posição e "opened", o timestamp da última abertura,
  usado para ordenar a biblioteca), focus.js, navigation.js (Alt+setas, sumário), library.js
  (grade da biblioteca, ordenada pelos últimos abertos), settings-panel.js (modal de
  personalização — tema/fundo/fonte, com prévia — aberto pelo botão "configurações" na biblioteca)

editor/       o editor visual — só carrega o que o leitor não precisa
  fields.js      controles genéricos de formulário a partir da definição de campo
  blocks-tree.js árvore de edição recursiva de blocos (usa fields.js)
  zip.js         empacotador/leitor ZIP mínimo (sem dependências), com suporte a
                 arquivos deflate comuns e assets binários
  ai-prompt.js   monta o prompt completo para pedir um ZIP de livro a uma IA (a
                 partir do registro de blocos — nunca fica desatualizado)
  main.js        casca do editor: abas, validação, importar/exportar, salvar

app.js        bootstrap: carrega catálogo, abre a seleção inicial, liga o dock
```

## Aplicativo desktop

O mesmo `Livros.html` é carregado pelo Tauri 2. `core/native.js` detecta o runtime
desktop sem interferir na versão web e encaminha leitura, gravação, remoção e
listagem de arquivos para `src-tauri/src/lib.rs`. O leitor continua usando os
mesmos módulos e dados; apenas `repository.js`, a exportação e os assets
personalizados trocam File System Access API/downloads por I/O nativo quando o
runtime está disponível.

O `flake.nix` fornece o ambiente declarativo com Rust, `cargo-tauri`, Node.js,
WebKitGTK 4.1, OpenSSL, GLib networking, librsvg e `pkg-config`. A pasta escolhida
é a única raiz recebida pelos comandos de projeto e o único diretório autorizado
dinamicamente no asset protocol; a escolha fica persistida na configuração do
aplicativo. Caminhos absolutos, traversal e links simbólicos são rejeitados.

## Um bloco = uma fonte de verdade

Cada tipo de bloco (`assets/js/blocks/*.js`) declara, num só lugar, tudo que é
preciso saber sobre ele: como editar (`fields`), como desenhar no leitor
(`render`), como resumir no editor (`summary`), documentação (`doc`, `example`).
A validação (`content/validate.js`), o editor visual (`editor/blocks-tree.js`) e
o prompt de IA (`editor/ai-prompt.js`) leem essa definição em vez de duplicar
regras — adicionar um bloco novo não exige tocar em mais nada além do arquivo do
bloco e do `<script>` em `Livros.html` (ver o fim de
`docs/FORMATO-DO-LIVRO.md`).

## CSS modular

```
tokens.css              cores, tipografia, espaçamento, raios — mude a aparência
                         do site inteiro editando só este arquivo, quando possível
reset.css                reset mínimo + regra "nada tem largura fixa em px"
layout.css                capa, grade sumário+conteúdo, rodapé
components/               dock, botões, toast, biblioteca — reutilizáveis
editor/                    casca do editor e campos de formulário
blocks/                    um arquivo por grupo de blocos (text/code/diagram/
                           data/layout) — companion direto de assets/js/blocks/
responsive.css             ajustes finos que não couberam nos arquivos acima
```

Regra fixa (é o que corrigia o bug do callout que não expandia horizontalmente):
todo bloco de conteúdo é `width: 100%` dentro do seu contêiner — nunca
`display: inline-block`, `float` ou uma largura fixa em `px`. `* { box-sizing:
border-box }` está no reset, então padding nunca estoura a largura do pai.

## Formato de conteúdo: por que blocos tipados, e não HTML

A versão anterior guardava HTML cru dentro do JSON de cada seção. Isso deixava
a edição estrutural (mover um parágrafo, trocar um callout de lugar) equivalente
a editar HTML à mão, e uma IA gerando conteúdo precisava acertar marcação e
classes CSS exatas. Blocos tipados (`{ "type": "callout", "variant": "warning",
"text": "…" }`) são mais fáceis de gerar, validar e editar visualmente — e o
JSON continua sendo a fonte de verdade: o código é que decide como cada tipo de
bloco vira HTML na tela, então mudar a aparência de todos os callouts do livro
é uma mudança em um lugar (`assets/js/blocks/text.js` +
`assets/css/blocks/text.css`), não uma busca-e-substitui em oito arquivos JSON.

## Compatibilidade com `file://`

Duas restrições de navegador moldam a arquitetura:

- **`fetch()` de arquivo local é bloqueado.** Por isso `content/repository.js`
  detecta `location.protocol === 'file:'` e usa
  `assets/js/embedded-bundle.js` (gerado por `tools/build_bundle.py`) em vez de
  buscar `content/*.json` via rede.
- **`<script type="module">` não executa em alguns navegadores sob `file://`.**
  Por isso todo o projeto usa scripts clássicos com um namespace global
  (`Books`), carregados em ordem de dependência.

Imagens (capa, `image` blocks) continuam como arquivos de verdade — `<img
src="…">` carrega normalmente em `file://`; só o JSON precisa do bundle. A capa
fica em `cover.<ext>` na raiz do pacote; imagens usadas em blocos ficam à parte,
em `images/` dentro da pasta do livro. Ao salvar, `content/repository.js`
(`localizeAssets`) converte uploads e URLs externas em arquivos locais — nunca
depende de um arquivo fora do projeto — e apaga da pasta qualquer imagem que
deixou de ser referenciada (bloco removido, capa trocada/removida, imagem
removida de um bloco). SVG é a exceção: fica embutido no JSON em vez de virar
arquivo, já que o bloco dedicado `svg` cobre vetores.

Mermaid (`assets/vendor/mermaid.min.js`) e KaTeX (`assets/vendor/katex.min.js` +
`katex.min.css` + `assets/vendor/fonts/*.woff2`) seguem a mesma lógica: vendorizados
localmente e carregados sob demanda (só quando a seção que está na tela realmente
tem um diagrama ou uma fórmula), com um fallback para CDN caso o arquivo local
falhe — nenhum dos dois é necessário para abrir e ler um livro que não os usa.
