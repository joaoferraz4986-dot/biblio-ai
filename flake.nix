{
  description = "Biblio Ai — leitor e editor de livros técnicos (app desktop Electron para NixOS)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAll = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in {
      packages = forAll (pkgs:
        let
          electron = pkgs.electron;
          desktopItem = pkgs.makeDesktopItem {
            name = "biblio-ai";
            desktopName = "Biblio Ai";
            comment = "Leitor e editor de livros técnicos Biblio Ai";
            exec = "biblio-ai %U";
            icon = "biblio-ai";
            categories = [ "Education" "Office" ];
          };
        in {
          default = pkgs.stdenvNoCC.mkDerivation {
            pname = "biblio-ai";
            version = "1.2.0";
            src = pkgs.lib.cleanSourceWith {
              src = ./.;
              filter = path: type:
                let b = baseNameOf path; in
                !(builtins.elem b [ "node_modules" "electron-release" "dist" "result" ".git" "__pycache__" ]);
            };
            nativeBuildInputs = [ pkgs.makeWrapper pkgs.copyDesktopItems ];
            desktopItems = [ desktopItem ];
            dontBuild = true;
            installPhase = ''
              runHook preInstall
              mkdir -p $out/share/biblio-ai $out/share/icons/hicolor/scalable/apps $out/bin
              cp -r . $out/share/biblio-ai/
              cp build/icons/biblio-ai.svg $out/share/icons/hicolor/scalable/apps/biblio-ai.svg
              makeWrapper ${electron}/bin/electron $out/bin/biblio-ai \
                --add-flags $out/share/biblio-ai \
                --add-flags "\''${NIXOS_OZONE_WL:+\''${WAYLAND_DISPLAY:+--ozone-platform-hint=auto --enable-features=WaylandWindowDecorations}}"
              runHook postInstall
            '';
            meta.mainProgram = "biblio-ai";
          };
        });

      apps = forAll (pkgs: {
        default = { type = "app"; program = "${self.packages.${pkgs.system}.default}/bin/biblio-ai"; };
      });

      devShells = forAll (pkgs: {
        default = pkgs.mkShell {
          packages = [ pkgs.electron pkgs.nodejs ];
          shellHook = ''
            echo "Rodar sem empacotar:  LIVROS_DIR=$PWD electron ."
            echo "Validar conteúdo:     node tools/validate.js"
          '';
        };
      });
    };
}
