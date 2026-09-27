# Criando livros com IA

A aba **Importar / Exportar** do editor oferece dois botões para preparar conteúdo para uma IA: **copiar prompt para IA**, que copia o prompt completo em texto, e **copiar prompt em ZIP**, que tenta copiar um arquivo ZIP para a área de transferência. O prompt é gerado a partir do registro real de blocos em `assets/js/blocks/`, portanto a lista de tipos, campos e exemplos acompanha a implementação.

## Fluxo recomendado

1. Abra um livro ou crie um novo livro e entre no editor.
2. Abra a aba **Importar / Exportar**.
3. Clique em **copiar prompt para IA** ou **copiar prompt em ZIP**. O segundo formato depende do suporte do navegador à API de área de transferência de arquivos; quando ela não existe, o editor copia o prompt em texto e informa o fallback.
4. Cole o prompt em uma IA e acrescente, no final, o pedido de conteúdo: assunto, público, profundidade, quantidade de seções, linguagem, exemplos, exercícios e referências desejadas.
5. Peça à IA para gerar um ZIP real, autocontido e importável. O ZIP deve conter `content/catalog.json`, `content/packages/<id>/manifest.json`, `header.json`, `sections/*.json` e todos os arquivos de imagem e vídeo local referenciados. Um ZIP pode conter vários diretórios `packages/<id>/`; ao salvar, um ID igual substitui o pacote existente.
6. Volte ao editor, clique em **importar .zip**, selecione o arquivo e revise a validação. O editor transforma imagens do ZIP em referências locais seguras na memória.
7. Clique em **salvar** para gravar diretamente na pasta do projeto quando o navegador oferecer a File System Access API. Em navegadores sem essa API, o botão salvar baixa um ZIP completo como fallback.

## Contrato mínimo do ZIP

```text
content/
  catalog.json
  packages/<id>/
    manifest.json
    header.json
    cover.png ou cover.jpg ou cover.svg (preferencialmente horizontal, por exemplo 16:9)
    sections/01-fundamentos.json
    images/diagrama.png
    media/demonstracao.mp4
```

O manifest deve usar `books.package.v2`, apontar para `header.json` e listar as seções na ordem de leitura. Cada seção deve usar `books.section.v2`, possuir um `id` único e conter a lista `blocks`. Capas raster e imagens de blocos devem ser arquivos reais dentro do ZIP; SVG também pode ser embutido como dados ou usado no bloco `svg`. O bloco `video` local usa `media/*.mp4`; o bloco `iframe` é reservado para uma URL HTTPS com título acessível e deve declarar explicitamente a dependência externa. Caminhos absolutos, `..`, scripts, HTML executável e URLs externas em imagens ou vídeos locais não devem ser usados.

## Estrutura do prompt gerado

O prompt inclui o contrato de arquivos, o formato exato de `manifest`, `header` e seção, as regras de ID, a marcação inline, as cores e tons disponíveis, todos os tipos de bloco registrados, campos obrigatórios, opções e exemplos de JSON. Ele também inclui:

- um exemplo de livro mínimo, separado conceitualmente em manifest, header e seção;
- um exemplo rico com código, tabela, Mermaid e imagem;
- orientações de planejamento didático e progressão de capítulos;
- instruções para capas, imagens, SVG, diagramas e acessibilidade;
- instruções para iframes HTTPS seguros e vídeos MP4 locais sem misturá-los com capas ou imagens;
- exigência de explicações por mecanismo, hipóteses, exemplos trabalhados, limites e exercícios expansíveis com solução, evitando resumos telegráficos; as fontes completas ficam na seção final e o corpo usa apenas citações numeradas;
- exigência de profundidade não repetitiva: definição, mecanismo, exemplo, hipóteses, limites, erros comuns, aplicação e fonte em cada subseção relevante;
- blocos `history` somente quando contexto histórico/biográfico real agregar entendimento, com `shortBio`, `insight`, alt text e imagem existente, sem autoria inventada ou preenchimento repetitivo;
- dicas de exercícios que orientam sem revelar a solução, enquanto `solutionBlocks` documenta prova, verificação, caso-limite e complexidade;
- verificação final de imagens aninhadas em `history`, imagens comuns, capas, SVG, Mermaid, KaTeX, links internos, tabelas, exemplos de código e caminhos locais;
- um checklist para links, IDs, tabelas, campos obrigatórios e caminhos do ZIP;
- uma regra explícita para criar o ZIP, em vez de responder somente com Markdown.

## Critérios editoriais e científicos obrigatórios

Antes de gerar o conteúdo, faça uma auditoria de escopo: liste objetivos de aprendizagem, pré-requisitos, conceitos prometidos pelo título, aplicações, riscos e limites. Não crie um segundo livro para resolver uma lacuna local. Só proponha uma obra auxiliar quando o conteúdo for um pré-requisito independente e amplo, impossível de corrigir com uma expansão, reorganização, exercício ou referência no livro atual.

Para assuntos técnicos, compare cada seção com pelo menos uma fonte acadêmica de síntese — livro-texto, manual institucional ou revisão — e, quando houver afirmação recente, controversa, quantitativa ou de segurança, com uma fonte primária ou oficial. Monte uma matriz interna `afirmação → fonte → seção/bloco → hipótese/limite`. Não invente DOI, autor, licença, versão, dado, número, resultado experimental ou consenso. Se a pesquisa não sustentar uma frase, qualifique-a ou remova-a.

Cada seção deve ser revisada separadamente, não apenas como um conjunto de capítulos. Para cada seção, verifique: correspondência entre título e conteúdo; sequência pedagógica; definição; mecanismo causal ou algoritmo; exemplo trabalhado; unidades e convenções; hipóteses; caso-limite; erros comuns; aplicação; exercício graduado; síntese; e referências. Diferencie claramente observação, interpretação, hipótese, simulação e opinião. Números devem trazer condições, ordem de grandeza, incerteza ou fonte; não use constantes universais quando o valor depende de organismo, temperatura, protocolo ou equipamento.

Corrija padrões recorrentes de erro: não confunda equilíbrio com estado estacionário; energia livre com energia armazenada em uma ligação; magnificação com resolução; presença de gene com expressão ou fluxo; sequência com função ou causalidade; teste diagnóstico com valor preditivo; modelo computacional com mecanismo biológico; correlação com causa; e analogia didática com identidade física. Declare convenções de sinal, unidades, atividades versus concentrações, condições de contorno, tamanho de amostra, controles e limitações do modelo.

Quando o livro mencionar biocomputação, separe explicitamente computação **sobre** dados biológicos, computação **em** sistemas biológicos e modelos computacionais **inspirados por** biologia. Para bioimagem, inclua calibração, correção, segmentação, medidas, incerteza e validação. Para sequências, registre formato, controle de qualidade, banco, versão, alinhamento/classificação, viés de amostragem e reprodutibilidade. Para simulações, declare estado, entrada, regra de atualização, parâmetros, sementes, métrica, baseline e o que o modelo não representa. Não trate um resultado in silico como observação experimental.

Para biologia experimental, microbiologia, vírus, edição genética, amostras clínicas, neurociência, organoides ou dados humanos, inclua biossegurança, biosecurity, ética, consentimento, privacidade e uso dual quando pertinentes. Não ensine cultura, recuperação, aumento de virulência, seleção de patógenos ou procedimentos perigosos como se fossem exercícios comuns. BSL não é um rótulo universal do agente: a contenção depende do agente, procedimento, instalação, pessoal e avaliação protocol-driven do risco residual.

Use contexto histórico somente quando ele explicar uma ideia, método ou controvérsia. Não invente biografias, cronologias, retratos, autoria ou licenças. Para toda imagem, SVG, vídeo, código ou conjunto de dados, registre autoria, URL, licença, versão, adaptação e alt text; se a proveniência não puder ser verificada, use uma figura própria, um SVG simples ou remova o asset.

Faça uma revisão manual final do conteúdo adicionado e modificado. Procure IDs duplicados, numeração fora de ordem, exercícios sem solução, dicas que entregam a resposta, fórmulas com escapes inválidos, diagramas que não correspondem ao texto, URLs espalhadas no corpo, referências que não sustentam a afirmação, blocos de síntese antes do último exercício e mídia consecutiva sem contexto. O pacote deve passar validação estrutural e renderização antes de ser entregue.

## Se a IA não conseguir anexar ZIP

Algumas interfaces não permitem que o modelo crie um anexo binário. Nesse caso, peça que a IA devolva a lista completa de arquivos com o conteúdo exato de cada JSON e os assets separados, depois compacte a estrutura manualmente mantendo os caminhos indicados. Não cole um JSON de livro com imagens raster em base64 se for possível fornecer os arquivos separados, pois isso dificulta a edição e pode exceder limites de tamanho.

## Gerando somente uma seção

Para uma seção adicional, peça um objeto único no formato abaixo e use **Colar uma seção (JSON)**:

```json
{
  "schema": "books.section.v2",
  "kind": "book-section",
  "id": "nova-secao",
  "number": "4",
  "title": "Título da seção",
  "blocks": [
    {
      "type": "paragraph",
      "text": "Conteúdo com **marcação inline**."
    }
  ]
}
```

Se o ID já existir, a seção é substituída; caso contrário, é adicionada ao final. Para uma revisão completa, exporte o JSON atual, cole-o junto do pedido da IA e solicite um novo ZIP completo, preservando IDs e assets que não devem mudar.
