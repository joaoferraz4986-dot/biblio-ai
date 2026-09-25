# Formato de um livro

Esta é a referência completa do formato. Ela é a mesma usada para gerar o prompt
que o editor copia no botão **"copiar prompt para IA"** (aba _Importar / Exportar_),
então pedir a uma IA para escrever um livro inteiro — ou uma seção — é
só colar esse prompt em qualquer IA e colar a resposta de volta na mesma aba.

## Visão geral

Um livro (um "pacote") é uma pasta em `content/packages/<id>/` com três tipos de
arquivo:

```
content/packages/<id>/
  manifest.json     identidade do livro e lista ordenada de seções
  header.json        capa de texto: título, subtítulo, nota de leitura, legenda
  sections/*.json     uma seção por arquivo — cada uma é uma lista de BLOCOS
```

`content/catalog.json` lista todos os livros (id, título, descrição, tags, capa)
e aponta para o `manifest.json` de cada um. `content/progress.json` guarda o
progresso de leitura inicial (o navegador também guarda progresso local).

### `manifest.json`

```json
{
  "schema": "books.package.v2",
  "kind": "book-package",
  "id": "arquitetura-memoria-cpp",
  "title": "Arquitetura de Memória em C++",
  "description": "Do código-fonte ao binário ELF…",
  "language": "pt-BR",
  "tags": ["c++", "memória", "ELF"],
  "header": "header.json",
  "sections": ["sections/visao-geral.json", "sections/pipeline.json"]
}
```

### `header.json`

```json
{
  "schema": "books.header.v2",
  "kind": "book-header",
  "kicker": "referência técnica · c++ / sistemas operacionais",
  "title": "Arquitetura de Memória em C++",
  "subtitle": "Do código-fonte ao binário ELF…",
  "guideTitle": "Como usar este guia",
  "guideText": "Leia primeiro o mapa geral…",
  "cover": { "src": "cover.svg", "alt": "…", "ratio": "16:9" },
  "legend": [{ "label": ".text", "color": "blue" }],
  "footer": "Documento de referência técnica…"
}
```

`cover.src` é relativo à pasta do livro; `ratio` é `16:9`, `3:4`, `1:1` ou `9:16`.
`color` (na legenda, e em qualquer campo do tipo _accent_) é um dos nomes da
paleta (veja abaixo) ou um `#hex`.

### Uma seção (`sections/*.json`)

```json
{
  "schema": "books.section.v2",
  "kind": "book-section",
  "id": "visao-geral",
  "number": "1",
  "title": "Visão geral e arquitetura de memória em C++",
  "blocks": [
    /* … lista de blocos, ver abaixo … */
  ]
}
```

O `id` de uma seção (e de qualquer `subsection` dentro dela) vira uma âncora
(`#id`) e precisa ser único no livro inteiro — só letras minúsculas, números e
hífen.

## Marcação inline

Qualquer campo de texto (`line`, `text`, títulos, legendas…) aceita esta
marcação — nunca HTML:

| Marcação                   | Resultado                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------- | ------- | --------------- |
| `**negrito**`              | **negrito**                                                                                                                                                                                |
| `*itálico*`                | _itálico_                                                                                                                                                                                  |
| `~~riscado~~`              | ~~riscado~~                                                                                                                                                                                |
| `` `código` ``             | `código`                                                                                                                                                                                   |
| `[texto](https://…)`       | link externo                                                                                                                                                                               |
| `[texto](#id-da-secao)`    | link interno (rola até a âncora)                                                                                                                                                           |
| `[[Alt]]`                  | tecla, estilo `<kbd>`                                                                                                                                                                      |
| `$E=mc^2$`                 | matemática em LaTeX, via KaTeX (vendorizado em `assets/vendor/`) — fecha no próximo `$` que não vem depois de espaço nem antes de dígito, então "$5 e $10" nunca vira fórmula por acidente |
| `{ok                       | texto}` `{warn                                                                                                                                                                             | texto}` `{bad | texto}` `{dim | texto}` | tons semânticos |
| `{blue                     | texto}`(ou`teal`, `amber`, `violet`, `orange`, `pink`, `slate`, `gray`, `green`, `red`, `cyan`)                                                                                            | cor da paleta |
| `\*`, `` \` ``, `\{`, `\[` | caractere literal                                                                                                                                                                          |
| quebra de linha            | vira `<br>`                                                                                                                                                                                |

## Paleta de cores (`accent`)

`blue`, `teal`, `amber`, `gray`, `violet`, `orange`, `pink`, `slate`, `green`,
`red`, `cyan`, ou qualquer `#hex`. Usada em `subsection.accent`, `mermaid.accent`,
`ai-diagram.accent` e na `legend` do cabeçalho.

## Referência de blocos

Todo bloco tem um campo `type`. A lista abaixo é gerada automaticamente a partir
do código (`assets/js/blocks/*.js`) — nunca fica desatualizada.

### Texto

#### `heading` — Título

Subtítulo dentro de uma seção. `level` 3 é um título de tópico; `level` 4 é um título menor (ex.: dentro de subseções).

Campos:

- `level` (obrigatório) — select (3, 4)
- `text` (obrigatório) — line

Exemplo:

```json
{
  "type": "heading",
  "level": 3,
  "text": "Como funciona o alocador"
}
```

#### `paragraph` — Parágrafo

Texto corrido com marcação inline. Use `lead: true` para o parágrafo de abertura de uma seção (texto maior).

Campos:

- `text` (obrigatório) — text
- `lead` — bool

Exemplo:

```json
{
  "type": "paragraph",
  "text": "Um **ponteiro** guarda um endereço; veja `std::unique_ptr` para posse exclusiva."
}
```

#### `list` — Lista

Lista com marcadores (`bullet`), numerada (`number`) ou de verificação (`check`). Cada item é uma string com marcação inline, ou `{ "text": "...", "items": [...] }` para sublistas.

Campos:

- `style` — select (bullet, number, check)
- `items` (obrigatório) — items

Exemplo:

```json
{
  "type": "list",
  "style": "bullet",
  "items": [
    "Primeiro item",
    {
      "text": "Item com sublista",
      "items": ["Filho A", "Filho B"]
    }
  ]
}
```

#### `quote` — Citação

Citação com autoria opcional (`cite`).

Campos:

- `text` (obrigatório) — text
- `cite` — line

Exemplo:

```json
{
  "type": "quote",
  "text": "Programas devem ser escritos para pessoas lerem.",
  "cite": "Abelson & Sussman"
}
```

#### `callout` — Callout

Caixa de destaque. Variantes: `note` (nota), `info`, `key` (ponto-chave), `tip` (dica), `warning` (atenção), `danger` (perigo), `definition`, `example`. `title` é opcional (o rótulo da variante é usado se faltar). `text` aceita parágrafos separados por linha em branco; `blocks` permite conteúdo rico (ex.: código) abaixo do texto.

Campos:

- `variant` (obrigatório) — select (note, info, key, tip, warning, danger, definition, example)
- `title` — line
- `text` — text
- `blocks` — blocks

Exemplo:

```json
{
  "type": "callout",
  "variant": "warning",
  "title": "Cuidado com o dangling pointer",
  "text": "Depois do `delete`, o ponteiro continua guardando o endereço antigo."
}
```

#### `steps` — Passo a passo

Sequência numerada de passos, cada um com `title` e `text` (ambos com marcação inline).

Campos:

- `items` (obrigatório) — group-list

Exemplo:

```json
{
  "type": "steps",
  "items": [
    {
      "title": "Compile",
      "text": "Rode `g++ -O0 -g main.cpp`."
    },
    {
      "title": "Inspecione",
      "text": "Use `objdump -d a.out`."
    }
  ]
}
```

### Código

#### `code` — Código

Bloco de código com realce. `language`: cpp, c, asm, bash, python, js, json, rust, go, java, sql ou text. `title` (opcional) aparece na barra do bloco. `highlight` destaca linhas ("2,4-6"); `lineNumbers` mostra a numeração. O conteúdo é texto puro — nunca HTML.

Campos:

- `language` (obrigatório) — select (cpp, c, asm, bash, python, js, json, rust, go, java, sql, text)
- `title` — line
- `code` (obrigatório) — code
- `highlight` — lines
- `lineNumbers` — bool

Exemplo:

```json
{
  "type": "code",
  "language": "cpp",
  "title": "RAII em uma linha",
  "code": "auto p = std::make_unique<int>(42);",
  "highlight": "1"
}
```

### Diagramas e mídia

#### `mermaid` — Diagrama Mermaid

Diagrama descrito em sintaxe Mermaid (flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, mindmap, timeline, gitGraph…). Escreva SOMENTE o código do diagrama, sem cercas ```. Coloque rótulos entre aspas duplas quando tiverem acentos ou parênteses: A["Texto (com parênteses)"].

Campos:

- `code` (obrigatório) — code
- `caption` — line
- `accent` — accent

Exemplo:

```json
{
  "type": "mermaid",
  "caption": "ciclo de vida do objeto",
  "accent": "blue",
  "code": "flowchart LR\n  A[\"new\"] --> B[\"construtor\"] --> C[\"uso\"] --> D[\"destrutor\"] --> E[\"delete\"]"
}
```

#### `ai-diagram` — Diagrama com IA

Diagrama gerado por IA a partir de um prompt. Guarda o `prompt` (proveniência e reprodução) e o resultado em `source`, que pode ser Mermaid (`engine: "mermaid"`) ou SVG (`engine: "svg"`). No editor há botões para copiar um prompt pronto e colar a resposta da IA.

Campos:

- `engine` (obrigatório) — select (mermaid, svg)
- `prompt` — text
- `source` (obrigatório) — code
- `caption` — line
- `accent` — accent

Exemplo:

```json
{
  "type": "ai-diagram",
  "engine": "mermaid",
  "prompt": "Mostre como um std::shared_ptr compartilha o bloco de controle entre cópias.",
  "caption": "contagem de referências",
  "source": "flowchart LR\n  A[\"shared_ptr A\"] --> C[\"bloco de controle\"]\n  B[\"shared_ptr B\"] --> C\n  C --> O[\"objeto\"]"
}
```

#### `svg` — SVG

Ilustração vetorial inline (mapas de memória, layouts, esquemas). O SVG é sanitizado: scripts, estilos e links externos são removidos. Use viewBox; largura e altura são ignoradas (o desenho escala para a largura da página).

Campos:

- `svg` (obrigatório) — code
- `alt` — line
- `caption` — line

Exemplo:

```json
{
  "type": "svg",
  "alt": "Dois retângulos ligados por uma seta",
  "svg": "<svg viewBox=\"0 0 300 80\"><rect x=\"10\" y=\"20\" width=\"100\" height=\"40\" rx=\"6\" fill=\"#243b53\" stroke=\"#76a9fa\"/><rect x=\"190\" y=\"20\" width=\"100\" height=\"40\" rx=\"6\" fill=\"#163b38\" stroke=\"#2dd4bf\"/><path d=\"M110 40h80\" stroke=\"#9fb3c8\" stroke-width=\"2\"/></svg>"
}
```

#### `image` — Imagem

Imagem. `src` pode ser um caminho relativo à pasta do livro (ex.: "images/mapa.png"), uma URL https ou um Data URL. Ao salvar, o editor grava o arquivo dentro da pasta `images/` do próprio livro (separada da capa, que fica em `cover.*` na raiz do pacote) e reescreve `src` para esse caminho local — o leitor nunca depende de um arquivo fora do projeto. Exceção: imagens SVG não são extraídas como arquivo (ficam embutidas); use o bloco `svg` para vetores. Remover o bloco, trocar a imagem ou trocar/remover a capa apaga o arquivo antigo da pasta no próximo salvamento. `alt` é obrigatório para acessibilidade.

Campos:

- `src` (obrigatório) — image
- `alt` (obrigatório) — line
- `caption` — line

Exemplo:

```json
{
  "type": "image",
  "src": "images/mapa.png",
  "alt": "Mapa de memória de um processo",
  "caption": "Figura 1 — visão geral"
}
```

#### `iframe` — Iframe seguro

Conteúdo externo incorporado por HTTPS. O leitor aplica `sandbox`, `loading="lazy"`, `referrerPolicy="no-referrer"` e título acessível. O iframe continua remoto e, portanto, não transforma o livro em um pacote totalmente autocontido; use-o somente quando essa dependência estiver explícita.

Campos:

- `src` (obrigatório) — line; deve começar por `https://`
- `title` (obrigatório) — line; nome acessível do conteúdo
- `height` (obrigatório) — plain; altura limitada pelo leitor
- `allowFullscreen` — bool
- `caption` — line

Exemplo:

```json
{
  "type": "iframe",
  "src": "https://example.com/documentacao",
  "title": "Documentação externa",
  "height": 480,
  "allowFullscreen": false,
  "caption": "Documentação do projeto"
}
```

#### `video` — Vídeo MP4

Vídeo com controles nativos. Para um pacote offline, use `media/<arquivo>.mp4` e inclua o arquivo no ZIP; o editor também aceita um MP4 escolhido localmente e o grava em `media/`. Uma URL HTTPS é permitida, mas deixa de ser uma dependência offline.

Campos:

- `src` (obrigatório) — video; `media/*.mp4`, `videos/*.mp4`, `data:video/*` ou URL `https://`
- `title` (obrigatório) — line
- `controls` — bool
- `loop` — bool
- `muted` — bool
- `caption` — line

Exemplo:

```json
{
  "type": "video",
  "src": "media/demonstracao.mp4",
  "title": "Demonstração do experimento",
  "controls": true,
  "caption": "Vídeo 1 — execução observada"
}
```

#### `math` — Fórmula (LaTeX)

Equação matemática em destaque, escrita em LaTeX (a sintaxe do KaTeX — praticamente o LaTeX de matemática padrão: \frac, \sum, \int, letras gregas \alpha, expoentes x^2, índices x_i etc.). Para matemática dentro do meio de uma frase, use `$…$` diretamente no texto de qualquer bloco em vez deste bloco.

Campos:

- `tex` (obrigatório) — code
- `reading` (obrigatório) — text; leitura da expressão em português, exibida abaixo da fórmula
- `caption` — line

Exemplo:

```json
{
  "type": "math",
  "tex": "E = mc^2",
  "reading": "Lê-se: energia é igual à massa vezes a velocidade da luz ao quadrado.",
  "caption": "energia de repouso"
}
```

### Dados

#### `table` — Tabela

Tabela simples. `header` é a lista de títulos de coluna; `rows` é uma lista de linhas, cada uma com uma string (marcação inline) por coluna. Toda linha deve ter o mesmo número de colunas que `header`. Use `{ok|Sim}`, `{bad|Não}`, `{warn|Talvez}` para células coloridas e `\n` para quebra de linha dentro da célula.

Campos:

- `table` (obrigatório) — table
- `caption` — line

Exemplo:

```json
{
  "type": "table",
  "caption": "Regiões",
  "header": ["Região", "Guarda", "Cresce"],
  "rows": [
    ["`.text`", "código", "{dim|não}"],
    ["stack", "quadros de função", "para baixo"]
  ]
}
```

### Estrutura

#### `divider` — Divisor

Linha divisória entre trechos.

Campos:

- (sem campos)

Exemplo:

```json
{
  "type": "divider"
}
```

#### `subsection` — Subseção

Cartão de subseção com título numerado, etiqueta colorida (`tag`) e cor de destaque. Aparece no sumário lateral e precisa de um `id` único no livro (só letras minúsculas, números e hífens).

Campos:

- `id` (obrigatório) — plain
- `number` — plain
- `title` (obrigatório) — line
- `tag` — plain
- `accent` — accent
- `blocks` (obrigatório) — blocks

Exemplo:

```json
{
  "type": "subsection",
  "id": "sec-heap",
  "number": "3.6",
  "tag": "HEAP",
  "accent": "orange",
  "title": "Monte dinâmico (`heap`)",
  "blocks": [
    {
      "type": "paragraph",
      "text": "Região para alocação sob demanda."
    }
  ]
}
```

#### `details` — Bloco recolhível

Conteúdo recolhido por padrão (`open: true` para vir aberto). Bom para material de referência longo.

Campos:

- `summary` (obrigatório) — line
- `open` — bool
- `blocks` (obrigatório) — blocks

Exemplo:

```json
{
  "type": "details",
  "summary": "Ver o diagrama completo",
  "blocks": [
    {
      "type": "mermaid",
      "code": "flowchart TD\n  A --> B"
    }
  ]
}
```

#### `columns` — Colunas

De 2 a 3 colunas lado a lado (empilham no celular). Cada coluna tem sua própria lista de `blocks`.

Campos:

- `columns` (obrigatório) — columns

Exemplo:

```json
{
  "type": "columns",
  "columns": [
    {
      "blocks": [
        {
          "type": "paragraph",
          "text": "**Stack**: rápida, automática."
        }
      ]
    },
    {
      "blocks": [
        {
          "type": "paragraph",
          "text": "**Heap**: flexível, manual."
        }
      ]
    }
  ]
}
```

### História e contexto

#### `history` — História / biografia

Card curto para explicar a pessoa, tecnologia ou ideia por trás de um conteúdo. O texto é deliberadamente natural: `shortBio` traz uma ou duas frases de descrição e `insight` explica o porquê e/ou como, conforme o caso. Os direitos e a proveniência da imagem ficam no `image-rights.json` do pacote, não no formulário visível.

Campos:

- `name` (obrigatório) — line
- `shortBio` (obrigatório) — text
- `insight` (obrigatório) — text
- `image` (obrigatório) — objeto com `src` e `alt` obrigatórios

Exemplo:

```json
{
  "type": "history",
  "name": "Carl Friedrich Gauss",
  "shortBio": "Matemático e físico alemão que trabalhou em teoria dos números e eletromagnetismo.",
  "insight": "A simetria permite transformar o cálculo do campo em um fluxo pela superfície.",
  "image": {
    "src": "images/history-gauss.svg",
    "alt": "Ilustração tipográfica de Carl Friedrich Gauss"
  }
}
```

### Avançado

#### `html` — HTML (avançado)

Válvula de escape: HTML simples e sanitizado (sem scripts, estilos ou eventos). Prefira os blocos tipados; use `html` só para algo que nenhum outro bloco cobre.

Campos:

- `html` (obrigatório) — code

Exemplo:

```json
{
  "type": "html",
  "html": "<p>Texto com <mark>destaque</mark>.</p>"
}
```

## Adicionando um novo tipo de bloco

1. Crie `assets/js/blocks/<algo>.js` chamando `Books.blocks.register({...})` com
   `type`, `label`, `group`, `icon`, `doc`, `example`, `defaults()`, `fields[]`,
   `summary(block)` e `render(block, ctx)` (ver qualquer arquivo em
   `assets/js/blocks/` como modelo).
2. Inclua o `<script>` em `Livros.html`, depois de `blocks/registry.js`.
3. Pronto: o editor visual, a validação (`Books.validate`) e este documento (via
   `node -e` que gera a referência acima) passam a conhecer o bloco novo
   automaticamente — não é preciso editar mais nada.
