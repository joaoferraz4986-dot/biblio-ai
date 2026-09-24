{
  description = "Books — biblioteca offline de livros técnicos em Tauri";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forEachSystem = nixpkgs.lib.genAttrs systems;
    in {
      devShells = forEachSystem (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.mkShell {
            packages = with pkgs; [
              cargo
              cargo-tauri
              clippy
              nodejs_22
              pkg-config
              python3
              rust-analyzer
              rustc
              rustfmt
              webkitgtk_4_1
              wrapGAppsHook4
              openssl
              glib-networking
              librsvg
            ];

            buildInputs = with pkgs; [ webkitgtk_4_1 openssl glib-networking librsvg ];

            shellHook = ''
              export XDG_DATA_DIRS="''${GSETTINGS_SCHEMAS_PATH:-}''${XDG_DATA_DIRS:+:$XDG_DATA_DIRS}"
              export CARGO_TARGET_DIR="''${CARGO_TARGET_DIR:-$PWD/target}"
              export npm_config_cache="''${npm_config_cache:-$PWD/.npm-cache}"
            '';
          };
        });

      packages = forEachSystem (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.rustPlatform.buildRustPackage {
            pname = "biblio-ai";
            version = "0.1.0";
            src = self;

            cargoRoot = "src-tauri";
            buildAndTestSubdir = "src-tauri";
            cargoLock.lockFile = ./src-tauri/Cargo.lock;

            nativeBuildInputs = with pkgs; [
              cargo-tauri.hook
              nodejs_22
              python3
              pkg-config
              wrapGAppsHook4
            ];

            buildInputs = with pkgs; [
              glib-networking
              openssl
              webkitgtk_4_1
              librsvg
            ];

            meta = {
              description = "Biblioteca offline de livros técnicos";
              homepage = "https://github.com/joaoferraz4986-dot/biblio-ai";
              license = pkgs.lib.licenses.mit;
              mainProgram = "books";
              platforms = pkgs.lib.platforms.linux;
            };
          };
        });

      checks = forEachSystem (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in {
          javascript = pkgs.runCommand "books-javascript-check" { nativeBuildInputs = [ pkgs.nodejs_22 pkgs.python3 ]; } ''
            cp -r ${self} source
            chmod -R u+w source
            cd source
            python3 tools/build_bundle.py
            find assets/js -name '*.js' -print0 | xargs -0 -n1 node --check
            node tools/validate.js
            node tools/test-themes.js
            touch $out
          '';
        });
    };
}
