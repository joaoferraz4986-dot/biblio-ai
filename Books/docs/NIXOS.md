# Desenvolvimento no NixOS

O aplicativo usa **Tauri 2** com o frontend HTML/CSS/JavaScript existente. A interface não foi reescrita: a mudança de plataforma fica na ponte nativa em `assets/js/core/native.js` e nos comandos Rust em `src-tauri/src/lib.rs`.

## Ambiente reproduzível

Com Nix e flakes habilitados:

```bash
nix develop --no-update-lock-file
npm install
npm run check
npm run tauri:dev
```

O `flake.nix` fornece Node.js 22, Rust, `cargo-tauri`, WebKitGTK 4.1, `pkg-config`, OpenSSL, GLib networking e librsvg. A escolha de WebKitGTK 4.1 segue os pré-requisitos do Tauri 2 e a orientação do NixOS Wiki.

## Build do aplicativo

```bash
nix develop --no-update-lock-file
npm install
npm run build:bundle
npm run tauri:build
```

Para instalar pela derivação Nix, o flake expõe `packages.<system>.default` e
usa o `cargo-tauri.hook` oficial. No Linux, o hook gera o payload Debian durante
o build e instala o conteúdo extraído em `$out` — o `.deb` não é instalado com
`dpkg` no NixOS. Valide no host com:

```bash
nix build .#default
./result/bin/books
```

`npm run tauri:build` continua disponível para builds manuais de AppImage/deb.
Para a instalação declarativa pelo perfil do usuário, veja
[`INTEGRAR-NIX-CONF.md`](INTEGRAR-NIX-CONF.md).

## Integração com Home Manager

O pacote Nix fornece uma saída desktop utilizável pelo Home Manager. O projeto
não usa caminhos FHS fixos, grava dados somente na pasta de livros escolhida e
não depende de `sudo`, `/usr`, `/opt` ou serviços de sistema.

O diretório do projeto é selecionado pelo diálogo nativo. A raiz autorizada fica persistida na configuração do app, e somente ela é liberada dinamicamente para o asset protocol. O app grava `content/`, `assets/js/embedded-bundle.js` e os assets importados por comandos Rust com validação contra traversal, caminhos absolutos, links simbólicos e caminhos excessivamente profundos.

## Operação sem rede

O catálogo, os livros, Mermaid e KaTeX continuam embarcados ou vendorizados no projeto. Fontes do Google continuam opcionais e possuem fallback local do CSS. A primeira execução não requer servidor web: `tauri:dev` inicia apenas o servidor local de desenvolvimento exigido pelo WebView; o build de produção carrega os arquivos estáticos empacotados.

## Verificações

Antes de integrar no `nix-conf`, execute:

```bash
git diff --check
nix flake check --no-update-lock-file --all-systems
npm run check
```

A validação de runtime gráfico e Wayland deve ser feita no host NixOS real,
porque o sandbox não oferece Nix nem compositor. A expressão do pacote ainda
precisa ser compilada no host NixOS antes de ativá-la. Os testes Rust e
JavaScript são descritos em [`VALIDACAO-MIGRACAO.md`](VALIDACAO-MIGRACAO.md);
a primeira compilação integral de Tauri/WebKit pode ser demorada.

## Referências consultadas

As decisões seguem a documentação oficial do [Tauri 2 sobre pré-requisitos Linux](https://v2.tauri.app/start/prerequisites/), que exige Rust e WebKitGTK 4.1, o [plugin de diálogo](https://v2.tauri.app/plugin/dialog/), que fornece seleção de pastas e arquivos em Linux, a [API de filesystem do Tauri](https://v2.tauri.app/plugin/file-system/), que recomenda `std::fs` no lado Rust, e a [seção `cargo-tauri.hook` do manual do Nixpkgs](https://nixos.org/manual/nixpkgs/unstable/#sec-language-rust), que documenta `cargo-tauri.hook`, `webkitgtk_4_1`, `wrapGAppsHook4`, `pkg-config` e `buildRustPackage`.

Também foi consultado o [NixOS Wiki sobre Tauri](https://wiki.nixos.org/wiki/Tauri), que confirma o ambiente declarativo com `cargo`, `cargo-tauri`, Node.js, `pkg-config`, `librsvg` e `webkitgtk_4_1`, e o [repositório `nix-conf` fornecido](https://github.com/joaoferraz-byte/nix-conf), especialmente o uso de `nixpkgs/nixos-unstable`, flakes, validações de baixo custo e a separação entre ambiente declarativo e dados mutáveis.
