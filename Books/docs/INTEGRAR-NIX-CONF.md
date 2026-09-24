# Integrar o Biblio AI ao `nix-conf`

O `nix-conf` separa o perfil do usuário em módulos Home Manager. Neste layout, `modules/hosts/common-desktop.nix` fornece `inputs` ao perfil, `home/livara/home.nix` importa `./applications.nix`, e os pacotes de desktop são listados em `home/livara/applications.nix`. Portanto, a inclusão do Biblio AI deve acontecer no perfil do usuário, não em `environment.systemPackages` nem em um módulo de sistema.

## Saída instalável do app

O `flake.nix` agora exporta `packages.<system>.default` usando `rustPlatform.buildRustPackage` e `cargo-tauri.hook` do Nixpkgs. O hook oficial compila o bundle Debian Tauri por padrão no Linux e instala o conteúdo em saídas compatíveis com o Nix store; o app não instala o `.deb` com `dpkg`. A compilação requer `cargoRoot = "src-tauri"`, `buildAndTestSubdir`, `webkitgtk_4_1`, `glib-networking`, OpenSSL e `wrapGAppsHook4`.

O `beforeBuildCommand` roda `npm run build:bundle` na raiz do projeto (`cwd = ".."`). Esse script só usa Python e os arquivos estáticos; não requer `node_modules` nem `fetchNpmDeps`. O hook fornece a CLI `cargo-tauri`. A saída está adicionada no código-fonte local entregue, mas **a compilação Nix completa ainda não foi executada**; faça o build de validação abaixo no host NixOS antes de ativar a nova configuração.

## Configurar o `nix-conf`

No `flake.nix` do `nix-conf`, dentro de `inputs`, adicione:

```nix
    biblio-ai = {
      url = "github:joaoferraz4986-dot/biblio-ai";
      inputs.nixpkgs.follows = "nixpkgs";
    };
```

O perfil já passa `inputs` para o Home Manager por `extraSpecialArgs`, portanto não é preciso alterar `modules/hosts/common-desktop.nix`. Em `home/livara/applications.nix`, onde a lista atual `home.packages` é declarada, concatene o pacote depois da lista `with pkgs` e antes das opções existentes, ou após elas:

```nix
  home.packages = with pkgs; [
    nerd-fonts.jetbrains-mono
    git
    xournalpp
    affinity-v3
    easyeffects
  ] ++ [
    inputs.biblio-ai.packages.${pkgs.system}.default
  ] ++ lib.optionals studyPlannerEnabled [ studyPlanner ];
```

Se a expressão já estiver exatamente nesse formato, a única mudança de pacote é adicionar a lista com o output do input. Verifique se o pacote inclui binário, `.desktop` e ícone; só declare `xdg.desktopEntries` manualmente se o pacote não instalar uma entrada de aplicativo válida.

Primeiro, publique as alterações do `flake.nix` e de `src-tauri/tauri.conf.json` do Biblio AI. Valide o pacote no próprio checkout:

```bash
cd ~/Projects/Books
nix build .#default
```

Depois, atualize a revisão do input no `nix-conf` e valide a configuração:

```bash
cd ~/.config/nixos
nix flake lock --update-input biblio-ai
nix eval .#nixosConfigurations.myMachine.config.home-manager.users.livara.home.packages --json
nix flake check --no-update-lock-file --all-systems
nix build .#nixosConfigurations.myMachine.config.system.build.toplevel
```

Depois de revisar o diff e a avaliação, a ativação normal do seu perfil é feita pelo procedimento de rebuild já usado no `nix-conf` (o README desse repositório indica `./install.sh`).

## Desenvolvimento sem instalação declarativa

Depois de obter o checkout do app, o ambiente de desenvolvimento pode ser usado diretamente, sem adicioná-lo ainda ao perfil:

```bash
cd ~/Projects/biblio-ai
nix develop --no-update-lock-file
npm install
npm run check
npm run tauri:dev
```

Isso é apropriado para desenvolver, mas não equivale a instalar uma derivação imutável pelo Home Manager.

## Referências

A composição indicada foi conferida em `home/livara/home.nix`, `home/livara/applications.nix` e `modules/hosts/common-desktop.nix` do repositório público `joaoferraz-byte/nix-conf`. O formato de pacote Tauri segue o exemplo `cargo-tauri.hook` do [manual do Nixpkgs](https://nixos.org/manual/nixpkgs/unstable/#sec-language-rust); a instalação do ícone/entrada desktop usa as opções do [Home Manager `xdg.desktopEntries`](https://github.com/nix-community/home-manager/blob/master/modules/misc/xdg/desktop-entries.nix).

## Uso seguro de `publish-initial.sh`

O script fica em `tools/publish-initial.sh` dentro da raiz que contém `src-tauri/` e `content/packages/`. Também aceita ser copiado para a raiz desse mesmo checkout. Ele recusa executar se a raiz Git descoberta for uma pasta acima do app e recusa repositórios Git aninhados, para evitar adicionar projetos vizinhos por engano.

Use um checkout extraído e isolado, por exemplo `~/Projects/biblio-ai`, e execute:

```bash
cd ~/Projects/biblio-ai
bash tools/publish-initial.sh
```

Não execute o script diretamente de `~/Projects` nem mantenha o app dentro de um Git que rastreie vários projetos irmãos.
