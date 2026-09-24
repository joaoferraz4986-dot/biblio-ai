# Biblioteca de livros técnicos

Leitor e editor de livros técnicos em HTML/CSS/JS modular. O projeto continua
abrindo diretamente em `Livros.html` ou por HTTP, e agora também pode ser executado
como aplicativo desktop Tauri 2, com persistência nativa compatível com NixOS.

## Aplicativo desktop

No NixOS, entre no ambiente declarativo e execute:

```bash
nix develop --no-update-lock-file
npm install
npm run check
npm run tauri:dev
```

Para gerar a derivação instalável no NixOS, use `nix build .#default`. O flake
usa o hook Tauri do Nixpkgs; comandos de desenvolvimento e integração com
Home Manager estão em [`docs/NIXOS.md`](docs/NIXOS.md) e
[`docs/INTEGRAR-NIX-CONF.md`](docs/INTEGRAR-NIX-CONF.md).

Para criar o commit inicial e enviar para `joaoferraz4986-dot/biblio-ai`, execute
`bash tools/publish-initial.sh`. O script inicializa o Git se necessário,
configura a identidade local indicada, confere arquivos sensíveis e usa a
autenticação Git já configurada no computador. Para só preparar o commit local,
execute `bash tools/publish-initial.sh commit-only`.

O procedimento para instalar declarativamente pelo Home Manager do `nix-conf`
está em [`docs/INTEGRAR-NIX-CONF.md`](docs/INTEGRAR-NIX-CONF.md).

No aplicativo, o botão **salvar** usa um seletor nativo de pasta e grava os mesmos
arquivos do projeto (`content/`, o bundle e os assets). Na primeira gravação,
o aplicativo solicita a pasta de destino; apenas essa raiz fica autorizada e
persistida para acesso aos assets. A lógica de leitura,
importação, exportação, personalização e progresso permanece compartilhada com a
versão web.

## Uso rápido

- **Ler**: abra `Livros.html` — a primeira tela é sempre a biblioteca (seleção de
  livros), com os últimos livros abertos primeiro. Nenhum livro é carregado antes
  da seleção; o botão **livros** (canto superior direito) reabre essa tela a
  qualquer momento.
- **Personalizar**: na biblioteca, o botão **configurações** abre o tema de
  cores em famílias (GitHub, Solarized e Catppuccin) com variantes escolhidas
  dentro da família — GitHub Dark/Dimmed/Light, Solarized Dark/Light e os quatro flavors Catppuccin. A intensidade
  ajusta a profundidade das superfícies escuras, preservando a paleta original a 50%.
  O painel também reúne o plano de fundo (grade, pontos, estrelas, textura granulada ou PNG/SVG)
  e a fonte de leitura. Cada opção tem prévia, é aplicada na hora e pode viajar
  com o projeto quando salva; fontes podem ser adicionadas em ZIP contendo TTF,
  OTF, WOFF, WOFF2 ou TTC.
- **Navegar**: `Alt` + `↓`/`↑` muda de seção; `Alt` + `Shift` + `↓`/`↑` muda de
  subseção. Nos extremos do livro, um aviso aparece em vez de rolar para lugar
  nenhum.
- **Modo foco**: esconde o sumário e o dock para leitura sem distração.
- **Editar**: botão **editar livro** abre o editor visual (informações, capa,
  seções e blocos, e a aba **Importar / Exportar**). Essa aba aceita JSON e ZIP,
  exporta o pacote com capa/imagens reais e copia um prompt completo para a IA,
  inclusive em ZIP quando a área de transferência oferece suporte. **Salvar**
  grava diretamente na pasta do projeto (Chrome/Edge, via seletor de pasta),
  incluindo o bundle, catálogo, progresso, configurações e assets; em navegadores
  sem essa API, baixa um ZIP completo como fallback. No desktop, usa o seletor
  nativo de pasta e os comandos Rust restritos à raiz autorizada.
- **Matemática**: `$E=mc^2$` em qualquer texto vira fórmula inline; o bloco
  **Fórmula (LaTeX)** no editor é para equações em destaque. Renderizado com
  KaTeX, vendorizado em `assets/vendor/` (funciona offline/`file://`).

## Estrutura

```
Livros.html              ponto de entrada
assets/css/              CSS modular (ver docs/ARQUITETURA.md)
assets/js/                JS modular, scripts clássicos (sem bundler)
assets/vendor/mermaid.min.js   Mermaid vendorizado (funciona offline/file://)
content/catalog.json     índice dos livros
content/progress.json    progresso de leitura salvo em arquivo (o navegador também
                          guarda progresso local em localStorage)
content/packages/<id>/   um livro: manifest.json + header.json + sections/*.json
tools/                   scripts de linha de comando (ver abaixo)
docs/                    formato do livro, arquitetura, prompt para IA
```

## Scripts de linha de comando (`tools/`)

- `python3 tools/build_bundle.py` — empacota todo `content/*.json` num único
  `assets/js/embedded-bundle.js`, necessário para abrir `Livros.html` por
  duplo clique (o navegador bloqueia `fetch()` de arquivos locais). Rode depois
  de editar JSON manualmente fora do editor visual.
- `node tools/validate.js` — valida todos os livros do catálogo contra o
  formato (ver `docs/FORMATO-DO-LIVRO.md`); sai com código 1 se houver erros.
- `python3 tools/migrate_v1_to_v2.py content/packages/<id>` — converte um
  pacote do formato antigo (HTML cru por seção) para o formato atual de blocos.

Nenhum desses scripts é obrigatório para o dia a dia: o editor visual já salva
no formato certo e regenera o bundle sozinho ao gravar na pasta. Eles existem
para quando você edita os arquivos JSON diretamente (por exemplo, colando a
resposta de uma IA em um arquivo em vez de usar a aba "Importar / Exportar" do editor).

## Documentação

- `docs/FORMATO-DO-LIVRO.md` — todo tipo de bloco, campos e exemplos.
- `docs/ARQUITETURA.md` — como os módulos JS/CSS se organizam e por quê.
- `docs/VALIDACAO-MIGRACAO.md` — testes, inspeção visual e limites de build da migração desktop.
- `docs/PROMPT-IA.md` — como pedir a uma IA para escrever um livro completo
  (o editor tem um botão que copia esse prompt já preenchido com o formato
  atual, então normalmente você não precisa abrir este arquivo).

## Compatibilidade

Testado em Chromium recente. Não depende de rede: fontes do Google e o
realce Mermaid têm fallback local (`assets/vendor/mermaid.min.js`) e fontes
do sistema. Funciona tanto abrindo o arquivo diretamente (`file://`) quanto
servido por qualquer servidor HTTP estático.
