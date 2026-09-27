# Execução no NixOS

O pacote Nix é imutável, mas o aplicativo mantém uma cópia editável dos livros em `~/.config/livros/Books` (ou em `LIVROS_DIR`). A cópia é necessária para o editor salvar conteúdo, porém não deve impedir a entrada de arquivos novos do pacote.

Após `nix flake update` e `nix build`, execute novamente o aplicativo apontando para o resultado atualizado:

```bash
nix build
./result/bin/livros
```

Na inicialização, o processo desktop sincroniza o `Livros.html`, os assets de execução, o bundle embutido e a árvore de pacotes. Arquivos novos são copiados. Arquivos que ainda correspondem à versão anterior do pacote são atualizados; arquivos que o usuário editou localmente são preservados. Manifestos e metadados do pacote sempre são atualizados para que novas seções apareçam. O catálogo recebe as entradas e metadados do pacote novo sem remover livros locais.

Para validar a fonte antes de construir:

```bash
node tools/validate.js
python3 tools/build_bundle.py
nix build --no-link
```

Para começar deliberadamente com uma pasta limpa, use outra pasta de dados — sem apagar a cópia original:

```bash
LIVROS_DIR="$PWD/.books-test" ./result/bin/livros
```

Os arquivos `.books-source-version` e `.books-source-files.json` registram, respectivamente, a versão do runtime e os hashes dos arquivos distribuídos na sincronização anterior. Eles permitem distinguir uma alteração do pacote de uma edição local e atualizar o conteúdo sem sobrescrever trabalho do usuário.
