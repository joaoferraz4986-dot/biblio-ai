# Criando livros com IA

A aba **Importar / Exportar** do editor oferece dois botões para preparar conteúdo para uma IA: **copiar prompt para IA**, que copia o prompt completo em texto, e **copiar prompt em ZIP**, que tenta copiar um arquivo ZIP para a área de transferência. O prompt é gerado a partir do registro real de blocos em `assets/js/blocks/`, portanto a lista de tipos, campos e exemplos acompanha a implementação.

## Fluxo recomendado

1. Abra um livro ou crie um novo livro e entre no editor.
2. Abra a aba **Importar / Exportar**.
3. Clique em **copiar prompt para IA** ou **copiar prompt em ZIP**. O segundo formato depende do suporte do navegador à API de área de transferência de arquivos; quando ela não existe, o editor copia o prompt em texto e informa o fallback.
4. Cole o prompt em uma IA e acrescente, no final, o pedido de conteúdo: assunto, público, profundidade, quantidade de seções, linguagem, exemplos, exercícios e referências desejadas.
5. Peça à IA para gerar um ZIP real, autocontido e importável. O ZIP deve conter `content/catalog.json`, `content/packages/<id>/manifest.json`, `header.json`, `sections/*.json` e todos os arquivos de imagem referenciados.
6. Volte ao editor, clique em **importar .zip**, selecione o arquivo e revise a validação. O editor transforma imagens do ZIP em referências locais seguras na memória.
7. Clique em **salvar** para gravar diretamente na pasta do projeto quando o navegador oferecer a File System Access API. Em navegadores sem essa API, o botão salvar baixa um ZIP completo como fallback.

## Contrato mínimo do ZIP

```text
content/
  catalog.json
  packages/<id>/
    manifest.json
    header.json
    cover.png ou cover.jpg ou cover.svg
    sections/01-fundamentos.json
    images/diagrama.png
```

O manifest deve usar `books.package.v2`, apontar para `header.json` e listar as seções na ordem de leitura. Cada seção deve usar `books.section.v2`, possuir um `id` único e conter a lista `blocks`. Capas raster e imagens de blocos devem ser arquivos reais dentro do ZIP; SVG também pode ser embutido como dados ou usado no bloco `svg`. Caminhos absolutos, `..`, scripts, HTML executável e URLs externas não devem ser usados.

## Estrutura do prompt gerado

O prompt inclui o contrato de arquivos, o formato exato de `manifest`, `header` e seção, as regras de ID, a marcação inline, as cores e tons disponíveis, todos os tipos de bloco registrados, campos obrigatórios, opções e exemplos de JSON. Ele também inclui:

- um exemplo de livro mínimo, separado conceitualmente em manifest, header e seção;
- um exemplo rico com código, tabela, Mermaid e imagem;
- orientações de planejamento didático e progressão de capítulos;
- instruções para capas, imagens, SVG, diagramas e acessibilidade;
- um checklist para links, IDs, tabelas, campos obrigatórios e caminhos do ZIP;
- uma regra explícita para criar o ZIP, em vez de responder somente com Markdown.

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
