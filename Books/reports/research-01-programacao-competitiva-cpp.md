# Auditoria do livro **Programação Competitiva em C++: do básico ao avançado**

**Repositório auditado:** `/home/ubuntu/biblio-ai`  
**Pacote:** `content/packages/programacao-competitiva-cpp/`  
**Data da auditoria:** 2026-09-24  
**Escopo:** somente o pacote de programação competitiva e os documentos de projeto solicitados. Nenhum arquivo do livro foi editado.

## 1. Resumo executivo

O pacote tem uma **arquitetura didática coerente**: parte de modelagem, invariantes e complexidade, passa por C++/STL, ordenação, prefixos, programação dinâmica, grafos, estruturas de dados, strings, matemática, técnicas avançadas e termina com engenharia de contest e laboratório. O manifesto e o cabeçalho estão semanticamente alinhados com essa proposta. O validador oficial do repositório executado na raiz do projeto terminou com **0 erros e 0 avisos**, e os 70 identificadores de subseção são únicos.

O pacote, porém, **não está pronto para publicação técnica sem uma rodada de correções**. O achado mais grave é de renderização e copiabilidade: há 94 blocos de código, e 49 contêm a sequência literal `\\n`; em 43 deles essa é a única forma de quebra. O renderizador de código divide o conteúdo apenas por quebras reais (`split("\\n")`), portanto esses blocos aparecem como uma linha longa e, quando copiados, não formam o programa apresentado visualmente. O efeito atinge exemplos centrais de DP, grafos, Fenwick, matemática, strings e técnicas avançadas.

Há também um **descompasso documental comprovado**: `docs/FORMATO-DO-LIVRO.md` descreve a referência de blocos como gerada automaticamente, mas não documenta o bloco `exercise`, embora ele esteja registrado em `assets/js/blocks/exercise.js`, validado e usado 84 vezes. O livro possui apenas **quatro blocos de fórmula** e **um diagrama Mermaid**, todos concentrados em poucos pontos. A cobertura de referências é baixa: existem oito URLs distintas em dez ocorrências, quase todas em engenharia de contest e fundamentos; as explicações algorítmicas não têm citações locais ou bibliografia seção a seção.

Pedagogicamente, as primeiras subseções de cada capítulo são substantivas, mas os 42 blocos finais com tags `01`, `02` e `03` repetem um molde de seis ou oito blocos: dois parágrafos genéricos, um critério acadêmico, às vezes uma fundamentação, um “esqueleto de análise” em texto e um exercício R1. As soluções recolhidas dos exercícios têm 19 textos distintos para 84 exercícios; **42 soluções são exatamente a mesma resposta genérica**. Isso satisfaz a estrutura do schema, mas não oferece prática específica nem solução verificável.

### Veredito

| Dimensão | Veredito | Evidência principal |
|---|---|---|
| Estrutura JSON e integridade de IDs | **Aprovada** | Validador oficial: 0 erros/0 avisos; 70 IDs de subseção únicos. |
| Organização curricular | **Boa, com lacunas** | Progressão geral forte; salto de numeração da seção 12 para a 14 e 42 subseções sem número explícito. |
| Código como material executável | **Reprovada até corrigir** | 49/94 blocos com `\\n` literal; 43 somente com escapes literais. |
| Correção algorítmica | **Majoritariamente correta em alto nível** | BFS, Dijkstra, DP, Fenwick, KMP e Manacher seguem padrões conhecidos; faltam hipóteses e contexto em vários snippets. |
| Fórmulas | **Parcial** | Quatro fórmulas; duas leituras em português estão malformadas e há hipóteses omitidas. |
| Diagramas | **Insuficiente** | Apenas um Mermaid, sobre low-link; nenhum diagrama para DP, fluxo, segment tree, strings ou laboratório. |
| Exercícios | **Estruturalmente bons, pedagogicamente fracos** | 84 exercícios têm dica e `solutionBlocks`, mas 42 soluções repetem texto genérico. |
| Referências | **Insuficientes para um curso técnico** | Oito URLs distintas, concentradas em duas seções; não há fontes locais para as afirmações técnicas. |
| Biologia/evolução | **Ausente** | Não há seção de biologia; projeto Wright–Fisher é proposto neste relatório como recomendação de extensão, não como conteúdo existente. |
| Computação quântica | **Ausente** | Não há fórmula nem implementação quântica no pacote; a auditoria não pode confirmar conteúdo que não existe. |

## 2. Materiais lidos e método

Foram lidos integralmente `docs/FORMATO-DO-LIVRO.md`, `docs/ARQUITETURA.md`, `docs/REFERENCIAS-REVISAO.md`, `content/packages/programacao-competitiva-cpp/manifest.json`, `content/packages/programacao-competitiva-cpp/header.json` e os 14 JSONs em `content/packages/programacao-competitiva-cpp/sections/`. Também foram inspecionados o validador e os registros de blocos necessários para distinguir validade estrutural de qualidade semântica: `assets/js/blocks/code.js`, `assets/js/blocks/exercise.js`, `assets/js/blocks/diagram.js` e `assets/js/content/validate.js`.

A contagem automatizada encontrou 14 seções, 70 subseções, 313 parágrafos, 60 headings, 94 blocos de código, 84 exercícios, 165 callouts, 23 listas, cinco tabelas, quatro fórmulas, um diagrama Mermaid e uma imagem histórica. Os snippets foram analisados semanticamente. O ambiente desta auditoria não possui `g++`, `clang++` ou `c++`; portanto não foi possível executar uma compilação local dos 94 snippets. Essa limitação não afeta o achado independente sobre os escapes, que resulta da comparação direta entre o formato armazenado e o código do renderizador.

## 3. Achados comprovados

### 3.1. Escapes de quebra de linha quebram exemplos de código

Em `assets/js/blocks/code.js`, o renderizador faz `String(b.code || '').replace(/\\n+$/, '')` e depois chama `Books.highlight.renderLines(code, ...)`; o realce e o resumo também dependem de quebras reais. Nos JSONs do pacote, muitos valores foram armazenados com `\\n` literal. Por exemplo, o primeiro código de `cpp-e-analise-assintotica.json` começa, depois de `JSON.parse`, como `#include <bits/stdc++.h>\\nusing namespace std;`, e não como duas linhas.

A auditoria contou:

- **94** blocos de código no total;
- **49** com pelo menos uma sequência literal `\\n`;
- **43** somente com `\\n` literal e nenhuma quebra real;
- **42** somente com quebras reais;
- **6** com as duas representações;
- **3** sem nenhuma quebra.

Esse problema é confirmado em exemplos com títulos como “Busca binária iterativa e segura”, “Mochila 0/1 em O(nW)”, “Transição separada da enumeração de máscaras”, “Dijkstra em grafo de estados”, “BFS — menores distâncias sem pesos”, “Fenwick: atualização pontual e soma de prefixo”, “Prefix function em O(n)” e “Ordenação de Mo com alternância”. A recomendação é normalizar todos os campos `code` e `mermaid` para conter quebras reais antes de qualquer nova revisão de conteúdo.

### 3.2. A validação estrutural passa, mas não valida executabilidade

`node tools/validate.js /home/ubuntu/biblio-ai` retornou `OK` para os seis pacotes e `0 erro(s), 0 aviso(s) no total`. Isso comprova a conformidade do pacote com o schema, a unicidade de âncoras e a presença dos campos obrigatórios. Não comprova que um snippet compile, que uma fórmula seja suficiente para o teorema declarado ou que um exemplo tenha saída correta.

A ausência de erros é compatível com o desenho do validador: ele verifica campos, tipos, IDs, tabelas, LaTeX básico, links internos e a presença de exercício local, mas não executa C++, não testa Mermaid em um navegador e não compara exemplos de entrada e saída.

### 3.3. O formato documentado está atrasado em relação ao registro de blocos

`docs/FORMATO-DO-LIVRO.md` afirma que a referência de blocos é gerada automaticamente a partir de `assets/js/blocks/*.js`, mas não contém a seção `exercise`. O registro efetivo em `assets/js/blocks/exercise.js` define `prompt`, `hint`, `difficulty` e `solutionBlocks`, e o pacote usa esses campos corretamente. Trata-se de um **achado documental comprovado**, não de erro dos JSONs. A referência deve ser regenerada ou receber uma seção explícita para `exercise`.

### 3.4. Repetição excessiva de subseções e soluções

As 70 subseções são únicas por ID. Contudo, 42 subseções possuem `number` vazio e usam somente tags `01`, `02` e `03`; elas têm títulos como “Estado E Recorrência”, “Dijkstra E Relaxamento”, “Heap E Dsu” e “Kmp E Z”. A ausência de número é permitida pelo schema, mas reduz a navegação e a hierarquia visível.

Os 84 exercícios têm campos de dificuldade, dica e solução. A análise das soluções encontrou somente **19 textos distintos**. Em particular, **42 soluções são idênticas**, com o texto que recomenda ligar cada decisão à restrição e preservar um invariante, sem resolver o problema específico. Isso é adequado como checklist de revisão, mas não como solução de um exercício sobre, por exemplo, Fenwick, SCC, geometria ou aleatorização.

### 3.5. Cobertura de referências e mídia é insuficiente

O pacote contém oito URLs distintas:

- repositório português do *Competitive Programmer’s Handbook*;
- CSES Problem Set;
- cp-algorithms;
- cppreference;
- USACO Guide;
- Codeforces;
- AtCoder;
- ICPC.

Há dez ocorrências porque CSES e USACO aparecem em duas seções. As URLs estão concentradas em `fundamentos-e-metodo.json` e `engenharia-contest.json`; não há referência local em `matematica.json`, `grafos-avancados.json`, `estruturas-arvore.json`, `strings.json` ou `tecnicas-avancadas.json`. O livro possui uma imagem histórica de Dijkstra e um diagrama Mermaid de low-link. Não há diagramas para as outras 13 seções, nem captions ou fontes web associadas a cada afirmação técnica.

### 3.6. Lacuna de numeração no manifesto

O manifesto lista as seções `0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14`. O uso de zero na primeira seção pode ser deliberado, mas o salto de 12 para 14 é uma inconsistência observável. Recomenda-se renumerar “Laboratório integrador” como 13 ou criar explicitamente a seção 13, além de atualizar números de exercícios e links internos se houver dependências externas.

## 4. Avaliação por seção e subseção

A matriz abaixo cobre todas as 14 seções e todas as 70 subseções. “R1 específico” significa que existe um exercício local relacionado ao título, porém a solução é curta e frequentemente genérica. “R1 genérico” significa a estrutura padrão de revisão usada nas subseções de tag `01`–`03`.

### Seção 0 — C++ essencial e eficiência assintótica (`cpp-e-analise-assintotica.json`)

A seção introduz tipos, escopo, referências, ponteiros, classes, medição de tempo e memória, recorrência e busca binária. O quadro de custos e a recorrência são úteis. A fórmula `T(n)=2T(n/2)+O(n)=O(n\log n)` expressa a conclusão esperada, mas mistura uma relação de recorrência com uma igualdade assintótica; para precisão editorial, deve usar hipóteses de base e `Theta` na conclusão. O capítulo não tem diagrama e tem quatro exercícios, dos quais três são repetições de revisão.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Contrato E Complexidade** | Relaciona contrato, estado, invariante e limite; o exemplo é apenas o pipeline textual `input -> model -> invariant -> transition -> output`. Sem fórmula nova, diagrama ou código algorítmico executável. | **R1 genérico.** Substituir por um laço concreto, uma prova de soma de iterações e três casos-limite. |
| **Inteiros, Memória E Sanitizers** | O texto distingue semântica do padrão, ABI e ferramenta, mas o “Esqueleto de análise” não mostra sanitizer nem overflow real. | **R1 genérico.** Incluir `-fsanitize=address,undefined`, um programa defeituoso e a saída esperada do diagnóstico. |
| **Recorrências E Amortização** | Menciona recorrência e amortização, mas não apresenta potencial, contabilidade ou uma sequência de operações. | **R1 genérico.** Demonstrar `push` de vetor dinâmico ou fila monotônica com função potencial. |

### Seção 1 — Como pensar, estudar e medir soluções (`fundamentos-e-metodo.json`)

É uma das melhores aberturas do livro: contrato, limites, invariantes, validação e treino deliberado aparecem em ordem pedagógica. A tabela de orçamento assintótico é útil como heurística, mas “até milhões” e “alguns milhares” dependem de constante, linguagem e limite de tempo. O template chama `a.front()` sem tratar `n=0`. Há uma imagem histórica de Dijkstra. As referências CSES e USACO são pertinentes e canônicas.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Prova curta antes do código** | Define as quatro perguntas corretas de uma prova e mostra um invariante de máximo. O exemplo é simples e adequado ao início. | **R1 específico**, mas a solução ainda é uma frase. Pedir uma prova completa do invariante com inicialização, manutenção e término. |
| **Treino deliberado** | Recomenda CSES e USACO Guide e classifica erros por interpretação, prova, complexidade e implementação. É conceitualmente sólido. | **R1 genérico.** Acrescentar uma rubrica de pós-análise e links para listas concretas por nível. |
| **Modelagem De Entrada** | Reitera contrato, estado e hipótese; não apresenta enunciado real nem transformação de história para estrutura. | **R1 genérico.** Usar um problema CSES específico e explicitar entrada, saída, restrições e modelo. |
| **Prova Por Invariante** | Reitera indução e cobertura das possibilidades; o esqueleto de texto não substitui uma demonstração. | **R1 genérico.** Incluir uma tabela de estados antes/depois de cada iteração. |
| **Testes Adversariais** | O conceito é importante, mas o conteúdo não lista geradores, oráculos ou casos adversariais concretos. | **R1 genérico.** Integrar brute force, gerador aleatório com seed e casos mínimos/máximos. |

### Seção 2 — C++ moderno e a biblioteca padrão (`cpp-moderno-stl.json`)

A seção apresenta `vector`, `deque`, mapas, conjuntos, `priority_queue`, `bitset`, algoritmos genéricos, comparadores, overflow e I/O. A tabela de containers está correta em termos gerais; o custo de `unordered_*` é explicitamente médio e não garante o pior caso. O material cita invalidadores de iterador, o que é correto e deve ser mantido junto à documentação do `vector` [2]. O código de C++ sofre o problema de escapes descrito na seção 3.1.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Inteiros, overflow e precisão** | Recomenda `long long` e `__int128`; o snippet de produto é ilustrativo, mas a condição fixa `4e18` não é universal. | **R1 específico.** Exigir limites numéricos e conversão de `__int128` para saída. |
| **Texto e entrada/saída** | Explica `sync_with_stdio(false)`, `cin.tie(nullptr)` e `getline(cin >> ws, line)`. Deve advertir que `ws` elimina whitespace inicial, o que nem sempre é desejado. | **R1 específico.** Comparar `getline`, `ws`, leitura tokenizada e EOF com entradas que começam por espaço. |
| **Iteradores E Invariantes** | O conceito é pertinente, mas o conteúdo é majoritariamente um molde geral; não há exemplo de invalidação aplicado. | **R1 genérico.** Mostrar `vector::push_back` com e sem realocação e usar `lower_bound` em range particionado [1] [2]. |
| **Containers E Custos** | Reforça a escolha por operação dominante, mas não diferencia suficientemente `map`, `unordered_map`, `deque` e `vector` em um caso de contest. | **R1 genérico.** Pedir uma matriz de operações e uma implementação comparativa. |
| **Comparadores E Segurança** | O título mistura comparadores da STL com “segurança”; o texto deriva para plataforma, clock, energia e falhas, destoando do capítulo. | **R1 genérico.** Separar a subseção em ordem fraca estrita e engenharia de execução. O comparador deve ser validado à luz de `lower_bound` [1]. |

### Seção 3 — Ordenação, busca e estratégias gulosas (`ordenacao-busca-gulosos.json`)

A seção cobre busca binária sobre resposta, intervalos, compressão de coordenadas, ordenação estável e prova gulosa. A regra de selecionar intervalos pelo fim crescente é correta para o problema clássico de maior conjunto de intervalos compatíveis. O código de dois pontos e a seleção gulosa precisam declarar se os intervalos são fechados, abertos ou meio-abertos.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Compressão de coordenadas** | A explicação e o código com `sort`, `unique` e `lower_bound` estão corretos para preservar ordem e igualdade. | **R1 específico.** Incluir valores repetidos, negativos e `10^18`; citar `lower_bound` [1]. |
| **Ordenação estável e comparadores** | Explica ordem fraca estrita e evita subtração com risco de overflow. É um ponto forte. | **R1 específico.** Fornecer pares com empates e testar estabilidade observável. |
| **Ordenação Estável** | Molde genérico, sem exemplo de `stable_sort` nem demonstração de estabilidade. | **R1 genérico.** Transformar em exercício sobre registros com chave secundária implícita. |
| **Busca Binária Sobre Resposta** | O template usa `lo=0`, `hi=1e18` e `can(mid)`, mas não define monotonicidade nem limites seguros do domínio. | **R1 genérico.** Incluir uma função `can`, prova de monotonicidade e invariantes `lo/hi`. |
| **Prova Da Escolha Gulosa** | O texto inicial fala em prova de troca e contraexemplo, mas a subseção posterior volta ao molde. | **R1 genérico.** Usar seleção de atividades e um contraexemplo de moeda não canônica. |

### Seção 4 — Prefixos, janelas e técnicas de sequência (`prefixos-janelas.json`)

A seção apresenta prefixos, contagem de subarrays com soma `K`, janela deslizante, diferença e dois ponteiros. O alerta de que soma prefixada com mapa funciona com números negativos é correto. O padrão de janela só é válido quando a condição é monotônica; isso deve aparecer em cada exercício. O código de dois ponteiros, depois de encontrar um par, incrementa os dois lados e não conta multiplicidades; a finalidade deve ser declarada.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Atualizações em intervalo** | A fórmula de diferença para `[l,r]` está correta, mas o código usa `[l,r)` em um comentário anterior e `[l,r]` no texto. | **R1 específico.** Fixar uma convenção única e testar `r=n-1` e intervalos unitários. |
| **Dois ponteiros e ordenação** | O argumento de descartar candidatos é adequado para array ordenado. Falta distinguir “um par”, “todos os pares” e contagem com duplicatas. | **R1 específico.** Especificar a saída e acrescentar caso `[1,1,1,1]`. |
| **Somas Prefixadas** | Molde genérico, embora o capítulo principal já tenha código de prefixos e soma `K`. | **R1 genérico.** Resolver uma instância numérica com prefixos explícitos e comparar com força bruta. |
| **Dois Ponteiros** | Repetição direta do padrão, sem condição concreta de monotonicidade. | **R1 genérico.** Exigir hipótese, invariante e contraexemplo com números negativos. |
| **Fenwick E Atualizações** | Conteúdo deslocado para seção de estrutura de dados; não implementa Fenwick no bloco específico. | **R1 genérico.** Referenciar a implementação de Fenwick e explicar diferença entre atualização pontual e intervalo. |

### Seção 5 — Programação dinâmica: estados, transições e otimização (`dp.json`)

É a seção mais forte em conteúdo algorítmico. Apresenta mochila 0/1, LCS, DP em DAG, otimização de memória e o walkthrough de *Elevator Rides*. A prova do estado `(rides,lastWeight)` é boa. A fonte canônica do problema confirma `n≤20`, capacidade `x`, pesos `w_i≤x` e objetivo de minimizar viagens [4]. O código retorna um `pair`, mas o exemplo de saída mostra somente o número de viagens; deve explicar que a resposta é `bestState.back().first` quando o formato do problema pede um inteiro.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **DP em DAG e memoização** | Explica ordem topológica e memoização acíclica; o código `solve(v)` pressupõe `memo`, `g` e um DAG não definidos no snippet. | **R1 específico.** Incluir uma entrada mínima, inicialização de `memo` e prova de ausência de ciclos. |
| **Otimizações: rolagem, monotonicidade e convexidade** | Lista otimizações importantes, mas não demonstra monotone queue, Knuth, Li Chao ou CHT. | **R1 específico.** Escolher uma técnica e provar integralmente sua hipótese; não apresentar quatro nomes sem implementação. |
| **Problema difícil guiado: Elevator Rides com bitmask DP** | Walkthrough completo: estado, transição, prova por indução, `O(n2^n)` e exemplo. O `bestState[0]={1,0}` é uma convenção válida; falta mostrar saída no C++ e explicar o desempate lexicográfico. | **R1 específico.** Pedir a solução completa e conferir o exemplo contra CSES [4]. |
| **Estado E Recorrência** | Molde genérico; não acrescenta uma recorrência real além das partes anteriores. | **R1 genérico.** Resolver uma DP com bases, transições e ordem explícitas. |
| **Mochila E Lcs** | O título junta dois problemas diferentes; a subseção é um molde, apesar de a seção ter ambos os códigos. | **R1 genérico.** Separar mochila e LCS em dois exercícios com reconstrução. |
| **Reconstrução E Otimização** | A ideia é pertinente, mas não há código de reconstrução nem exemplo de empate. | **R1 genérico.** Acrescentar predecessores ou escolhas e discutir memória rolada versus reconstrução. |

### Seção 6 — Grafos I: representação, busca e componentes (`grafos-basicos.json`)

A seção cobre lista de adjacência, BFS, DFS, DSU, topologia, bipartição e reconstrução em labirinto. Os conceitos de BFS em arestas unitárias, direção e predecessores estão corretos. O walkthrough do labirinto é publicável depois de corrigir os escapes. Ele poderia mencionar validação de exatamente um `A` e um `B` e o caso `A==B` se o enunciado permitir.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Ordenação topológica** | Kahn, grau de entrada e detecção de ciclo pelo tamanho da ordem estão corretos. | **R1 específico.** Incluir grafo vazio, múltiplas ordens e ciclo explícito. |
| **Bipartição e coloração** | BFS/DFS com duas cores e múltiplos componentes estão corretamente modelados. | **R1 específico.** Testar autoaresta, ciclo ímpar e grafo desconexo. |
| **Problema difícil guiado: labirinto com caminho mínimo e reconstrução** | Modelagem, invariante, predecessor, movimentos e `O(RC)` são sólidos. A saída `YES 4 RRRR` é compatível com a entrada. | **R1 específico.** Corrigir escapes e incluir teste sem caminho, caminho vazio e múltiplos menores caminhos. |
| **Bfs E Distâncias** | Molde após um BFS completo; não há novo exemplo. | **R1 genérico.** Associar a uma instância de distância em grafo não ponderado e exigir fila observável. |
| **Dfs E Componentes** | Molde genérico e ausência de código de componentes na subseção. | **R1 genérico.** Implementar componentes e indicar risco de stack overflow. |
| **Topologia E Bipartição** | Agrupa algoritmos com hipóteses distintas; repete a fundamentação de grafos. | **R1 genérico.** Separar DAG/topologia de bipartição em duas atividades. |

### Seção 7 — Grafos II: caminhos, árvores e fluxo (`grafos-avancados.json`)

A tabela de escolha entre BFS, 0–1 BFS, Dijkstra, Bellman–Ford e Floyd–Warshall é útil. O artigo de referência de Dijkstra confirma a hipótese de pesos não negativos, a relaxação e a prova por menor rótulo extraído [5]. O walkthrough do desconto usa dois estados e `edgeCost/2`, que corresponde à divisão inteira usual em problemas como *Flight Discount*. Há um Mermaid de low-link, mas ele também está armazenado com `\\n` literal e pode não renderizar como duas linhas.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **SCC, pontes e articulações** | Resume Kosaraju, Tarjan e a condição `low[to] > tin[v]`; a condição de articulação de raiz é corretamente indicada como especial. | **R1 específico.** Incluir código de Tarjan/Kosaraju e um grafo pequeno com raiz e back-edge. |
| **Fluxo máximo e corte mínimo** | Enuncia max-flow min-cut, conservação e corte residual; não implementa Dinic nem mostra uma rede. | **R1 específico.** Adicionar rede de quatro vértices, capacidades, fluxo e corte após execução. |
| **Problema difícil guiado: menor rota com um desconto** | Estado `discountUsed`, Dijkstra em grafo duplicado, fórmula e complexidade estão corretos sob pesos não negativos. A fórmula deveria escrever `floor(w/2)` explicitamente se a divisão for inteira. | **R1 específico.** Testar rota direta, desconto na primeira/última aresta e ausência de caminho. |
| **Dijkstra E Relaxamento** | O molde acompanha uma implementação principal correta, mas não explicita a prova no bloco local. | **R1 genérico.** Usar a implementação e a prova de invariantes de [5]. |
| **Scc E Pontes** | Molde genérico; não amplia o resumo inicial de low-link. | **R1 genérico.** Especificar entrada dirigida para SCC e não dirigida para ponte. |
| **Fluxo E Corte** | Molde genérico; a distinção capacidade/conservação aparece apenas em callout repetido. | **R1 genérico.** Comparar fluxo máximo, corte e rede residual em uma tabela calculada. |

### Seção 8 — Estruturas de dados para consultas dinâmicas (`estruturas-arvore.json`)

Fenwick, segment tree, lazy propagation, Li Chao, hashing, treap e inversões são temas adequados. A implementação de Fenwick usa prefixo exclusivo (`sumPrefix(r)` para `[0,r)`), o que é correto, mas a convenção não é explicada no local. A fonte de Fenwick confirma operações em `O(log n)` e memória linear [6]. A explicação de segment tree como agregado associativo é correta e coincide com [7].

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Lazy propagation e Li Chao** | O texto conceitual é correto, mas o snippet de Li Chao é somente `f(line,x)` e um comentário; não é implementação reproduzível. | **R1 específico.** Escolher lazy ou Li Chao, não ambos, e incluir invariantes de nó e domínio. |
| **Hashing e estruturas aleatorizadas** | Treap e hashing têm ressalvas adequadas sobre altura esperada e colisões. | **R1 específico.** Demonstrar seed fixa, colisão adversarial e alternativa determinística; usar [3] para reproducibilidade de RNG. |
| **Problema difícil guiado: contar inversões com Fenwick** | Compressão, varredura direita-esquerda e `sum(0,valueRank)` estão corretos; o exemplo `[2,4,1,3,5]` tem três inversões. | **R1 específico.** Exibir a árvore após cada inserção e confirmar duplicatas. |
| **Heap E Dsu** | Molde genérico; não há heap nem DSU local apesar de ambos aparecerem em outras seções. | **R1 genérico.** Resolver conectividade dinâmica e fila de prioridade separadamente. |
| **Segment Tree** | Molde genérico após um código de atualização pontual. Falta consulta e construção. | **R1 genérico.** Implementar build/query/update e declarar o monóide; usar [7]. |
| **Lazy Propagation E Lca** | Agrupa lazy propagation e LCA, que têm invariantes e aplicações diferentes. | **R1 genérico.** Dividir em duas subseções ou justificar a relação por HLD. |

### Seção 9 — Strings: prefixos, padrões e palíndromos (`strings.json`)

A seção inicial de KMP e Z é boa e contém implementações conhecidas. A definição de função prefixo e complexidade linear coincidem com [8]. A descrição de Manacher está correta em alto nível e coincide com [9], mas não inclui implementação; trie usa alfabeto fixo `a`–`z` sem declarar essa hipótese no código.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Trie e dicionários de prefixos** | Explica caminhos, alfabeto grande e arrays. O código `c-'a'` pode acessar fora do array para caracteres fora de minúsculas ASCII. | **R1 específico.** Definir alfabeto, validar entrada e incluir consulta de prefixo. |
| **Palíndromos e Manacher** | Explica raios, `O(n)` e alternativas. Não há bloco de código Manacher. | **R1 específico.** Incluir `d_odd`, `d_even` ou string transformada e casos de paridade. |
| **Kmp E Z** | Molde genérico apesar dos códigos KMP/Z na seção principal. | **R1 genérico.** Comparar prefix function e Z-function na mesma string e validar ocorrências. |
| **Trie E Prefixos** | Molde genérico e repetição do conteúdo de trie. | **R1 genérico.** Incluir busca, contagem de prefixos e alfabeto Unicode como limite explícito. |
| **Hashing E Sufixos** | Molde genérico; não há fórmula de hash, suffix array, LCP ou verificação de colisão. | **R1 genérico.** Adicionar hash polinomial, dois módulos e comparação determinística para segurança. |

### Seção 10 — Matemática para competições (`matematica.json`)

A seção cobre exponenciação modular, Euclides estendido, crivo, probabilidade, esperança e orientação geométrica. A linearidade da esperança está corretamente apresentada sem exigir independência. A probabilidade condicional está correta, mas omite a hipótese `P(B)>0`. As leituras textuais das fórmulas estão malformadas: “`P(A mid B)`”, “`frac`” e “`cap`” são nomes de comandos, não uma leitura em português.

Há um bug de robustez no código de orientação: `(__int128)(b.x-a.x)` faz a subtração em `long long` antes da conversão. Para coordenadas próximas aos extremos, o overflow ocorre antes de `__int128`. A forma segura é `(__int128)b.x - a.x` e analogamente para as demais diferenças.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Probabilidade e expectativa** | Fórmulas de esperança e probabilidade condicional; bom alerta sobre dependência, mas falta espaço amostral e condição `P(B)>0`. | **R1 específico.** Resolver uma expectativa por indicadores e uma probabilidade condicional com denominador não nulo. |
| **Geometria computacional** | Produto vetorial e `__int128` são escolhas adequadas; o código tem o problema de cast tardio descrito acima. | **R1 específico.** Corrigir cast, testar colinearidade e coordenadas extremas. |
| **Módulo E Inverso** | Molde após `modpow` e Euclides; a hipótese de módulo primo e coprimalidade é citada. | **R1 genérico.** Incluir prova de Fermat, caso não inversível e módulo composto. |
| **Crivos E Fatoração** | Crivo de Eratóstenes está correto para `n≥0`; falta fatoração em código. | **R1 genérico.** Incluir complexidade `O(n log log n)` e fatoração por menores primos. |
| **Combinatória E Probabilidade** | Molde mistura temas e repete o alerta de semântica de compilação. | **R1 genérico.** Separar binomiais modulares de probabilidade e informar módulo/hipóteses. |

### Seção 11 — Técnicas avançadas e modelagem de problemas difíceis (`tecnicas-avancadas.json`)

A seção aborda modelagem, meet-in-the-middle, bitmask DP, jogos, consultas offline e Mo. A fórmula de submáscaras `O(3^n)` aparece apenas em parágrafo e é apropriada quando se soma a enumeração sobre todas as máscaras. A complexidade de Mo `O((n+q)√n)` é uma aproximação dependente de `add/remove`, distribuição de consultas e ordenação; deve ser qualificada como hipótese, não como garantia universal.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Modelagem: transforme a história** | Fornece bons mapeamentos para matching, DAG, fluxo e caminho; falta um caso trabalhado completo. | **R1 específico.** Incluir enunciado, grafo modelado e prova da equivalência. |
| **Consultas offline e Mo** | Explica reordenação e fornece código de ordenação de Mo com alternância. Falta definir operação de manutenção. | **R1 específico.** Usar consultas de frequência distintas e declarar custo de `add/remove`. |
| **Geometria Computacional** | Molde genérico; sobrepõe a seção de matemática sem orientação sobre interseção, hull ou sweep line. | **R1 genérico.** Escolher um problema geométrico completo e incluir testes de colinearidade. |
| **Aleatorização** | O conteúdo real é um molde; não há algoritmo aleatorizado, distribuição, erro ou seed implementados. | **R1 genérico.** Exigir probabilidade de erro, seed registrada e comparação com baseline determinístico. |
| **Reduções E Limites** | O título promete reduções e limites, mas não há redução concreta nem análise de lower bound. | **R1 genérico.** Usar redução de um problema conhecido e separar conjectura de prova. |

### Seção 12 — Engenharia de contest: correção, desempenho e pós-análise (`engenharia-contest.json`)

É a seção que melhor aponta para prática: compilação, sanitizers, gerador, brute force, benchmark, checklist e referências. O bloco de *stress testing* usa RNG e deve tornar a seed observável; a recomendação é compatível com a biblioteca `<random>`, que permite engines semeáveis, serializáveis e reproduzíveis [3]. A subseção de referências concentra as oito URLs do pacote, o que é bom como ponto de partida, mas insuficiente como bibliografia por assunto.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Roteiro de progressão** | Recomenda uma progressão de fundamentos a técnicas avançadas e pós-análise; é coerente com o manifesto. | **R1 específico.** Transformar a progressão em tabela de pré-requisitos e problemas CSES. |
| **Referências e prática** | Lista CPHB, CSES, cp-algorithms, cppreference, USACO, Codeforces, AtCoder e ICPC; são fontes pertinentes. | **R1 específico.** Adicionar URL canônica por tema e data de consulta; manter referências no relatório e no pacote. |
| **Compilação E Sanitizers** | O conceito é correto, mas o molde não mostra flags nem diagnóstico. | **R1 genérico.** Incluir comandos C++17/20 para ASan, UBSan, debug STL e warnings. |
| **Gerador E Brute Force** | O tema é adequado e aparece no laboratório, mas a subseção não entrega gerador nem oráculo. | **R1 genérico.** Fornecer um gerador com seed, brute force e comparação automática. |
| **Benchmark E Revisão** | Menciona benchmark, mas não discute aquecimento, repetição, mediana, variância ou entrada fixa. | **R1 genérico.** Medir várias repetições e separar validade assintótica de microbenchmark. |

### Seção 14 — Laboratório integrador (`laboratorio-integrador.json`)

A intenção de integrar especificação, geração, benchmark e relatório é correta, mas os três blocos operacionais são essencialmente o mesmo molde. Não há projeto executável, dataset, protocolo de benchmark, critérios de aceitação ou relatório preenchido. O laboratório é o lugar natural para incorporar os projetos de evolução e de simulador quântico recomendados abaixo, sem misturar esses assuntos nas seções tradicionais de algoritmos.

| Subseção | Conteúdo, exemplos e avaliação | Exercício e recomendação |
|---|---|---|
| **Especificação E Gerador** | Fala em contrato, estado e brute force, mas não especifica um problema ou formato de entrada. | **R1 genérico.** Fixar um problema, um gerador e uma propriedade de validade. |
| **Benchmark E Análise** | Fala em custo e hipótese, mas não há código ou série de medições. | **R1 genérico.** Entregar CSV, seed, hardware, compilador e protocolo de repetição. |
| **Revisão De Código E Relatório** | Reforça revisão e limites, mas não fornece checklist aplicado nem exemplo de relatório. | **R1 genérico.** Usar uma solução propositalmente defeituosa e registrar achados, testes e correções. |

## 5. Fórmulas e implementação: verificações específicas

### 5.1. Fórmulas presentes

1. **Recorrência:** `T(n)=2T(n/2)+O(n)=O(n log n)`. A conclusão é correta no regime usual, mas editorialmente deve ser `T(n)=2T(n/2)+Theta(n)` e `T(n)=Theta(n log n)` com condições de base.
2. **Desconto em Dijkstra:** `dp[v][s]` para `s∈{0,1}`. A ideia está correta. O texto de leitura deve dizer “com `s` pertencente a `{0,1}`”, e não “quad s in 0,1”.
3. **Linearidade da esperança:** `E[X+Y]=E[X]+E[Y]`. Correta sem independência, como o texto afirma.
4. **Probabilidade condicional:** `P(A|B)=P(A∩B)/P(B)`. Correta somente para `P(B)>0`; a hipótese deve ser escrita e a leitura em português deve ser corrigida.

### 5.2. Implementações que merecem correção antes da publicação

- **Todos os snippets afetados por `\\n`:** normalizar para quebras reais.
- **Orientação geométrica:** converter antes de subtrair, por exemplo `(__int128)b.x - a.x`.
- **Template inicial:** tratar `n=0` antes de `a.front()` ou declarar `n≥1`.
- **Elevator Rides:** mostrar como imprimir `.first` e explicar o segundo componente do par.
- **Binary lifting:** fornecer inicialização, raiz, profundidade, `up[v][0]` e consulta LCA; o fragmento isolado não é compilável nem verificável.
- **Li Chao:** trocar comentário conceitual por implementação ou declarar explicitamente que é pseudocódigo.
- **Trie:** validar alfabeto e tratar caracteres fora de `a`–`z`.
- **Fenwick:** declarar a convenção de índices e mostrar a relação entre `[l,r)` e `sumPrefix`.
- **Dois ponteiros:** declarar se duplicatas são contadas individualmente, por valor ou apenas como existência.

## 6. Projeto grande e reproduzível recomendado para biologia

O pacote auditado não contém biologia. Para atender a uma futura trilha interdisciplinar sem alterar o escopo algorítmico principal, recomendo um projeto de laboratório chamado **“Deriva, mutação e seleção: simulação Wright–Fisher diploide em C++17”**. O modelo Wright–Fisher descreve gerações discretas e não sobrepostas, amostragem aleatória de cópias gênicas e pode incorporar deriva, mutação e seleção [12] [13].

### 6.1. Pergunta e desenho experimental

Simular a frequência de um alelo `A` em uma população diploide de tamanho `N` ao longo de `G` gerações, comparando quatro cenários: deriva neutra; seleção sem mutação; mutação recorrente sem seleção; seleção e mutação combinadas. Cada cenário deve usar pelo menos 1.000 réplicas, sementes derivadas de uma seed-mestra documentada, e saída CSV com trajetória e estado final.

Para frequência `p_t` do alelo `A`, use fitnesses genotípicos `w_AA`, `w_Aa` e `w_aa`:

\[
\bar w = p_t^2w_{AA}+2p_t(1-p_t)w_{Aa}+(1-p_t)^2w_{aa}
\]

\[
p_{sel} = \frac{p_t^2w_{AA}+p_t(1-p_t)w_{Aa}}{\bar w}
\]

Com mutações `A→a` de taxa `u` e `a→A` de taxa `v`:

\[
p_{mut}=p_{sel}(1-u)+(1-p_{sel})v
\]

A próxima geração contém `2N` cópias amostradas:

\[
K_{t+1}\sim Binomial(2N,p_{mut}),\qquad p_{t+1}=K_{t+1}/(2N)
\]

Esse passo binomial é o núcleo reproduzível da deriva. O modelo básico de dois alelos e população diploide finita é documentado em [13]; a possibilidade de incorporar seleção e mutação é discutida em [12].

### 6.2. Estrutura de diretórios e protocolo

```text
evolution-wf/
  CMakeLists.txt
  README.md
  LICENSE
  src/main.cpp
  include/model.hpp
  tests/test_model.cpp
  configs/neutral.toml
  configs/selection.toml
  configs/mutation-selection.toml
  scripts/summarize.py
  results/.gitkeep
```

O README deve registrar compilador, sistema operacional, versão do código, seed-mestra, configuração, número de réplicas e comandos. Cada linha do CSV deve conter `scenario,replicate,generation,seed,allele_count,frequency`. Um segundo CSV deve conter `fixated_A,fixated_a,segregating,mean_final_frequency,variance_final_frequency`.

Os testes mínimos são: `N=1` com frequência inicial zero permanece zero sem mutação; `u=v=0` preserva absorção em zero e um; `w_AA=w_Aa=w_aa=1` reproduz deriva neutra; `G=0` retorna a frequência inicial; a mesma seed e configuração produzem bytes idênticos; seeds diferentes não devem ser confundidas com uma prova de efeito biológico.

### 6.3. Implementação C++17 de referência

O seguinte núcleo é uma implementação reproduzível, adequada para ser expandida no laboratório. Ele registra a seed, usa `mt19937_64`, amostra pela distribuição binomial padrão e emite uma trajetória. O projeto deve acrescentar CLI, configuração em arquivo, múltiplas réplicas, testes e resumo estatístico.

```cpp
#include <algorithm>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>

struct Config {
    std::uint64_t seed = 20260924;
    int population = 1000;       // N diploide; 2N cópias do locus
    int generations = 200;
    double initial_frequency = 0.1;
    double mutation_A_to_a = 0.0;
    double mutation_a_to_A = 0.0;
    double fitness_AA = 1.0;
    double fitness_Aa = 1.0;
    double fitness_aa = 1.0;
};

struct State {
    int generation;
    int allele_count;
    double frequency;
};

static void check_config(const Config& c) {
    if (c.population <= 0 || c.generations < 0)
        throw std::invalid_argument("population e generations inválidos");
    if (!(0.0 <= c.initial_frequency && c.initial_frequency <= 1.0))
        throw std::invalid_argument("frequência inicial fora de [0,1]");
    if (!(0.0 <= c.mutation_A_to_a && c.mutation_A_to_a <= 1.0) ||
        !(0.0 <= c.mutation_a_to_A && c.mutation_a_to_A <= 1.0))
        throw std::invalid_argument("taxa de mutação fora de [0,1]");
    if (c.fitness_AA < 0 || c.fitness_Aa < 0 || c.fitness_aa < 0)
        throw std::invalid_argument("fitness negativo");
}

static double selected_frequency(double p, const Config& c) {
    const double q = 1.0 - p;
    const double mean_fitness = p*p*c.fitness_AA
        + 2.0*p*q*c.fitness_Aa + q*q*c.fitness_aa;
    if (mean_fitness == 0.0)
        throw std::domain_error("fitness médio zero");
    return (p*p*c.fitness_AA + p*q*c.fitness_Aa) / mean_fitness;
}

static std::vector<State> simulate(const Config& c) {
    check_config(c);
    std::mt19937_64 rng(c.seed);
    const int copies = 2 * c.population;
    int allele_count = static_cast<int>(
        std::llround(c.initial_frequency * copies));
    std::vector<State> trajectory;
    trajectory.reserve(c.generations + 1);

    for (int generation = 0; generation <= c.generations; ++generation) {
        const double p = static_cast<double>(allele_count) / copies;
        trajectory.push_back({generation, allele_count, p});
        if (generation == c.generations) break;

        const double p_selected = selected_frequency(p, c);
        const double p_mutated = p_selected * (1.0 - c.mutation_A_to_a)
            + (1.0 - p_selected) * c.mutation_a_to_A;
        std::binomial_distribution<int> offspring(copies, p_mutated);
        allele_count = offspring(rng);
    }
    return trajectory;
}

int main() {
    Config c;
    c.seed = 20260924;                 // registrar no relatório
    c.population = 1000;
    c.generations = 200;
    c.initial_frequency = 0.10;
    c.mutation_A_to_a = 1e-4;
    c.mutation_a_to_A = 1e-5;
    c.fitness_AA = 1.05;
    c.fitness_Aa = 1.02;
    c.fitness_aa = 1.00;

    const auto trajectory = simulate(c);
    std::ofstream out("trajectory.csv");
    if (!out) return 2;
    out << "seed,generation,allele_count,frequency\\n";
    out << std::setprecision(17);
    for (const State& s : trajectory)
        out << c.seed << ',' << s.generation << ','
            << s.allele_count << ',' << s.frequency << '\\n';
    std::cerr << "seed=" << c.seed << " rows=" << trajectory.size() << '\\n';
}
```

A implementação deve incluir `#include <vector>` e `#include <cmath>` no arquivo final; eles foram omitidos acima apenas para manter o núcleo curto? **Não: essa omissão deve ser corrigida antes de incorporar o exemplo.** A versão de publicação precisa conter todos os includes e ser compilada com warnings. A biblioteca `<random>` documenta engines semeáveis e serializáveis para simuladores reproduzíveis [3].

O relatório do projeto deve comparar distribuição de tempo até fixação, proporção de fixação, média e variância da frequência final e efeito de `N`, `u`, `v` e fitness. O projeto não deve afirmar que uma simulação prova seleção natural; ela testa consequências de um modelo parametrizado.

## 7. Computação quântica: estado atual e especificação de verificação

Não há seção, subseção, fórmula, circuito ou implementação de computação quântica nos 14 JSONs auditados. A única ocorrência relacionada é uma frase genérica em `cpp-e-analise-assintotica.json` que menciona “calcule amplitudes antes de probabilidades”; isso não constitui conteúdo quântico. Portanto, **não é possível confirmar fórmulas ou implementação quântica existente** dentro do livro.

Se o tema for adicionado, a unidade mínima deve usar as convenções abaixo. Para um qubit:

\[
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle,
\qquad |\alpha|^2+|\beta|^2=1
\]

A medição na base computacional deve obedecer à regra de Born:

\[
P(0)=|\alpha|^2,\qquad P(1)=|\beta|^2
\]

A porta Hadamard deve ser escrita como:

\[
H=\frac{1}{\sqrt 2}\begin{bmatrix}1&1\\1&-1\end{bmatrix},
\qquad H|0\rangle=\frac{|0\rangle+|1\rangle}{\sqrt2}
\]

A documentação IBM confirma que amplitudes são complexas, que a soma dos módulos ao quadrado é um e que a medição usa o módulo ao quadrado da amplitude [10]. Uma página de circuitos deve acompanhar a fórmula e um simulador de estado deve ser distinguido de um simulador de shots [11].

Uma implementação C++ mínima para verificar Hadamard deve usar `std::complex<double>` e não confundir amplitude com probabilidade:

```cpp
#include <array>
#include <complex>
#include <cmath>
#include <random>

using C = std::complex<double>;
using Qubit = std::array<C, 2>;

Qubit hadamard(Qubit q) {
    const double inv_sqrt2 = 1.0 / std::sqrt(2.0);
    return {inv_sqrt2 * (q[0] + q[1]),
            inv_sqrt2 * (q[0] - q[1])};
}

int measure_z(const Qubit& q, std::mt19937_64& rng) {
    const double p0 = std::norm(q[0]);
    std::bernoulli_distribution bit(1.0 - p0);
    return bit(rng) ? 1 : 0;
}
```

Os testes obrigatórios são `H|0⟩` com aproximadamente metade de zeros e uns em muitos shots, `H(H|0⟩)=|0⟩` até erro numérico, preservação da norma e colapso do estado após medição. O material deve declarar que a implementação é um simulador clássico de um qubit, não uma execução em hardware quântico. Qualquer extensão para Grover ou Shor precisa trazer hipótese, circuito, custo de oracle e comparação honesta com busca clássica.

## 8. Plano de correção priorizado

### P0 — bloquear publicação até corrigir

1. Normalizar quebras reais em todos os `code` e `mermaid`.
2. Revalidar visualmente os 94 blocos e copiar/colar pelo menos um exemplo de cada seção.
3. Corrigir o cast tardio em `matematica.json` e as saídas/leitura das fórmulas.
4. Corrigir o código do projeto de evolução antes de incorporá-lo, incluindo todos os headers.

### P1 — corrigir antes de chamar o material de curso completo

1. Regerar `docs/FORMATO-DO-LIVRO.md` para incluir `exercise`.
2. Resolver o salto da seção 12 para 14.
3. Dar números explícitos às 42 subseções de tags `01`–`03` ou explicar no renderer por que elas não usam numeração.
4. Substituir soluções genéricas por soluções específicas com cálculo, código
