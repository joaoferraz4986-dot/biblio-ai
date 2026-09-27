## content/packages/combinatoria-computacao/sections/funcoes-geradoras.json · funcoes-geradoras.blocks[1].blocks[6]

- TeX: `(A B)_n = [x^n]A(x)B(x)=\sum_{i=0}^{n}a_i b_{n-i}`
- Leitura: Lê-se: o coeficiente de grau n do produto A(x)B(x) é a soma, para i de 0 a n, de a_i vezes b_{n-i}.
- Legenda: coeficiente de produto

## content/packages/combinatoria-computacao/sections/funcoes-geradoras.json · funcoes-geradoras.blocks[2].blocks[9]

- TeX: `C_n=\frac{1}{n+1}\binom{2n}{n}`
- Leitura: Lê-se: C_n é 1 dividido por n mais 1, vezes o coeficiente binomial de 2n escolhe n; é a fórmula fechada dos números de Catalan.
- Legenda: fórmula fechada de Catalan

## content/packages/combinatoria-computacao/sections/fundamentos.json · fundamentos.blocks[2].blocks[11]

- TeX: `\lvert A \times B\rvert = \lvert A\rvert\,\lvert B\rvert`
- Leitura: Lê-se: a cardinalidade de A cartesiano B é a cardinalidade de A multiplicada pela cardinalidade de B.
- Legenda: cardinalidade do produto cartesiano

## content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json · permutacoes-combinacoes.blocks[1].blocks[8]

- TeX: `n! = \prod_{i=1}^{n} i`
- Leitura: Lê-se: n fatorial é o produto dos inteiros i, para i de 1 até n; isto é, 1 vezes 2 até n.
- Legenda: n objetos distintos em ordem

## content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json · permutacoes-combinacoes.blocks[2].blocks[7]

- TeX: `\binom{n}{k}=\frac{n!}{k!(n-k)!}`
- Leitura: Lê-se: n escolhe k é n fatorial dividido por k fatorial vezes n menos k fatorial, para 0 menor ou igual a k menor ou igual a n.
- Legenda: coeficiente binomial

## content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json · permutacoes-combinacoes.blocks[3].blocks[7]

- TeX: `\#\{(x_1,\ldots,x_k)\in\mathbb{Z}_{\ge0}^k: \sum x_i=n\}=\binom{n+k-1}{k-1}`
- Leitura: Lê-se: o número de k-tuplas de inteiros não negativos cuja soma é n é n mais k menos 1 escolhe k menos 1.
- Legenda: estrelas e barras

## content/packages/combinatoria-computacao/sections/permutacoes-combinacoes.json · permutacoes-combinacoes.blocks[4].blocks[11]

- TeX: `n! - 2(n-1)!`
- Leitura: Lê-se: n fatorial menos duas vezes n menos 1 fatorial; conta as permutações em que dois objetos especificados não ficam adjacentes.
- Legenda: ordenações válidas com X e Y não adjacentes

## content/packages/combinatoria-computacao/sections/probabilidade.json · probabilidade.blocks[2].blocks[10]

- TeX: `\mathbb{E}[X]=\binom{m}{2}\frac{1}{b}`
- Leitura: Lê-se: a esperança de X é m escolhe 2, multiplicado por 1 dividido por b; X conta colisões esperadas sob o modelo uniforme assumido.
- Legenda: colisões esperadas

## content/packages/combinatoria-computacao/sections/provas-recorrencias.json · provas-recorrencias.blocks[2].blocks[7]

- TeX: `\sum_{k=0}^{n}\binom{n}{k}=2^n`
- Leitura: Lê-se: a soma de n escolhe k, para k de 0 a n, é 2 elevado a n; ambos os lados contam os subconjuntos de um conjunto com n elementos.
- Legenda: dupla contagem de subconjuntos

## content/packages/combinatoria-computacao/sections/topicos-avancados.json · topicos-avancados.blocks[2].blocks[6]

- TeX: `\#(X/G)=\frac{1}{\lvert G\rvert}\sum_{g\in G}\lvert Fix(g)\rvert`
- Leitura: Lê-se: o número de órbitas de X pela ação de G é 1 dividido pela ordem de G, vezes a soma, para g em G, do número de pontos fixos de g.
- Legenda: lema de Burnside

## content/packages/computacao-quantica/sections/algoritmos-quanticos.json · algoritmos-quanticos.blocks[1]

- TeX: `O(\sqrt{N})`
- Leitura: Lê-se: ordem de raiz quadrada de N; é o número assintótico de consultas de Grover em busca não estruturada.
- Legenda: Ordem de consultas de Grover para busca em espaço não estruturado.

## content/packages/computacao-quantica/sections/algoritmos-quanticos.json · algoritmos-quanticos.blocks[3].blocks[4]

- TeX: `(-1)^{f(x)}|x\rangle| - \rangle = (-1)^{f(x)}|x\rangle| - \rangle`
- Leitura: Lê-se: o oráculo, aplicado a x tensor o estado menos, introduz a fase menos 1 elevada a f(x) no estado x; a igualdade escrita é a ação de fase global do oráculo.
- Legenda: 

## content/packages/computacao-quantica/sections/algoritmos-quanticos.json · algoritmos-quanticos.blocks[4].blocks[4]

- TeX: `k \approx \frac{\pi}{4}\sqrt{N/M}`
- Leitura: Lê-se: o número recomendado de iterações é aproximadamente pi dividido por 4, vezes a raiz de N dividido por M, quando M itens são soluções.
- Legenda: 

## content/packages/computacao-quantica/sections/complexidade-e-pratica.json · complexidade-e-pratica.blocks[3].blocks[4]

- TeX: `\Pr[\text{aceitar}]\ge 2/3 \quad \text{ou} \quad \Pr[\text{aceitar}]\le 1/3`
- Leitura: Lê-se: a probabilidade de aceitar é pelo menos dois terços no caso positivo, ou no máximo um terço no caso negativo; a separação define uma margem de decisão.
- Legenda: 

## content/packages/computacao-quantica/sections/complexidade-e-pratica.json · complexidade-e-pratica.blocks[4].blocks[4]

- TeX: `\text{memória} \approx 2^n \times \text{bytes por amplitude}`
- Leitura: Lê-se: a memória de uma simulação vetorial cresce aproximadamente como 2 elevado a n vezes o número de bytes por amplitude.
- Legenda: 

## content/packages/computacao-quantica/sections/complexidade-e-pratica.json · complexidade-e-pratica.blocks[5].blocks[4]

- TeX: `\text{custo total}=\text{execuções}\times(\text{profundidade}+\text{leitura})`
- Leitura: Lê-se: o custo total aproximado é o número de execuções vezes a soma da profundidade do circuito com o custo de leitura.
- Legenda: 

## content/packages/computacao-quantica/sections/emaranhamento-e-informacao.json · emaranhamento-e-informacao.blocks[1]

- TeX: `|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}`
- Leitura: Lê-se: o estado de Bell Phi mais é a soma dos estados 00 e 11, dividida pela raiz quadrada de 2.
- Legenda: Um estado de Bell.

## content/packages/computacao-quantica/sections/emaranhamento-e-informacao.json · emaranhamento-e-informacao.blocks[4].blocks[4]

- TeX: `|00\rangle = |0\rangle \otimes |0\rangle`
- Leitura: Lê-se: o estado de dois qubits 00 é o produto tensorial do estado 0 do primeiro qubit com o estado 0 do segundo.
- Legenda: 

## content/packages/computacao-quantica/sections/emaranhamento-e-informacao.json · emaranhamento-e-informacao.blocks[5].blocks[4]

- TeX: `|\Phi^+\rangle = (|00\rangle+|11\rangle)/\sqrt{2}`
- Leitura: Lê-se: o estado de Bell Phi mais é a soma dos estados 00 e 11, dividida pela raiz de 2.
- Legenda: 

## content/packages/computacao-quantica/sections/emaranhamento-e-informacao.json · emaranhamento-e-informacao.blocks[6].blocks[4]

- TeX: `|\psi\rangle|\Phi^+\rangle = \frac{1}{2}\sum_{m,n}|mn\rangle X^n Z^m|\psi\rangle`
- Leitura: Lê-se: o estado inicial do teletransporte se decompõe em quatro resultados mn, cada um acompanhado pela correção X elevado a n e Z elevado a m aplicada a psi, com fator 1 sobre 2.
- Legenda: 

## content/packages/computacao-quantica/sections/estados-mistos-e-canais.json · estados-mistos-e-canais.blocks[1].blocks[4]

- TeX: `\langle O\rangle = \operatorname{Tr}(\rho O)`
- Leitura: Lê-se: o valor esperado do observável O é o traço do produto da matriz densidade rho pelo observável O.
- Legenda: 

## content/packages/computacao-quantica/sections/estados-mistos-e-canais.json · estados-mistos-e-canais.blocks[2].blocks[4]

- TeX: `\mathcal{E}(\rho)=\sum_k E_k\rho E_k^\dagger,\quad \sum_k E_k^\dagger E_k=I`
- Leitura: Lê-se: o canal E transforma rho na soma de E_k rho E_k adjunto; a soma dos operadores E_k adjunto E_k deve ser a identidade para preservar o traço.
- Legenda: 

## content/packages/computacao-quantica/sections/estados-mistos-e-canais.json · estados-mistos-e-canais.blocks[3].blocks[4]

- TeX: `\rho(t)=\begin{pmatrix}\rho_{00}(t)&\gamma(t)\rho_{01}(0)\\\overline{\gamma(t)}\rho_{10}(0)&\rho_{11}(t)\end{pmatrix}`
- Leitura: Lê-se: rho em t é uma matriz cuja coerência 01 decai por gamma em t e cuja coerência 10 decai pelo conjugado de gamma; as populações ocupam a diagonal.
- Legenda: 

## content/packages/computacao-quantica/sections/portas-e-circuitos.json · portas-e-circuitos.blocks[1]

- TeX: `H=\frac{1}{\sqrt{2}}\begin{pmatrix}1&1\\1&-1\end{pmatrix}`
- Leitura: Lê-se: a porta de Hadamard H é 1 sobre a raiz de 2 vezes a matriz com linhas 1, 1 e 1, menos 1.
- Legenda: A porta de Hadamard.

## content/packages/computacao-quantica/sections/portas-e-circuitos.json · portas-e-circuitos.blocks[2].solutionBlocks[0]

- TeX: `H|0\rangle = (|0\rangle+|1\rangle)/\sqrt{2},\qquad H^2|0\rangle=|0\rangle`
- Leitura: Lê-se: Hadamard aplicado a 0 produz a superposição uniforme de 0 e 1; aplicar H duas vezes devolve 0.
- Legenda: A porta é autoinversa.

## content/packages/computacao-quantica/sections/portas-e-circuitos.json · portas-e-circuitos.blocks[3].blocks[4]

- TeX: `U = \prod_{j=1}^{L} G_j`
- Leitura: Lê-se: U é o produto ordenado das portas G_j, de j igual a 1 até L; a ordem deve ser declarada pela convenção do circuito.
- Legenda: 

## content/packages/computacao-quantica/sections/portas-e-circuitos.json · portas-e-circuitos.blocks[4].blocks[4]

- TeX: `\operatorname{CNOT}|a,b\rangle = |a,b\oplus a\rangle`
- Leitura: Lê-se: CNOT preserva o bit de controle a e substitui o alvo b por b ou exclusivo a.
- Legenda: 

## content/packages/computacao-quantica/sections/portas-e-circuitos.json · portas-e-circuitos.blocks[5].blocks[4]

- TeX: `D = \max_{q} \text{número de camadas no caminho de }q`
- Leitura: Lê-se: D é a profundidade máxima, obtida pelo maior número de camadas no caminho de qualquer qubit q.
- Legenda: 

## content/packages/computacao-quantica/sections/pre-requisitos-e-historia.json · pre-requisitos-e-historia.blocks[3].blocks[4]

- TeX: `\langle u,v\rangle = \sum_i \overline{u_i}v_i`
- Leitura: Lê-se: o produto interno de u e v é a soma, em i, do conjugado de u_i vezes v_i.
- Legenda: 

## content/packages/computacao-quantica/sections/pre-requisitos-e-historia.json · pre-requisitos-e-historia.blocks[4].blocks[4]

- TeX: `|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,\quad |\alpha|^2+|\beta|^2=1`
- Leitura: Lê-se: psi é alfa vezes 0 mais beta vezes 1; os módulos ao quadrado de alfa e beta somam 1.
- Legenda: 

## content/packages/computacao-quantica/sections/pre-requisitos-e-historia.json · pre-requisitos-e-historia.blocks[5].blocks[4]

- TeX: `T(n) = O(\text{portas}) + O(\text{consultas})`
- Leitura: Lê-se: o custo T de n é limitado assintoticamente pela soma do custo das portas com o custo das consultas.
- Legenda: 

## content/packages/computacao-quantica/sections/qft-e-estimativa-fase.json · qft-e-estimativa-fase.blocks[1].blocks[4]

- TeX: `\operatorname{QFT}_N|x\rangle=\frac{1}{\sqrt{N}}\sum_{y=0}^{N-1}e^{2\pi ixy/N}|y\rangle`
- Leitura: Lê-se: a QFT de dimensão N aplicada a x produz 1 sobre a raiz de N vezes a soma, para y de 0 a N menos 1, de e elevado a 2 pi i x y sobre N vezes y.
- Legenda: 

## content/packages/computacao-quantica/sections/qft-e-estimativa-fase.json · qft-e-estimativa-fase.blocks[2].blocks[4]

- TeX: `U|\psi\rangle=e^{2\pi i\theta}|\psi\rangle`
- Leitura: Lê-se: psi é autovetor de U com autovalor e elevado a 2 pi i theta; a estimativa de fase procura theta.
- Legenda: 

## content/packages/computacao-quantica/sections/qft-e-estimativa-fase.json · qft-e-estimativa-fase.blocks[3].blocks[4]

- TeX: `f(a)=a^x \bmod N`
- Leitura: Lê-se: f de a é a potência a elevado a x reduzida módulo N.
- Legenda: 

## content/packages/computacao-quantica/sections/qubits-e-medicao.json · qubits-e-medicao.blocks[1]

- TeX: `|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,\qquad |\alpha|^2 + |\beta|^2 = 1`
- Leitura: Lê-se: psi é alfa vezes 0 mais beta vezes 1; a soma dos módulos ao quadrado das amplitudes alfa e beta é 1.
- Legenda: Estado de um qubit e condição de normalização.

## content/packages/computacao-quantica/sections/qubits-e-medicao.json · qubits-e-medicao.blocks[3].solutionBlocks[0]

- TeX: `P(0)=|1/\sqrt{2}|^2=1/2,\qquad P(1)=|1/\sqrt{2}|^2=1/2`
- Leitura: Lê-se: a probabilidade de 0 e a probabilidade de 1 são o módulo ao quadrado de 1 sobre a raiz de 2, ambas iguais a 1 sobre 2.
- Legenda: As probabilidades somam 1.

## content/packages/computacao-quantica/sections/qubits-e-medicao.json · qubits-e-medicao.blocks[4].blocks[4]

- TeX: `H|0\rangle = (|0\rangle+|1\rangle)/\sqrt{2}`
- Leitura: Lê-se: H aplicado ao estado 0 produz a superposição de 0 e 1 com amplitudes iguais, cada uma igual a 1 sobre a raiz de 2.
- Legenda: 

## content/packages/computacao-quantica/sections/qubits-e-medicao.json · qubits-e-medicao.blocks[5].blocks[4]

- TeX: `p(x)=|\langle x|\psi\rangle|^2`
- Leitura: Lê-se: a probabilidade de medir x é o módulo ao quadrado da amplitude de projeção de psi sobre x.
- Legenda: 

## content/packages/computacao-quantica/sections/qubits-e-medicao.json · qubits-e-medicao.blocks[6].blocks[4]

- TeX: `\rho_A = \operatorname{Tr}_B(\rho_{AB})`
- Leitura: Lê-se: a matriz densidade do subsistema A é o traço parcial, sobre B, da matriz densidade conjunta AB.
- Legenda: 

## content/packages/computacao-quantica/sections/ruido-e-correcao.json · ruido-e-correcao.blocks[3].blocks[4]

- TeX: `\mathcal{E}(\rho)=(1-p)\rho+pX\rho X`
- Leitura: Lê-se: o canal bit-flip deixa rho inalterado com probabilidade 1 menos p e aplica X rho X com probabilidade p.
- Legenda: 

## content/packages/computacao-quantica/sections/ruido-e-correcao.json · ruido-e-correcao.blocks[4].blocks[4]

- TeX: `s = Hx^T \bmod 2`
- Leitura: Lê-se: a síndrome s é H vezes a transposta de x, calculada módulo 2.
- Legenda: 

## content/packages/computacao-quantica/sections/ruido-e-correcao.json · ruido-e-correcao.blocks[5].blocks[4]

- TeX: `S_i|\psi_L\rangle=|\psi_L\rangle`
- Leitura: Lê-se: o estabilizador S_i deixa o estado lógico codificado psi_L invariável.
- Legenda: 

## content/packages/computacao-quantica/sections/sistemas-multipartidos.json · sistemas-multipartidos.blocks[1].blocks[4]

- TeX: `|00\rangle = |0\rangle \otimes |0\rangle`
- Leitura: Lê-se: o estado de dois qubits 00 é o produto tensorial do estado 0 do primeiro qubit com o estado 0 do segundo.
- Legenda: 

## content/packages/computacao-quantica/sections/sistemas-multipartidos.json · sistemas-multipartidos.blocks[2].blocks[4]

- TeX: `|\Phi^+\rangle = (|00\rangle+|11\rangle)/\sqrt{2}`
- Leitura: Lê-se: o estado de Bell Phi mais é a soma dos estados 00 e 11, dividida pela raiz de 2.
- Legenda: 

## content/packages/computacao-quantica/sections/sistemas-multipartidos.json · sistemas-multipartidos.blocks[3].blocks[4]

- TeX: `|\psi\rangle|\Phi^+\rangle = \frac{1}{2}\sum_{m,n}|mn\rangle X^n Z^m|\psi\rangle`
- Leitura: Lê-se: o estado inicial do teletransporte se decompõe em quatro resultados mn, cada um acompanhado pela correção X elevado a n e Z elevado a m aplicada a psi, com fator 1 sobre 2.
- Legenda: 

## content/packages/computacao-quantica/sections/tolerancia-a-falhas.json · tolerancia-a-falhas.blocks[1].blocks[4]

- TeX: `\operatorname{CNOT}(X\otimes I)=(X\otimes X)\operatorname{CNOT}`
- Leitura: Lê-se: conjugando X no qubit de controle por CNOT, obtém-se X no controle e X no alvo.
- Legenda: 

## content/packages/computacao-quantica/sections/tolerancia-a-falhas.json · tolerancia-a-falhas.blocks[2].blocks[4]

- TeX: `U_L\,\mathcal{C} \subseteq \mathcal{C}`
- Leitura: Lê-se: a operação lógica U_L leva o espaço de código C em um subconjunto de C, preservando o subespaço codificado.
- Legenda: 

## content/packages/computacao-quantica/sections/tolerancia-a-falhas.json · tolerancia-a-falhas.blocks[3].blocks[4]

- TeX: `\langle O\rangle_{mitigated} \approx \lim_{\lambda\to0} \langle O\rangle_{\lambda}`
- Leitura: Lê-se: o valor esperado mitigado é aproximado pelo limite do valor esperado quando a intensidade de ruído lambda tende a zero.
- Legenda: 

## content/packages/programacao-competitiva-cpp/sections/cpp-e-analise-assintotica.json · cpp-e-analise-assintotica.blocks[10]

- TeX: `T(n)=2T(n/2)+O(n)=O(n\log n)`
- Leitura: Lê-se: T de n é duas vezes T de n sobre 2 mais ordem de n, resultando em ordem de n vezes logaritmo de n pelo teorema mestre.
- Legenda: Exemplo de recorrência

## content/packages/programacao-competitiva-cpp/sections/grafos-avancados.json · grafos-avancados.blocks[17].blocks[9]

- TeX: `dp[v][s] = menor custo para chegar a v usando s descontos,\quad s\in\{0,1\}`
- Leitura: Lê-se: dp de v e s é o menor custo para chegar ao vértice v usando s descontos, com s igual a 0 ou 1.
- Legenda: 

## content/packages/programacao-competitiva-cpp/sections/matematica.json · matematica.blocks[8].blocks[3]

- TeX: `E[X+Y]=E[X]+E[Y]`
- Leitura: Lê-se: a esperança da soma X mais Y é a esperança de X mais a esperança de Y, sem exigir independência.
- Legenda: Linearidade da esperança

## content/packages/programacao-competitiva-cpp/sections/matematica.json · matematica.blocks[8].blocks[4]

- TeX: `P(A\mid B)=\frac{P(A\cap B)}{P(B)}`
- Leitura: Lê-se: a probabilidade de A condicionado a B é a probabilidade da interseção A com B dividida pela probabilidade de B, com P(B) positiva.
- Legenda: Probabilidade condicional

## content/packages/reinos-microscopicos/sections/celula-e-metabolismo.json · celula-e-metabolismo.blocks[1]

- TeX: `\Delta G = \Delta H - T\Delta S`
- Leitura: Lê-se: a variação de energia livre de Gibbs é a variação de entalpia menos a temperatura vezes a variação de entropia.
- Legenda: Critério termodinâmico para a espontaneidade em temperatura e pressão constantes.

## content/packages/reinos-microscopicos/sections/neuronios-e-biocomputacao.json · neuronios-e-biocomputacao.blocks[2]

- TeX: `C_m\frac{dV}{dt} = -I_{ion}(V,t) + I_{ext}(t)`
- Leitura: Lê-se: a capacitância de membrana C_m vezes a derivada do potencial V é a corrente externa menos a corrente iônica.
- Legenda: Modelo de membrana: a capacitância integra correntes iônicas e externas.

## content/packages/sistemas-embarcados-arduino/sections/eletricidade-e-sinais.json · eletricidade-e-sinais.blocks[1]

- TeX: `V = R I`
- Leitura: Lê-se: a tensão V é a resistência R multiplicada pela corrente I, com unidades coerentes.
- Legenda: Lei de Ohm; use unidades coerentes e confirme a potência dissipada.

## content/packages/sistemas-embarcados-arduino/sections/eletricidade-e-sinais.json · eletricidade-e-sinais.blocks[2]

- TeX: `P = V I = I^2 R = \frac{V^2}{R}`
- Leitura: Lê-se: a potência P é tensão vezes corrente, ou corrente ao quadrado vezes resistência, ou tensão ao quadrado dividida pela resistência.
- Legenda: Potência elétrica e aquecimento.

## content/packages/sistemas-embarcados-arduino/sections/interrupcoes-memoria.json · interrupcoes-memoria.blocks[2]

- TeX: `T_{resposta} = T_{latencia} + T_{ISR} + T_{processamento}`
- Leitura: Lê-se: o tempo de resposta é a soma da latência, do tempo gasto na rotina de serviço de interrupção e do processamento restante.
- Legenda: Orçamento de resposta; cada parcela deve ser medida ou limitada.
