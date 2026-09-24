# Famílias de temas e variantes

A interface apresenta uma família como uma opção única; a variante é escolhida no painel dessa família. Isso evita tratar modos cromáticos como temas independentes. A família **GitHub** oferece **Dark**, **Dimmed** e **Light**; **Solarized** oferece **Dark** e **Light**; **Catppuccin** oferece os flavors oficiais **Latte**, **Frappé**, **Macchiato** e **Mocha**. Os demais temas continuam como opções próprias enquanto não houver uma variante correspondente implementada e validada.

A intensidade controla apenas as superfícies (`background`, painéis e elevações) de variantes escuras. Em **50%**, a cor oficial é preservada; valores menores suavizam as superfícies e valores maiores aprofundam os tons. Ela não mistura o destaque nem altera cores de texto, para manter contraste e identidade da paleta. Variantes claras não recebem esse ajuste.

## Compatibilidade de preferências

As preferências anteriores continuam reconhecidas. O modo escuro/claro persistido seleciona a variante correspondente em GitHub e Solarized; as configurações Catppuccin antigas continuam apontando para o flavor escolhido. **GitHub Dimmed** mantém seu identificador existente e agora aparece dentro da família GitHub. Temas personalizados continuam individuais e removíveis.

## Referências de paleta

Os valores Catppuccin usados são os campos `base`, `mantle`, `surface0`, `surface1`, `text` e `mauve` do arquivo oficial [catppuccin/palette](https://github.com/catppuccin/palette/blob/main/palette.json). As cores GitHub seguem os tokens oficiais do [GitHub Primer](https://primer.style/product/getting-started/foundations/color-usage/) e do [GitHub VS Code Theme](https://github.com/primer/github-vscode-theme). Solarized mantém as paletas dual-mode publicadas pelo [projeto Solarized](https://ethanschoonover.com/solarized/).

O catálogo e a interface estão em `assets/js/core/personalization.js` e `assets/js/ui/settings-panel.js`; os tokens visuais ficam em `assets/css/themes.css` e `assets/css/components/settings.css`.

## Validação manual

Na aba **Tema**, confirme que existe um único cartão para GitHub, Solarized e Catppuccin. Abra cada cartão: GitHub oferece Dark/Dimmed/Light; Solarized oferece Dark/Light; Catppuccin oferece Latte/Frappé/Macchiato/Mocha. Aplicar Light ou Latte desabilita intensidade; aplicar uma variante escura permite testar 0%, 50% e 100%. 50% deve reproduzir a paleta-base. O fluxo de troca não deve alterar a interface da biblioteca, leitor ou editor.

As correções editoriais já registradas em [`REVISAO-SEGUNDO-AGENTE-E-CORRECOES.md`](REVISAO-SEGUNDO-AGENTE-E-CORRECOES.md) permanecem verificadas e cobrem os livros de arquitetura e Física Elétrica.

## Publicação

`tools/publish-initial.sh` prepara a primeira publicação de um clone local. O script define a identidade local fornecida pelo proprietário, verifica a branch e arquivos ignorados, cria o commit inicial quando necessário e publica no remoto `origin`. Ele não configura credenciais nem as inclui no repositório; autenticação deve ser concluída pelo conector GitHub ou pelo Git configurado no computador do proprietário.

O primeiro envio publica o conteúdo integral da pasta versionada. Confirme que não há arquivos pessoais, segredos ou conteúdo que não queira tornar público antes de executá-lo, pois a visibilidade final depende da configuração do repositório remoto.

## Comandos de validação

```bash
npm run check
npm run build:bundle
node tools/test-themes.js
```

O teste de temas verifica a estrutura e os IDs das famílias/variantes e a transformação de intensidade nas superfícies escuras; a inspeção visual deve ser feita nos controles listados acima.

## Validação funcional

A rodada visual do painel é reportada em `docs/VALIDACAO-MIGRACAO.md`. Browser smoke tests cobrem famílias, seletor de variante, aplicação imediata, leitura dos quatro livros e editor; o navegador deve fechar sem erros de console.

## Fontes

Além das páginas oficiais citadas acima, a auditoria das correções editoriais dos livros está em [`REVISAO-SEGUNDO-AGENTE-E-CORRECOES.md`](REVISAO-SEGUNDO-AGENTE-E-CORRECOES.md).

## Licenças

Este projeto seleciona cores documentadas, não copia a identidade visual ou logotipos dessas comunidades. Imagens e conteúdos editoriais do catálogo mantêm seus registros de origem em `content/image-rights.json` ou no arquivo de direitos correspondente ao pacote.

## Observações de implementação

As famílias e suas variantes são declaradas como dados em `THEME_FAMILIES` e `THEME_VARIANTS`, evitando duplicar seleção em componentes visuais. A intensidade é aplicada após resolver o tema concreto e não reescreve os dados-fonte da paleta.
