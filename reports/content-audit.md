# Auditoria estrutural dos livros

A auditoria percorre todos os pacotes e compara blocos com o registro oficial, verificando exercícios, fórmulas em campos apropriados e referências de mídia. A renderização KaTeX/Mermaid/SVG foi validada separadamente em `reports/render-audit.json`.

## Resultado

Foram percorridas **71 seções**, **2524 blocos**, **79 fórmulas** e **295 exercícios**. Tipos não registrados: **0**. Exercícios incompletos: **0**. Problemas de mídia: **0**.

## Distribuição de tipos

| Tipo | Quantidade |
| --- | ---: |
| `callout` | 604 |
| `code` | 246 |
| `details` | 1 |
| `divider` | 16 |
| `exercise` | 295 |
| `heading` | 116 |
| `history` | 9 |
| `image` | 2 |
| `list` | 29 |
| `math` | 79 |
| `mermaid` | 26 |
| `paragraph` | 783 |
| `steps` | 45 |
| `subsection` | 231 |
| `svg` | 7 |
| `table` | 35 |

## Achados

Não foram encontrados tipos de bloco fora do registro oficial.

Todos os exercícios possuem identificador, enunciado, dica e solução em blocos.

As referências de imagem e vídeo passaram as regras estruturais; a existência e renderização dos assets foi verificada no auditor de renderização.

### Fórmulas fora de bloco

O detector lexical abaixo é deliberadamente conservador: ele registra apenas ocorrências de LaTeX explícito ou expressões com sinal de igualdade em campos que não são `math`. Revisão manual é necessária para distinguir texto matemático legítimo de uma fórmula que deveria ser promovida a bloco.
- `content/packages/arquitetura-memoria-cpp/sections/fundamentos.json.blocks[12].code`: `soma_quadrado:\n    movslq  %esi, %rax          # converte i para 64 bits\n    movl    (%rdi,%rax,4)`
- `content/packages/arquitetura-memoria-cpp/sections/fundamentos.json.blocks[20].code`: `thread_local unsigned long requestsHandled = 0;\n\nvoid handleRequest() {\n    ++requestsHandled;\n}`
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[1].blocks[4].code`: `class Contador {\npublic:\n    static int total_instancias;   // não fica dentro do objeto\n    int `
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[1].blocks[5].code`: `    .bss                                 # valor final é 0 → vai para .bss, não .data\n_ZN8Contador1`
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[2].blocks[5].code`: `; nome decorado (Itanium C++ ABI): _ZN5Ponto5moverEi\n_ZN5Ponto5moverEi:\n    push   %rbp\n    mov  `
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[3].blocks[5].svg`: `<svg aria-labelledby="vtable-title vtable-desc" class="diagram diagram-vtable" role="img" viewBox="0`
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[3].blocks[6].code`: `struct Base {\n    virtual ~Base() {}\n    virtual void processar() { /*...*/ }\n};\nstruct Derivada`
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[3].blocks[7].code`: `mov    (%rdi), %rax     # rax = vptr; this está em rdi\nmov    16(%rax), %rax    # exemplo: slot pro`
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[5].blocks[4].code`: `alignas(Ponto) char buffer[sizeof(Ponto)];  // memória crua na stack\nPonto* p = new (buffer) Ponto(`
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[5].blocks[5].code`: `lea    buffer(%rbp), %rdi   # this = endereço do buffer (já existe, na stack)\ncall   _ZN5PontoC1Ev `
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[6].blocks[3].code`: `for (int caso = 0; caso < q; ++caso) {\n    int n; std::cin >> n;\n    std::vector<int> buffer(n);  `
- `content/packages/arquitetura-memoria-cpp/sections/objetos.json.blocks[6].blocks[4].code`: `constexpr int MAXN = 200000;\nstd::array<int, MAXN> buffer;   // .bss: uma única alocação, tempo de `
- `content/packages/arquitetura-memoria-cpp/sections/pipeline.json.blocks[6].svg`: `<svg aria-labelledby="map-title map-desc" class="diagram diagram-map" role="img" viewBox="0 0 860 56`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[1].blocks[6].text`: `Use `cat /proc/$PID/maps` para observar intervalos virtuais e permissões e `cat /proc/$PID/smaps` pa`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[2].blocks[7].code`: `quadrado:\n    push   %rbp             # prólogo\n    mov    %rsp, %rbp\n    mov    %edi, -4(%rbp)  `
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[3].blocks[6].code`: `const char* mensagem = "memoria";`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[4].blocks[6].code`: `int contador_global = 42;`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[5].blocks[9].text`: `Mesmo uma variável escrita como `int x = 0;` (com `= 0` explícito) costuma ir parar em `.bss` também`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[6].blocks[7].svg`: `<svg aria-labelledby="stack-title stack-desc" class="diagram diagram-stack" role="img" viewBox="0 0 `
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[6].blocks[8].code`: `int soma(int a, int b) {\n    int total = a + b;\n    return total;\n}`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[6].blocks[9].code`: `soma:\n    push   %rbp\n    mov    %rsp, %rbp\n    sub    $16, %rsp         # reserva 16 bytes (alin`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[7].blocks[6].code`: `Base* obj = new Derivada(1, 100);`
- `content/packages/arquitetura-memoria-cpp/sections/regioes.json.blocks[7].blocks[7].code`: `mov    $16, %edi\ncall   operator_new@PLT      # passo 1: aloca 16 bytes crus (não constrói nada ain`
- `content/packages/arquitetura-memoria-cpp/sections/toolchain.json.blocks[2].blocks[3].code`: `#define QUADRADO(x) ((x) * (x))\n#ifdef DEBUG\nconstexpr int modo = 1;\n#else\nconstexpr int modo = `
- `content/packages/arquitetura-memoria-cpp/sections/visao-geral.json.blocks[8].text`: `Considere `total = vetor[i]`. O compilador pode manter `i` e o endereço de `vetor` em registradores.`
- `content/packages/combinatoria-computacao/sections/algoritmos-combinatoria.json.blocks[2].blocks[7].svg`: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 360" role="img" aria-labelledby="matrix-tit`
- `content/packages/combinatoria-computacao/sections/algoritmos-combinatoria.json.blocks[2].blocks[8].svg`: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 260" role="img" aria-labelledby="bits-title`
- `content/packages/combinatoria-computacao/sections/algoritmos-combinatoria.json.blocks[2].blocks[9].code`: `for (std::uint64_t sub = mask; ; sub = (sub - 1) & mask) {\n    process(sub);\n    if (sub == 0) bre`
- `content/packages/combinatoria-computacao/sections/algoritmos-combinatoria.json.blocks[3].blocks[0].text`: `$O(g(n))$ é um limite superior assintótico, $\Omega(g(n))$ um limite inferior e $\Theta(g(n))$ ambos`
- `content/packages/combinatoria-computacao/sections/funcoes-geradoras.json.blocks[2].blocks[10].text`: `Uma sequência de moedas de valores 1 e 2 tem função geradora $(1+x+x^2+…)(1+x^2+x^4+…)=1/[(1-x)(1-x^`
- `content/packages/combinatoria-computacao/sections/funcoes-geradoras.json.blocks[3].blocks[7].text`: `A quantidade $C_n$ de palavras balanceadas de n pares de parênteses satisfaz $C_0=1$ e $C_n=\sum_{i=`
- `content/packages/combinatoria-computacao/sections/fundamentos.json.blocks[4].blocks[6].text`: `Se um experimento combina 3 compiladores, 4 níveis de otimização e 2 arquiteturas, a regra do produt`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[8].code`: `std::queue<int> q;\ndist[s] = 0;\nq.push(s);\nwhile (!q.empty()) {\n    int u = q.front(); q.pop();\`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[12].code`: `int tempo = 0;\nstd::vector<int> disc(n, -1), fim(n, -1);\n\nvoid dfs(int u, int pai) {\n    disc[u]`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[13].text`: `O custo de DFS também é $O(|V|+|E|)$ com listas de adjacência. A profundidade da recursão pode chega`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[15].text`: `Dijkstra resolve o problema de menor custo em um grafo ponderado quando cada peso $w(u,v)\ge 0$. Ele`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[21].text`: `Considere o grafo não dirigido com vértices `A, B, C, D, E` e arestas `A–B`, `A–C`, `B–D`, `C–D`, `D`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[28].code`: `int tempo = 0;\nstd::vector<int> disc(n, -1), low(n, -1);\nstd::vector<std::pair<int,int>> pontes;\n`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[31].text`: `Quando todo peso de aresta é `0` ou `1`, rodar Dijkstra completo ($O((|V|+|E|)\log|V|)$) é desperdíc`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[32].code`: `std::vector<int> dist(n, INF);\nstd::deque<int> dq;\ndist[s] = 0;\ndq.push_front(s);\nwhile (!dq.emp`
- `content/packages/combinatoria-computacao/sections/grafos-arvores.json.blocks[3].blocks[33].text`: `Duas outras variantes resolvem problemas específicos sem exigir um algoritmo novo: **BFS multi-fonte`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[0].text`: `As fórmulas deste capítulo serão deduzidas por decisões sucessivas e por bijeções. Não use $n!$, $P(`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[1].blocks[0].text`: `O fatorial é definido por $0!=1$ e $n!=n(n-1)!$ para $n\ge1$.`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[1].blocks[4].text`: `Casos de fronteira como n=0, k=0, k>n e objetos indistinguíveis devem ser tratados antes da álgebra.`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[2].blocks[3].text`: `Casos de fronteira como n=0, k=0, k>n e objetos indistinguíveis devem ser tratados antes da álgebra.`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[2].blocks[14].code`: `def binomiais(n):\n    linha = [1]\n    for _ in range(n):\n        linha = [1] + [linha[i] + linha[`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[3].blocks[3].text`: `Casos de fronteira como n=0, k=0, k>n e objetos indistinguíveis devem ser tratados antes da álgebra.`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[3].blocks[5].text`: `O número de soluções inteiras não negativas de $x1+…+xk=n$ é $\binom{n+k-1}{k-1}$.`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[4].blocks[0].text`: `Permutações e combinações aparecem quando um algoritmo precisa explorar ordens ou subconjuntos. A di`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[4].blocks[4].text`: `Casos de fronteira como n=0, k=0, k>n e objetos indistinguíveis devem ser tratados antes da álgebra.`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[4].blocks[5].text`: `Em testes de interação, escolher $k$ parâmetros entre $n$ sem ordem corresponde a uma combinação. Em`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[4].blocks[7].text`: `Se duas tarefas não podem ser adjacentes, não use automaticamente $n!$. Primeiro conte as ordens vál`
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[4].blocks[13].code`: `int n = 3;\nstd::vector<int> v(n);\nstd::iota(v.begin(), v.end(), 0);   // 0=X, 1=Y, resto = outras `
- `content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json.blocks[4].blocks[17].code`: `std::vector<std::string> compiladores = {"gcc", "clang", "msvc"};\nstd::vector<std::string> otimizac`
- `content/packages/combinatoria-computacao/sections/probabilidade.json.blocks[1].blocks[0].text`: `Um espaço amostral $\Omega$ contém resultados elementares; um evento `A` é um subconjunto de $\Omega`
- `content/packages/combinatoria-computacao/sections/probabilidade.json.blocks[2].blocks[9].text`: `Lance `m` chaves em `b` baldes uniformes. Para cada par de chaves `i<j`, defina $I_ij=1$ se colidir.`
- `content/packages/combinatoria-computacao/sections/probabilidade.json.blocks[5].text`: `A probabilidade discreta reaproveitou a contagem das Seções 1–2 (espaço amostral uniforme = razão de`
- `content/packages/combinatoria-computacao/sections/provas-recorrencias.json.blocks[1].blocks[0].text`: `Na indução matemática, prova-se uma proposição $P(n)$ mostrando o caso-base e que $P(n)$ implica $P(`
- `content/packages/combinatoria-computacao/sections/provas-recorrencias.json.blocks[1].blocks[6].text`: `Para $n\ge1$, $1+2+…+n=n(n+1)/2$.`
- `content/packages/combinatoria-computacao/sections/provas-recorrencias.json.blocks[3].blocks[6].text`: `O número de maneiras de cobrir uma faixa de comprimento `n` com peças de tamanho 1 e 2 satisfaz $T(n`
- `content/packages/combinatoria-computacao/sections/provas-recorrencias.json.blocks[4].blocks[6].text`: `Na busca em largura, o invariante é que um vértice retirado da fila recebe sua menor distância da fo`
- `content/packages/combinatoria-computacao/sections/topicos-avancados.json.blocks[1].blocks[8].code`: `std::vector<std::vector<long long>> S(n+1, std::vector<long long>(n+1, 0));\nS[0][0] = 1;\nfor (int `
- `content/packages/combinatoria-computacao/sections/topicos-avancados.json.blocks[1].blocks[9].text`: `Particionar `{1,2,3,4}` em 2 blocos não vazios dá 7 partições: `{1}{234}`, `{2}{134}`, `{3}{124}`, ``
- `content/packages/combinatoria-computacao/sections/topicos-avancados.json.blocks[2].blocks[8].code`: `int n = 3, cores = 2;\nlong long total_fix = 0;\nfor (int g = 0; g < n; ++g) {          // g = quant`
- `content/packages/combinatoria-computacao/sections/topicos-avancados.json.blocks[2].blocks[9].text`: `Grupo cíclico de 3 rotações em um colar de 3 contas com 2 cores: a identidade fixa todas as $2^3=8$ `
- `content/packages/combinatoria-computacao/sections/topicos-avancados.json.blocks[3].blocks[6].code`: `std::sort(arestas.begin(), arestas.end());   // por peso crescente\nUnionFind uf(n);\nlong long cust`
- `content/packages/computacao-quantica/sections/algoritmos-quanticos.json.blocks[4].blocks[5].text`: `Para N pequeno e M=1, calcule a rotação após uma e duas iterações e explique por que mais iterações `
- `content/packages/computacao-quantica/sections/complexidade-e-pratica.json.blocks[4].blocks[5].text`: `Estime a memória para n=20 e n=30 em precisão dupla, rode um circuito pequeno e compare distribuição`
- `content/packages/computacao-quantica/sections/complexidade-e-pratica.json.blocks[6].blocks[4].code`: `from dataclasses import dataclass import numpy as np  @dataclass(frozen=True) class Experiment:     `
- `content/packages/computacao-quantica/sections/qft-e-estimativa-fase.json.blocks[1].blocks[5].text`: `Calcule a QFT de N=2 ou N=4, verifique a unitariedade e identifique quais fases são observáveis após`
- `content/packages/computacao-quantica/sections/qubits-e-medicao.json.blocks[2].svg`: `<svg viewBox="0 0 600 320"><ellipse cx="300" cy="160" rx="150" ry="70" fill="none" stroke="#39c5bb" `
- `content/packages/programacao-competitiva-cpp/sections/cpp-e-analise-assintotica.json.blocks[3].code`: `#include <bits/stdc++.h>\nusing namespace std;\n\n// Retorna a soma dos elementos no intervalo [firs`
- `content/packages/programacao-competitiva-cpp/sections/cpp-e-analise-assintotica.json.blocks[13].code`: `// A profundidade é logarítmica porque o intervalo é dividido ao meio.\nint binarySearch(const vecto`
- `content/packages/programacao-competitiva-cpp/sections/cpp-moderno-stl.json.blocks[3].code`: `vector<int> a = {4, 1, 7, 1};\nsort(a.begin(), a.end());\na.erase(unique(a.begin(), a.end()), a.end(`
- `content/packages/programacao-competitiva-cpp/sections/cpp-moderno-stl.json.blocks[6].code`: `sort(v.begin(), v.end(), [](const auto& x, const auto& y) {\n    if (x.first != y.first) return x.fi`
- `content/packages/programacao-competitiva-cpp/sections/cpp-moderno-stl.json.blocks[8].blocks[3].code`: `__int128 area = (__int128)a * b;\nif (area > (__int128)4000000000000000000LL) {\n    // trate confor`
- `content/packages/programacao-competitiva-cpp/sections/dp.json.blocks[3].code`: `vector<long long> dp(W + 1, 0);\nfor (int i = 0; i < n; ++i) {\n    for (int w = W; w >= weight[i]; `
- `content/packages/programacao-competitiva-cpp/sections/dp.json.blocks[5].code`: `vector<vector<int>> dp(n + 1, vector<int>(m + 1));\nfor (int i = 1; i <= n; ++i) {\n    for (int j =`
- `content/packages/programacao-competitiva-cpp/sections/dp.json.blocks[7].blocks[5].code`: `long long solve(int v) {\n    if (memo[v] != -1) return memo[v];\n    long long best = 0;\n    for (`
- `content/packages/programacao-competitiva-cpp/sections/dp.json.blocks[15].blocks[8].code`: `using RideState = pair<int, long long>; // viagens, peso da última viagem\n\nRideState addPerson(Rid`
- `content/packages/programacao-competitiva-cpp/sections/dp.json.blocks[15].blocks[10].text`: `A base `mask=0` representa uma viagem vazia. Suponha que `bestState[mask]` contém a melhor dupla par`
- `content/packages/programacao-competitiva-cpp/sections/engenharia-contest.json.blocks[4].code`: `mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());\nfor (int tc = 0; tc < 10000`
- `content/packages/programacao-competitiva-cpp/sections/estruturas-arvore.json.blocks[2].code`: `struct Fenwick {\n    int n; vector<long long> bit;\n    Fenwick(int n): n(n), bit(n + 1) {}\n    vo`
- `content/packages/programacao-competitiva-cpp/sections/estruturas-arvore.json.blocks[5].code`: `void update(int p, int l, int r, int pos, long long val) {\n    if (r - l == 1) { tree[p] = val; ret`
- `content/packages/programacao-competitiva-cpp/sections/estruturas-arvore.json.blocks[16].blocks[7].code`: `long long countInversions(vector<long long> values) {\n    vector<long long> compressedValues = valu`
- `content/packages/programacao-competitiva-cpp/sections/fundamentos-e-metodo.json.blocks[7].blocks[5].code`: `for (int i = 0; i < n; ++i) {\n    // Invariante: ans é a melhor resposta usando a[0..i-1].\n    ans`
- `content/packages/programacao-competitiva-cpp/sections/grafos-avancados.json.blocks[3].code`: `using P = pair<long long,int>;\nconst long long INF = (1LL << 62);\nvector<long long> d(n, INF);\npr`
- `content/packages/programacao-competitiva-cpp/sections/grafos-avancados.json.blocks[6].code`: `const int LOG = 20;\nvector<array<int, LOG>> up(n);\nvector<int> depth(n);\n// up[v][j] = 2^j-ésimo `
- `content/packages/programacao-competitiva-cpp/sections/grafos-avancados.json.blocks[17].blocks[6].text`: `Use dois estados por vértice: `discountUsed = 0` ou `1`. Ao atravessar uma aresta `(u,v,w)`, sempre `
- `content/packages/programacao-competitiva-cpp/sections/grafos-avancados.json.blocks[17].blocks[7].code`: `struct State { long long cost; int vertex; int discountUsed; };\nstruct StateOrder {\n    bool opera`
- `content/packages/programacao-competitiva-cpp/sections/grafos-avancados.json.blocks[17].blocks[10].text`: `Toda rota válida pode ser decomposta no último salto. Se o desconto não foi usado, o salto custa `w``
- `content/packages/programacao-competitiva-cpp/sections/grafos-basicos.json.blocks[2].code`: `vector<vector<int>> g(n);\nvector<int> dist(n, -1);\nqueue<int> q;\ndist[source] = 0; q.push(source)`
- `content/packages/programacao-competitiva-cpp/sections/grafos-basicos.json.blocks[5].code`: `struct DSU {\n    vector<int> p, sz;\n    DSU(int n): p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); `
- `content/packages/programacao-competitiva-cpp/sections/grafos-basicos.json.blocks[7].blocks[5].code`: `queue<int> q;\nfor (int v = 0; v < n; ++v) if (indeg[v] == 0) q.push(v);\nvector<int> order;\nwhile `
- `content/packages/programacao-competitiva-cpp/sections/grafos-basicos.json.blocks[8].blocks[5].code`: `vector<int> color(n, -1);\nfor (int s = 0; s < n; ++s) if (color[s] == -1) {\n    queue<int> q; q.pu`
- `content/packages/programacao-competitiva-cpp/sections/grafos-basicos.json.blocks[15].blocks[10].code`: `struct Cell { int row, column; };\n\nstring reconstructPath(Cell startCell, Cell targetCell,\n      `
- `content/packages/programacao-competitiva-cpp/sections/matematica.json.blocks[2].code`: `long long modpow(long long a, long long e, long long mod) {\n    if (mod <= 0 || e < 0) throw invali`
- `content/packages/programacao-competitiva-cpp/sections/matematica.json.blocks[4].code`: `long long extgcd(long long a, long long b, long long& x, long long& y) {\n    if (!b) { x = 1; y = 0`
- `content/packages/programacao-competitiva-cpp/sections/matematica.json.blocks[6].code`: `vector<bool> prime(n + 1, true);\nif (n >= 0) prime[0] = false;\nif (n >= 1) prime[1] = false;\nfor `
- `content/packages/programacao-competitiva-cpp/sections/ordenacao-busca-gulosos.json.blocks[3].code`: `long long lo = 0, hi = 1e18;\nwhile (lo < hi) {\n    long long mid = lo + (hi - lo) / 2;\n    if (ca`
- `content/packages/programacao-competitiva-cpp/sections/ordenacao-busca-gulosos.json.blocks[6].code`: `sort(intervals.begin(), intervals.end(), [](auto a, auto b) {\n    return a.second < b.second;\n});\`
- `content/packages/programacao-competitiva-cpp/sections/ordenacao-busca-gulosos.json.blocks[8].blocks[3].code`: `vector<long long> xs = a;\nsort(xs.begin(), xs.end());\nxs.erase(unique(xs.begin(), xs.end()), xs.en`
- `content/packages/programacao-competitiva-cpp/sections/prefixos-janelas.json.blocks[2].code`: `vector<long long> pref(n + 1);\nfor (int i = 0; i < n; ++i) pref[i + 1] = pref[i] + a[i];\n// soma d`
- `content/packages/programacao-competitiva-cpp/sections/prefixos-janelas.json.blocks[4].code`: `unordered_map<long long, long long> cnt;\ncnt[0] = 1;\nlong long pref = 0, ans = 0;\nfor (long long `
- `content/packages/programacao-competitiva-cpp/sections/prefixos-janelas.json.blocks[7].code`: `int l = 0;\nfor (int r = 0; r < n; ++r) {\n    add(a[r]);\n    while (invalid()) remove(a[l++]);\n  `
- `content/packages/programacao-competitiva-cpp/sections/prefixos-janelas.json.blocks[8].blocks[3].code`: `vector<long long> diff(n + 1);\ndiff[l] += x;\nif (r + 1 < n) diff[r + 1] -= x;\nfor (int i = 1; i <`
- `content/packages/programacao-competitiva-cpp/sections/prefixos-janelas.json.blocks[9].blocks[3].code`: `sort(a.begin(), a.end());\nint l = 0, r = n - 1;\nwhile (l < r) {\n    long long s = a[l] + a[r];\n `
- `content/packages/programacao-competitiva-cpp/sections/referencias-e-trilha.json.blocks[2].blocks[1].code`: `for (uint64_t seed : seeds) {     auto input = generate_small_case(seed);     auto expected = brute_`
- `content/packages/programacao-competitiva-cpp/sections/strings.json.blocks[3].code`: `vector<int> prefix_function(const string& s) {\n    vector<int> pi(s.size());\n    for (int i = 1; i`
- `content/packages/programacao-competitiva-cpp/sections/strings.json.blocks[6].code`: `vector<int> z_function(const string& s) {\n    int n = s.size(); vector<int> z(n);\n    for (int i =`
- `content/packages/programacao-competitiva-cpp/sections/strings.json.blocks[7].blocks[3].code`: `struct Node { array<int, 26> next; bool terminal = false; Node() { next.fill(-1); } };\nvector<Node>`
- `content/packages/programacao-competitiva-cpp/sections/tecnicas-avancadas.json.blocks[3].code`: `vector<long long> sums(const vector<long long>& a) {\n    vector<long long> r = {0};\n    for (auto `
- `content/packages/programacao-competitiva-cpp/sections/tecnicas-avancadas.json.blocks[5].code`: `for (int mask = 0; mask < (1 << n); ++mask) {\n    for (int sub = mask; sub; sub = (sub - 1) & mask)`
- `content/packages/programacao-competitiva-cpp/sections/tecnicas-avancadas.json.blocks[10].blocks[3].code`: `sort(queries.begin(), queries.end(), [&](Query a, Query b) {\n    int ba = a.l / block, bb = b.l / b`
- `content/packages/reinos-microscopicos/sections/mapa-da-vida-microscopica.json.blocks[2].svg`: `<svg viewBox="0 0 700 230"><rect x="250" y="20" width="200" height="50" rx="10" fill="#173f4a" strok`
- `content/packages/reinos-microscopicos/sections/neuronios-e-biocomputacao.json.blocks[8].blocks[6].code`: `#include <algorithm> #include <cstdint> #include <iostream> #include <random> #include <vector>  str`
- `content/packages/sistemas-embarcados-arduino/sections/programacao-sketch.json.blocks[1].code`: `const unsigned long period = 1000; unsigned long nextSample = 0;  void loop() {   unsigned long now `
- `content/packages/sistemas-embarcados-arduino/sections/projeto-profissional.json.blocks[6].blocks[4].code`: `typedef enum { RUNNING, DEGRADED, SAFE } device_state_t; static QueueHandle_t samples; static volati`
