# App desktop (Electron) — NixOS

O projeto agora roda também como aplicativo desktop. O HTML/CSS/JS continua o mesmo;
só a camada de arquivos mudou: no app, **Salvar** grava direto no disco com o `fs` do
Node (escrita atômica), e capas/imagens antigas são realmente apagadas — sem ZIP, sem
seletor de pasta, independente do navegador instalado.

## Instalar / rodar no NixOS

Dentro desta pasta:

```sh
nix run .                 # roda direto
nix profile install .     # instala (comando `livros` + atalho no menu)
```

Ou no `configuration.nix` / home-manager via flake input:

```nix
inputs.livros.url = "path:/caminho/para/Books";
# ...
environment.systemPackages = [ inputs.livros.packages.x86_64-linux.default ];
```

## Onde ficam os livros

- Padrão: `~/.config/Livros/Books` — criada na primeira execução a partir da cópia
  empacotada (o `/nix/store` é somente leitura).
- Para editar a pasta do repositório diretamente: `LIVROS_DIR=$PWD livros`
  (ou, no desenvolvimento, `nix develop` e depois `LIVROS_DIR=$PWD electron .`).
- Menu **Arquivo → Abrir pasta dos livros** abre essa pasta no gerenciador de arquivos.

## Fora do NixOS

```sh
npm install
npm start                 # desenvolvimento
npm run package:linux     # gera electron-release/Livros-linux-x64
```

## Arquivos

- `desktop/main.cjs` — janela, protocolo `app://` (permite `fetch` de `content/*.json`),
  operações de arquivo restritas à pasta do projeto.
- `desktop/preload.cjs` — ponte segura (`contextIsolation`, `sandbox`).
- `assets/js/desktop/fs-shim.js` — implementa a interface da File System Access API sobre
  o disco real; no navegador comum não faz nada.
- `flake.nix` — pacote, `nix run` e shell de desenvolvimento.
