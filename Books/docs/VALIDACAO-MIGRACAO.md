# Validação da migração desktop

## Escopo preservado

O frontend continua sendo a mesma página HTML, com os mesmos módulos JavaScript, estilos, catálogo, conteúdo e fluxos visuais. O empacotamento Tauri copia `Livros.html` para `index.html` e monta `.frontend/` com o HTML, CSS, JavaScript e conteúdo já existentes. A ponte `Books.native` troca somente as fronteiras de filesystem e os diálogos de arquivo quando o runtime desktop está presente; no navegador, a ponte permanece inerte.

## Verificações funcionais e visuais

A página foi aberta tanto como `Livros.html` quanto pelo novo `index.html`. Na biblioteca, os quatro livros e suas capas continuaram visíveis. O primeiro livro abriu com título, sumário e conteúdo; o teste visual chegou à seção inicial e mostrou diagramas, blocos de texto e navegação do leitor. A interface do editor, as configurações e os controles do dock foram percorridos na inspeção de navegador. A organização visual por família foi ajustada sem alterar as telas de biblioteca, leitor ou editor.

## Atualização do seletor de temas

A aba Tema mostra um cartão por família GitHub, Solarized e Catppuccin; os modos/flavors ficam num seletor dentro de cada família. GitHub mantém Dark, Dimmed e Light; Solarized mantém Dark e Light; Catppuccin oferece Latte, Frappé, Macchiato e Mocha. Os demais temas permanecem como cartões únicos. A intensidade modifica apenas as superfícies das variantes escuras: 50% preserva os valores-base, 0% suaviza e 100% aprofunda os fundos e painéis. Variantes claras desabilitam o controle. A inspeção no navegador confirmou uma opção única por família, seleção das variantes GitHub e Catppuccin, desativação do slider na variante clara e as saídas de cor em 0/50/100.

O salvamento desktop usa a seleção nativa da pasta na primeira vez e guarda a raiz autorizada na configuração do aplicativo. As leituras, gravações e remoções recebem apenas caminhos relativos à raiz autorizada; traversal, caminhos absolutos, links simbólicos e entradas excessivamente profundas são rejeitados. A raiz é persistida e reautorizada no asset protocol na próxima execução, sem expor todo o diretório pessoal ao WebView.

## Testes executados

| Verificação | Resultado |
| --- | --- |
| `npm run check` | Aprovado: sintaxe de todos os scripts e 4 livros, 0 erros e 0 avisos. |
| `node tools/test-themes.js` | Aprovado: estrutura de famílias, variantes, persistência legada e intensidade nos tons escuros. |
| `npm run build:bundle` | Aprovado: bundle embutido gerado para 4 livros; `index.html` e `.frontend/` criados. |
| `cargo fmt --all -- --check` | Aprovado. |
| `cargo test --lib` | Aprovado: 3 testes, incluindo aceitação de caminho relativo, rejeição de traversal e de symlink. |
| JSONs dos manifests e lockfiles | Aprovados com `jq empty`. |
| `nix flake check` | Não executado: Nix não está instalado neste sandbox. |
| `cargo check --locked` / build desktop completo | Não concluído: o Tauri começou a compilar os crates GTK/WebKit e permaneceu mais de 20 minutos em uma compilação Rust de alto consumo de CPU. O processo foi encerrado; não se afirma que o build integral ou o runtime gráfico tenham sido validados aqui. |

## Execução no NixOS

Com Nix flakes habilitados, use `nix develop --no-update-lock-file`, depois `npm install`, `npm run check`, `cargo test --manifest-path src-tauri/Cargo.toml` e `npm run tauri:dev`. Para o pacote, execute `npm run tauri:build`. O arquivo `flake.lock` fixa o mesmo pin `nixpkgs` `d6524aaca2ff07876657ae2b323f24be4874944b` observado no `nix-conf` fornecido. A primeira compilação Tauri/WebKit pode ser longa; o cache Cargo/Nix reduz compilações subsequentes.

A validação final de integração nativa deve ser feita em um host NixOS com sessão gráfica Wayland ou X11, pois este sandbox não oferece Nix nem compositor desktop. Referências consultadas: [pré-requisitos Tauri 2 para Linux](https://v2.tauri.app/start/prerequisites/), [NixOS Wiki: Tauri](https://wiki.nixos.org/wiki/Tauri) e [nix-conf indicado](https://github.com/joaoferraz-byte/nix-conf).
