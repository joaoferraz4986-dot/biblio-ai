# Biblioteca de livros técnicos

Leitor e editor de livros técnicos em HTML/CSS/JS puro — sem build, sem framework,
sem servidor obrigatório. Abra `Livros.html` com duplo clique ou sirva a pasta por
HTTP; funciona nos dois casos.

## Uso rápido

- **Ler**: abra `Livros.html` — a primeira tela é sempre a biblioteca (seleção de
  livros), com os últimos livros abertos primeiro. Nenhum livro é carregado antes
  da seleção; o botão **livros** (canto superior direito) reabre essa tela a
  qualquer momento.
- **Personalizar**: na biblioteca, o botão **configurações** abre o tema de
  cores, o plano de fundo (grade, pontos, estrelas, textura granulada ou PNG/SVG)
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
  sem essa API, baixa um ZIP completo como fallback.
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
- `docs/PROMPT-IA.md` — como pedir a uma IA para escrever um livro completo
  (o editor tem um botão que copia esse prompt já preenchido com o formato
  atual, então normalmente você não precisa abrir este arquivo).

## Compatibilidade

Testado em Chromium recente. Não depende de rede: fontes do Google e o
realce Mermaid têm fallback local (`assets/vendor/mermaid.min.js`) e fontes
do sistema. Funciona tanto abrindo o arquivo diretamente (`file://`) quanto
servido por qualquer servidor HTTP estático.

## Projetos Arduino

O repositório não distribui livros por padrão: `content/catalog.json` começa vazio. Materiais de estudo e projetos reproduzíveis ficam em `examples/arduino/`. O projeto Wokwi documentado está em `examples/arduino/01-led-button/`; use `npm run validate:arduino` para verificar o diagrama, as peças, as conexões e os complementos visuais. Consulte `docs/ARDUINO-TOOLS.md` para a divisão entre Wokwi, SVG, ngspice e Manim.
