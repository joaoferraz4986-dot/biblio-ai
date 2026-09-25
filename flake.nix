{
  description = "Livros — leitor e editor de livros técnicos (app desktop Electron para NixOS)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAll = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in {
      packages = forAll (pkgs:
        let
          electron = pkgs.electron;   # Electron do nixpkgs, já com o wrapper correto para NixOS
          desktopItem = pkgs.makeDesktopItem {
            name = "livros";
            desktopName = "Livros";
            comment = "Leitor e editor de livros técnicos";
            exec = "livros %U";
            icon = "accessories-dictionary";
            categories = [ "Education" "Office" ];
          };
        in {
          default = pkgs.stdenvNoCC.mkDerivation {
            pname = "livros";
            version = "1.0.0";
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
              mkdir -p $out/share/livros $out/bin
              cp -r . $out/share/livros/
              # Os livros ficam em ~/.config/Livros/Books (gravável); a cópia do /nix/store é só o modelo inicial.
              # Para usar outra pasta: LIVROS_DIR=/caminho/para/Books livros
              makeWrapper ${electron}/bin/electron $out/bin/livros \
                --add-flags $out/share/livros \
                --add-flags "\''${NIXOS_OZONE_WL:+\''${WAYLAND_DISPLAY:+--ozone-platform-hint=auto --enable-features=WaylandWindowDecorations}}"
              runHook postInstall
            '';
            meta.mainProgram = "livros";
          };
        });

      apps = forAll (pkgs: {
        default = { type = "app"; program = "${self.packages.${pkgs.system}.default}/bin/livros"; };
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
