# Revisão cética do segundo relatório e correções aplicadas

## Resultado da revisão

O segundo relatório estava correto ao apontar as lacunas editoriais: `thread_local` não havia sido aplicado; Ørsted estava ausente; Hertz estava apenas citado no card de Maxwell; Ohm não trazia o contexto de recepção fria; Nyquist–Shannon e Ziegler–Nichols não tinham contexto histórico; e Gauss estava distante da seção da lei de Gauss. Esses pontos foram confirmados por busca no conteúdo JSON e corrigidos.

A auditoria também encontrou um problema adicional: os cards `history` referenciavam arquivos locais, mas a entrega anterior ainda usava ilustrações tipográficas genéricas e não distinguia adequadamente proveniência e licença. Os cards agora usam retratos/imagens baixados da internet, com `alt` em português e registro por arquivo em `image-rights.json`. As imagens com licença não confirmada estão marcadas como tais; não são declaradas como domínio público.

## Alterações editoriais

A seção de eletromagnetismo passou a incluir a sequência Ørsted–Faraday–Maxwell–Hertz e cards próprios para Ørsted e Hertz. O card de Hertz explica a produção, medição, reflexão e refração das ondas como confirmação experimental da previsão de Maxwell. O card de Ohm agora registra a recepção inicialmente fria, a saída de Colônia e o reconhecimento posterior. A seção de controle ganhou uma subseção sobre reconstrução e aliasing em Nyquist–Shannon, cards separados para Harry Nyquist e Claude Shannon, além de contexto para a sintonia de Ziegler–Nichols. James Watt ganhou um card contextual sobre a origem histórica dos problemas de regulação por realimentação. Gauss agora aparece junto à lei de Gauss e continua presente na trilha matemática para preservar a ligação com simetria e cálculo.

O livro de arquitetura de memória agora define as quatro durações de armazenamento do C++ — estática, `thread_local`, automática e dinâmica — com exemplo executável. O conversor ADC passou a rejeitar resolução zero, resolução acima de 31 bits e códigos fora da faixa representável.

## Temas

A seleção não inverte mais artificialmente uma paleta ao trocar o modo. GitHub Dark e GitHub Light estão acoplados; Solarized Dark e Solarized Light estão acoplados; e Catppuccin Mocha e Catppuccin Latte estão acoplados. O modo só é oferecido quando há uma variante correspondente. Temas sem par claro/escuro mantêm seu esquema fixo. A intensidade continua persistida, mas não muda a identidade ou o modo cromático oficial da paleta.

A decisão é compatível com o Primer do GitHub, que trata `light` e `dark` como modos de cor distintos, com o repositório oficial de temas GitHub, que lista variantes Light e Dark, com o projeto Solarized, que define os dois modos como uma paleta dual, e com Catppuccin, que distingue Latte dos demais flavors escuros.

## Salvamento e limpeza

O salvamento em pasta agora localiza capas e imagens Data URL ou HTTP, grava o novo arquivo, atualiza JSONs e remove capas/imagens órfãs. A mesma política foi estendida a fontes e fundos personalizados em `content/fonts` e `content/backgrounds`. A remoção usa `FileSystemDirectoryHandle.removeEntry()` e a enumeração de diretórios; portanto, trocar uma capa não deixa a extensão antiga acumulada. O bundle embutido também é regenerado para que a cópia aberta por `file://` reflita o conteúdo salvo.

## Fontes principais

As fontes técnicas e históricas consultadas estão registradas em [`/home/ubuntu/work_files/research-sources.md`](file:///home/ubuntu/work_files/research-sources.md) durante a auditoria. As principais são o [Primer Color Usage](https://primer.style/product/getting-started/foundations/color-usage/), o [repositório oficial GitHub VS Code Theme](https://github.com/primer/github-vscode-theme), [Solarized](https://ethanschoonover.com/solarized/), [Catppuccin](https://catppuccin.com/), a [American Physical Society sobre Ørsted](https://www.aps.org/apsnews/2008/07/1820-oersted-electromagnetism), a [Britannica sobre Hertz](https://www.britannica.com/biography/Heinrich-Hertz), a [Britannica sobre Ohm](https://www.britannica.com/biography/Georg-Ohm), a exposição da [UC Berkeley sobre Nyquist–Shannon](https://ptolemy.eecs.berkeley.edu/eecs20/week13/nyquistShannon.html) e a documentação [MDN FileSystemDirectoryHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle).

## Verificações finais

`node tools/validate.js` passou com 0 erros e 0 avisos nos quatro livros. Os arquivos JavaScript alterados passaram em `node --check`. O bundle foi regenerado com quatro livros e nove seções de Física Elétrica. As referências de imagem dos 18 cards históricos foram verificadas contra arquivos existentes; o smoke test HTTP retornou 200 para `Livros.html`, `embedded-bundle.js` e um retrato de Ørsted.
