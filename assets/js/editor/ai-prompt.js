(function () {
  "use strict";

  function blockDocs() {
    return Books.blocks
      .list()
      .map(function (def) {
        var fields = def.fields
          .map(function (f) {
            return (
              "- `" +
              f.key +
              "`" +
              (f.required ? " (obrigatório)" : " (opcional)") +
              ": tipo `" +
              f.kind +
              "`" +
              (f.options
                ? "; opções: " +
                  f.options
                    .map(function (o) {
                      return "`" + o[0] + "` = " + o[1];
                    })
                    .join(", ")
                : "")
            );
          })
          .join("\n");
        return [
          "### `" + def.type + "` — " + def.label + " (" + def.group + ")",
          def.doc,
          "Campos:",
          fields,
          "Exemplo mínimo:",
          "```json",
          JSON.stringify(def.example, null, 2),
          "```",
        ].join("\n");
      })
      .join("\n\n");
  }

  function zipContract() {
    return [
      "## CONTRATO DO ARQUIVO ZIP (obrigatório)",
      "Entregue um arquivo ZIP real e baixável, chamado `<id-do-livro>.zip`. Não entregue somente um bloco de texto se sua interface permitir criar anexos/arquivos.",
      "A raiz do ZIP deve conter exatamente esta estrutura lógica:",
      "```text",
      "content/",
      "  catalog.json",
      "  packages/<id>/manifest.json",
      "  packages/<id>/header.json",
      "  packages/<id>/cover.png ou cover.jpg ou cover.svg (opcional)",
      "  packages/<id>/sections/<id-da-secao>.json",
      "  packages/<id>/images/<nome-do-arquivo> (opcional)",
      "```",
      "`catalog.json` deve apontar para `packages/<id>/manifest.json`; o manifest deve apontar para `header.json` e para todas as seções em ordem.",
      "Capa raster deve ser um arquivo PNG/JPEG real e `header.cover.src` deve ser o nome relativo (`cover.png` ou `cover.jpg`). SVG pode ser embutido como `data:image/svg+xml,...` ou fornecido como `cover.svg`.",
      "Cada bloco `image` deve apontar para `images/<arquivo>` e o arquivo deve existir dentro do ZIP. Cada bloco `video` local deve apontar para `media/<arquivo>.mp4`, que deve existir dentro do ZIP; URLs HTTPS de vídeo são permitidas apenas quando o livro assumir dependência externa. Um bloco `iframe` deve usar somente uma URL HTTPS e sempre informar `title`; ele é remoto por natureza e não é copiado para o ZIP. Não use caminhos absolutos, base64 gigante em JSON ou caminhos com `..`.",
      "Inclua `content/progress.json` apenas se houver progresso; ele deve seguir `books.progress.v2`. O importador aceita o pacote mesmo sem esse arquivo.",
      "Se não puder criar um ZIP binário, responda com a lista completa dos arquivos e o conteúdo exato de cada arquivo, mas sinalize claramente que o usuário precisará compactá-los antes de importar.",
    ].join("\n");
  }

  function examples() {
    return [
      "## EXEMPLO 1 — livro mínimo importável",
      "```json",
      JSON.stringify(
        {
          manifest: {
            schema: "books.package.v2",
            kind: "book-package",
            id: "introducao-a-grafos",
            title: "Introdução a Grafos",
            description: "Conceitos essenciais.",
            language: "pt-BR",
            tags: ["grafos", "algoritmos"],
            header: "header.json",
            sections: ["sections/01-fundamentos.json"],
          },
          header: {
            schema: "books.header.v2",
            kind: "book-header",
            kicker: "matemática discreta",
            title: "Introdução a Grafos",
            subtitle: "Vértices, arestas e caminhos.",
            guideTitle: "Como estudar",
            guideText: "Leia a definição e valide cada exemplo.",
            cover: {
              src: "cover.svg",
              alt: "Grafo simples com quatro vértices",
              ratio: "16:9",
            },
            legend: [{ label: "conceito", color: "blue" }],
            footer: "Material de estudo.",
          },
          sections: [
            {
              schema: "books.section.v2",
              kind: "book-section",
              id: "fundamentos",
              number: "1",
              title: "Fundamentos",
              blocks: [
                {
                  type: "paragraph",
                  text: "Um **grafo** é uma estrutura formada por vértices e arestas.",
                },
                {
                  type: "callout",
                  variant: "definition",
                  title: "Definição",
                  text: "Use `{blue|vértice}` para destacar um termo.",
                },
                {
                  type: "list",
                  style: "bullet",
                  items: [
                    "Vértices representam entidades.",
                    "Arestas representam relações.",
                  ],
                },
              ],
            },
          ],
        },
        null,
        2,
      ),
      "```",
      "No ZIP real, o objeto acima é separado em `manifest.json`, `header.json` e `sections/01-fundamentos.json`; os arquivos de imagem também precisam ser incluídos.",
      "",
      "## EXEMPLO 2 — seção rica com código, tabela, Mermaid e imagem",
      "```json",
      JSON.stringify(
        {
          schema: "books.section.v2",
          kind: "book-section",
          id: "pipeline",
          number: "2",
          title: "Pipeline de compilação",
          blocks: [
            { type: "heading", level: 3, text: "Do fonte ao executável" },
            {
              type: "code",
              language: "bash",
              title: "Compilar",
              code: "g++ -std=c++20 -O2 main.cpp -o app",
              lineNumbers: true,
            },
            {
              type: "mermaid",
              caption: "fluxo de build",
              accent: "teal",
              code: 'flowchart LR\n  A["fonte"] --> B["compilador"] --> C["executável"]',
            },
            {
              type: "table",
              caption: "Artefatos",
              header: ["Etapa", "Saída"],
              rows: [
                ["compilação", "`objeto`"],
                ["linkagem", "{ok|executável}"],
              ],
            },
            {
              type: "image",
              src: "images/pipeline.png",
              alt: "Diagrama do pipeline de compilação",
              caption: "Figura 1 — visão geral",
            },
          ],
        },
        null,
        2,
      ),
      "```",
    ].join("\n");
  }

  function build(pkg) {
    var accents = Books.schema.ACCENTS.map(function (a) {
      return a.id;
    }).join(", ");
    var tones = Books.schema.TONES.join(", ");
    return [
      "# Tarefa: criar um livro técnico importável no Books",
      "",
      "Você é uma autora técnica cuidadosa. Crie um livro completo e didático sobre o assunto que será colocado no final deste prompt.",
      "Seu resultado deve ser um ZIP real no contrato descrito abaixo. O usuário vai importar o ZIP diretamente na aba **Importar / Exportar** do editor.",
      "Responda sem texto narrativo extra: entregue o arquivo ZIP e, se sua interface mostrar uma mensagem textual, use somente um resumo curto dos arquivos gerados.",
      "",
      zipContract(),
      "",
      "## FORMATO JSON EXATO",
      'Pacote em memória: `{ "manifest": {...}, "header": {...}, "sections": [...] }`.',
      'Manifest: `schema: "books.package.v2"`, `kind: "book-package"`, `id` em minúsculas com números e hífens, `title`, `description`, `language`, `tags`, `header: "header.json"`, `sections: ["sections/arquivo.json", ...]`.',
      'Header: `schema: "books.header.v2"`, `kind: "book-header"`, `kicker`, `title`, `subtitle`, `guideTitle`, `guideText`, `cover`, `legend`, `footer`.',
      'Seção: `schema: "books.section.v2"`, `kind: "book-section"`, `id` único, `number`, `title`, `blocks` como lista.',
      "IDs de livro, seção e subseção usam somente letras minúsculas, números e hífens. Links internos usam `[texto](#id)`. Cada seção deve ter pelo menos um bloco.",
      "",
      "## MARCAÇÃO INLINE",
      "Em campos de texto use somente a marcação do projeto, nunca HTML: `**negrito**`, `*itálico*`, `~~riscado~~`, `` `código` ``, `[texto](https://exemplo.com)`, `[texto](#secao)`, `[[Ctrl+C]]`, `$E=mc^2$`, `{ok|texto}`, `{warn|texto}`, `{bad|texto}`, `{dim|texto}`.",
      "Cores disponíveis: {" +
        accents
          .split(", ")
          .map(function (a) {
            return a + "|texto";
          })
          .join("}, {") +
        "}. Tons semânticos: " +
        tones +
        ".",
      "Quebras de linha são permitidas; não insira HTML cru, scripts ou estilos. Para conteúdo incorporado, use somente os blocos tipados `iframe` e `video`, respeitando as regras de segurança e acessibilidade acima.",
      "",
      "## TIPOS DE BLOCO DISPONÍVEIS",
      blockDocs(),
      "",
      examples(),
      "",
      "## TUTORIAL DE AUTORIA",
      "1. Antes de escrever, decomponha o assunto em objetivos de aprendizagem observáveis, pré-requisitos, conceitos centrais, aplicações e limites. Planeje de 6 a 12 seções com progressão: motivação, fundamentos, exemplos guiados, aprofundamento, aplicações, erros comuns, síntese e referências.",
      "2. Comece cada seção com orientação e mapa conceitual. Organize os conceitos em 3 a 8 `subsection`s quando o capítulo comportar essa granularidade. Cada subseção deve conter definição, mecanismo, exemplo trabalhado, hipótese/limite, conexão com a fonte e uma pergunta de verificação; exercícios cumulativos não substituem exercícios locais.",
      "3. Para código, declare a linguagem correta e mantenha o campo `code` como texto puro. Para Mermaid, comece por `flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram-v2`, `erDiagram` ou outro tipo válido e coloque rótulos com acentos entre aspas.",
      "3a. Para cada bloco `math`, preencha `tex` com LaTeX válido e `reading` com uma frase em português que leia a expressão símbolo por símbolo e explique o significado das variáveis. A leitura aparece abaixo da fórmula e não pode ser omitida.",
      "4. Para imagens, inclua o arquivo físico no ZIP e escreva `alt` descritivo. Para SVG, prefira o bloco `svg` ou uma capa SVG; não use scripts, CSS externo ou referências remotas. Para vídeos, use MP4 e forneça título e legenda; para iframes, use HTTPS, título acessível e somente fontes confiáveis.",
      "5. Revise consistência: IDs únicos, links internos existentes, tabelas com o mesmo número de células, campos obrigatórios preenchidos e JSON válido.",
      "6. Gere `catalog.json` e confira se o caminho do manifest coincide exatamente com o caminho dentro do ZIP. O usuário deve conseguir importar e depois salvar sem editar caminhos manualmente.",
      "7. Escreva uma síntese robusta, não um resumo superficial: para cada subseção explique definição, mecanismo causal ou algoritmo, exemplo trabalhado com resultado, hipóteses, limites, erros comuns, aplicação, alternativa e relação com a fonte consultada. Evite parágrafos genéricos repetidos; compare abordagens quando houver mais de uma.",
      "8. Inclua ao menos um bloco `history` por seção que realmente tenha contexto histórico, biográfico ou de origem; use `name`, `shortBio`, `insight` e `image` com `src` apontando para um arquivo existente. Para livros sem figuras históricas, use uma ideia, experimento ou marco técnico, sem inventar autoria.",
      "9. Para cada exercício, mantenha `prompt`, `hint` e `solutionBlocks` coerentes. A dica deve orientar sem entregar a resposta; a solução deve conter raciocínio, verificação, caso-limite e complexidade quando aplicável. Não use placeholders como 'solução aqui'.",
      "10. Antes de finalizar, valide cada JSON, ID, link interno, fórmula KaTeX (incluindo chaves, delimitadores e macros), diagrama Mermaid, SVG sanitizável, imagem local, legenda, alt text, tabela, exercício e exemplo de código. Se uma imagem não puder ser obtida ou licenciada, não invente um caminho: use um SVG próprio ou remova a referência.",
      "11. Para projetos práticos, inclua arquitetura, estrutura de diretórios, comandos de build, testes automatizados, dados de entrada/saída, métricas, reprodutibilidade, análise de complexidade e modos de falha. Para C/C++, prefira exemplos compiláveis com padrão explícito e tratamento de erros.",
      "12. Declare as fontes por seção e diferencie fato documentado, hipótese didática, simulação e opinião. Dê preferência a documentação oficial, livros acadêmicos e artigos revisados; inclua URL, autor/instituição, ano e qual afirmação cada fonte sustenta. Não atribua resultados sem fonte verificável.",
      "",
      "## REGRAS FINAIS DE SAÍDA",
      "- Crie o ZIP, não um JSON solto, quando a plataforma permitir anexos.",
      "- O ZIP deve ser autocontido e importável offline.",
      "- Não inclua `node_modules`, HTML, JavaScript executável, scripts ou arquivos desnecessários.",
      "- Não coloque cercas Markdown em vez do arquivo ZIP.",
      "- Se o usuário pediu um assunto específico, use o pedido abaixo como fonte de verdade e não invente outro tema.",
      "",
      'CONTEXTO DO LIVRO ATUAL: título "' +
        Books.inline.toPlain(pkg.header.title || pkg.manifest.title) +
        '", descrição: ' +
        (pkg.manifest.description || "(sem descrição ainda)") +
        ".",
      "",
      "PEDIDO DO USUÁRIO: ",
    ].join("\n");
  }

  Books.aiPrompt = { build: build, blockDocs: blockDocs };
})();
