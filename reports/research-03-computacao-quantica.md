# Auditoria do livro **Computação Quântica: conceitos, algoritmos e limites**

**Data da auditoria:** 2026-09-24  
**Escopo:** exclusivamente o pacote `/home/ubuntu/biblio-ai/content/packages/computacao-quantica/`, além dos documentos de formato e arquitetura solicitados. Nenhum arquivo do livro foi editado.

## 1. Conclusão executiva

O pacote está **estruturalmente válido**, mas ainda não está pronto como livro técnico completo. O validador oficial do repositório (`npm run validate`) terminou com **0 erros e 0 avisos**, e uma verificação independente encontrou 12 seções, 34 subseções, IDs únicos e campos obrigatórios presentes. A ordem dos arquivos no manifesto, porém, não corresponde à numeração declarada: aparecem as sequências 1, 2, 4, 3, 4, 6, 5, 10, 6, 13, 7 e 8. Essa inconsistência é confirmada pelo conteúdo e deve ser corrigida antes da publicação.

O problema principal é editorial e pedagógico, não de JSON. O livro contém definições corretas e muitas fórmulas fundamentais, mas 33 das 34 subseções usam praticamente o mesmo molde: dois parágrafos de instrução metaeditorial, o callout “Critério acadêmico”, um “Aprofundamento formal”, uma “Ideia central”, o código textual `prepare_state() / apply_unitary() / measure_in_basis() / compare predicted_distribution with samples` e um exercício genérico com solução que descreve como responder, em vez de resolver o problema. Isso reduz substancialmente a especificidade de cada capítulo.

Há somente dois blocos visuais de conteúdo: a esfera de Bloch em SVG e um fluxo Mermaid no laboratório. Não há diagramas de circuito para H, CNOT, Bell, teletransporte, QFT, estimativa de fase ou correção de erros. O único código de experimento específico é um esqueleto Python não executável, pois chama `analytic_distribution`, `statevector_distribution`, `sample_with_noise` e `total_variation` sem defini-las. Assim, a afirmação de que o livro conecta teoria a implementação reproduzível ainda não é demonstrada.

As fórmulas centrais foram conferidas. A maior parte está correta sob convenções explícitas. Os pontos que exigem correção ou qualificação são: a fórmula de Shor usa variáveis ambíguas (`f(a)=a^x mod N`); a fórmula de mitigação de erro apresenta uma extrapolação como se fosse um limite universal; a expressão de decoerência descreve apenas um modelo de desfasamento, embora o texto também mencione amplitude damping e depolarização; e as fórmulas de síndrome, estabilizador e teletransporte precisam declarar o código, a convenção de bits e a associação dos resultados de medição às correções.

Não há conteúdo de biologia no pacote quântico. Por isso não há seção biológica a auditar. Para não omitir o requisito solicitado, este relatório inclui ao final a especificação de um projeto grande, reproduzível e em C++ para simulação de evolução. Recomenda-se mantê-lo fora deste livro, porque sua inclusão quebraria o escopo declarado de computação quântica.

## 2. Evidências de formato, estrutura e proveniência

O `manifest.json` declara o esquema `books.package.v2`, o pacote `computacao-quantica`, idioma `pt-BR` e 12 caminhos de seção. O `header.json` declara `books.header.v2`, capa SVG, texto-guia e rodapé. Todos os caminhos do manifesto existem. Os 12 JSONs declaram `books.section.v2` e `book-section`.

De acordo com `docs/FORMATO-DO-LIVRO.md`, IDs de seções e subseções devem ser únicos e conter apenas letras minúsculas, números e hífen. Essa regra é satisfeita: a checagem encontrou 89 IDs sem duplicidade e sem caracteres inválidos. O comando oficial também validou todos os livros do repositório, inclusive este pacote, sem erros ou avisos.

O pacote usa os tipos de bloco previstos pelo formato: `paragraph`, `math`, `history`, `exercise`, `subsection`, `callout`, `code`, `list`, `svg`, `mermaid`, `table` e `steps`. Não foram encontrados blocos de tipo desconhecido. A capa SVG existe, e as duas imagens históricas referenciadas existem localmente. O registro `image-rights.json` preserva a origem declarada, mas a licença das imagens de Alan Turing e John Bell está descrita como “educational reference, verify reuse terms”; isso não é confirmação de autorização de reutilização.

A arquitetura documentada em `docs/ARQUITETURA.md` está alinhada com o uso de blocos tipados, fórmulas KaTeX e diagramas locais. O SVG de Bloch e o Mermaid do laboratório renderizaram corretamente em verificação separada. Isso comprova a sintaxe desses dois artefatos, mas não comprova a qualidade didática do desenho da esfera de Bloch: ela não rotula os eixos `x`, `y`, `z`, os polos `|0⟩` e `|1⟩`, nem informa as coordenadas do ponto mostrado.

## 3. Avaliação seção por seção

### Seção 1 — Pré-requisitos e panorama histórico

**Conteúdo e nomes.** O título é adequado e introduz álgebra linear, probabilidade, informação quântica e física. A presença de Alan Turing funciona como contexto de computabilidade, mas não substitui uma linha histórica própria de Feynman, Deutsch e Shor. As três subseções — “Vetores Complexos E Produto Interno”, “Postulados E Notação De Dirac” e “Complexidade E Modelo De Circuito” — têm nomes informativos, porém usam capitalização de título em inglês aplicada ao português. Recomenda-se “Vetores complexos e produto interno”, por exemplo.

**Exemplos, fórmulas e exercícios.** O produto interno `⟨u,v⟩ = Σ_i overline(u_i)v_i` está correto. O estado de qubit `|ψ⟩ = α|0⟩ + β|1⟩`, com `|α|²+|β|²=1`, também está correto. O exercício inicial explica adequadamente que qubit não é um bit aleatório clássico. Os exercícios das subseções, porém, são genéricos e não fornecem números concretos para cálculo.

**Achado confirmado.** A seção estabelece pré-requisitos, mas não os ensina de modo graduado: quase toda subseção pede que o leitor “declare” hipóteses e “represente” um exemplo, sem fornecer o exemplo resolvido. O texto sobre medição fala em estado pós-medição, mas não apresenta projetores ou operadores de medida em um caso calculado.

**Recomendação.** Incluir um exemplo numérico completo com `u=(1,i)/√2`, `v=(1,-i)/√2`, uma matriz de medição projetiva e um circuito de dois ou três gates. Definir também BPP e BQP formalmente mais adiante, para evitar que a seção de pré-requisitos mencione complexidade sem preparar a notação.

### Seção 2 — Qubits, estados e medição

**Conteúdo.** O texto define qubit como vetor unitário em espaço complexo de dimensão dois e explica amplitudes, fase relativa e regra de Born. A distinção entre fase global e relativa está correta. A subseção “Matriz densidade e traço parcial” faz uma boa ponte para estados mistos.

**Fórmulas.** A normalização do qubit, `p(x)=|⟨x|ψ⟩|²` e `ρ_A=Tr_B(ρ_AB)` estão corretas. A afirmação `Tr(ρ²)=1` para estado puro e `<1` para mistura genuína é correta em dimensão finita, desde que “mistura genuína” signifique estado não puro. O exercício de `(|0⟩+|1⟩)/√2` está correto.

**Diagrama.** O SVG da esfera de Bloch é tecnicamente válido como ilustração esquemática, mas os eixos e os estados polares não estão identificados. O caption corretamente limita a figura a estados puros.

**Achado confirmado.** A seção tem um dos poucos exemplos efetivamente resolvidos, mas continua sem um circuito que mostre H–H ou uma medição em base X. Os demais exercícios repetem a fórmula genérica e as soluções são instruções de procedimento, não respostas.

**Recomendação.** Acrescentar o circuito `|0⟩ — H — H — medida`, a esfera de Bloch rotulada e um exemplo de medição em base X. Explicitar que estados físicos são raios, portanto a fase global é irrelevante, em vez de apenas dizer que ela “não altera observáveis”.

### Seção 3 — Portas, circuitos e universalidade

**Conteúdo.** H, X, CNOT, universalidade, descomputação, profundidade e compilação são temas adequados. A seção conecta álgebra linear a circuitos, e a definição de profundidade é compatível com a documentação da IBM, que a descreve como o número mínimo de camadas paralelizáveis [1].

**Fórmulas.** A matriz de Hadamard está correta e o exercício `H²|0⟩=|0⟩` está resolvido corretamente. A ação `CNOT|a,b⟩=|a,b⊕a⟩` também está correta. `U=∏_{j=1}^L G_j` precisa de uma convenção para a ordem do produto, porque a ordem textual do circuito e a multiplicação matricial usual são inversas.

**Implementação e exercícios.** Não há circuito desenhado nem implementação real. O texto diz que uma família é universal quando aproxima qualquer unitária, mas não explica precisão `ε`, custo de síntese ou um conjunto universal concreto, como rotações de um qubit mais CNOT.

**Recomendação.** Mostrar a tabela completa da CNOT, a criação de Bell com H seguido de CNOT, e comparar duas decomposições de uma rotação. Registrar a versão do compilador e a topologia quando o exemplo deixar o modelo ideal e entrar em hardware, conforme a recomendação de documentação e compilação do Qiskit [10].

### Seção 4 — Sistemas multipartidos e protocolos

**Conteúdo.** A seção cobre produto tensorial, estados de Bell, CHSH, teletransporte e não clonagem. O texto sobre não sinalização é correto: correlação conjunta não fornece uma distribuição marginal controlável e a comparação exige canal clássico.

**Fórmulas.** `|00⟩=|0⟩⊗|0⟩` e `|Φ⁺⟩=(|00⟩+|11⟩)/√2` estão corretas. A identidade do teletransporte é correta sob uma convenção apropriada para os dois bits medidos, mas a ordem `X^n Z^m` e a correspondência entre `m,n` e o resultado de Bell devem ser declaradas. Trocar `XZ` por `ZX` muda apenas uma fase global no ramo correspondente, mas a falta de convenção pode gerar implementação incorreta.

**Exercícios e diagramas.** O exercício de não sinalização é bom conceitualmente, mas faltam as quatro distribuições de Bell e o circuito de teletransporte. Não há teste CHSH com ângulos, valor de correlação ou limite clássico `|S|≤2`.

**Recomendação.** Incluir os quatro estados de Bell, a matriz reduzida de `Φ⁺`, o circuito de teletransporte e um cálculo CHSH com bases especificadas. Diferenciar explicitamente o teorema de não clonagem de uma simples impossibilidade de copiar estados da base computacional.

### Seção 5 — Emaranhamento e informação quântica

**Conteúdo.** A seção repete integralmente os três temas da seção 4: produto tensorial, Bell–CHSH e teletransporte–não clonagem. Essa repetição é o achado editorial mais evidente do pacote.

**Achado confirmado.** Não é apenas uma sobreposição temática inevitável: os títulos, fórmulas e blocos de conteúdo são essencialmente os mesmos. A seção 4 se chama “Sistemas multipartidos e protocolos” e a seção 5 “Emaranhamento e informação quântica”, mas ambas percorrem a mesma sequência. A duplicação aumenta o tamanho do livro sem acrescentar uma camada matemática ou experimental clara.

**Recomendação.** Fundir as duas seções ou redefinir a seção 5 para informação quântica propriamente dita: entropia de von Neumann, informação mútua, entropia de emaranhamento, fidelidade, distância de traço e noções básicas de capacidade de canal. Se a duplicação for intencional, a seção 5 deve ser explicitamente avançada e usar exemplos diferentes, como purificação e desigualdade de monogamia.

### Seção 6 — Estados mistos e canais quânticos

**Conteúdo.** A seção define matriz densidade, canais CPTP, Kraus, decoerência e ruído. A formulação geral está em conformidade com a documentação de canais da IBM [9] e com o uso de modelos de ruído em Aer [6].

**Fórmulas.** `⟨O⟩=Tr(ρO)` e `E(ρ)=Σ_k E_kρE_k†`, com `Σ_k E_k†E_k=I`, estão corretas. A matriz de decoerência
`ρ(t)=[[ρ00(t), γ(t)ρ01(0)], [conj(γ(t))ρ10(0), ρ11(t)]]`
é válida como modelo de desfasamento puro sob condições apropriadas, mas não modela amplitude damping, pois este também altera as populações diagonais. O texto mistura esses modelos sem inserir seus operadores de Kraus.

**Exercícios.** Há bons pedidos de verificação de positividade, traço e expectativa de Z. Entretanto, o bloco de código é o mesmo esqueleto não executável das demais subseções.

**Recomendação.** Dar explicitamente os Kraus de bit-flip, phase-flip, amplitude damping e depolarização; impor os intervalos dos parâmetros; e testar `ΣK†K=I`. Comparar uma simulação ideal e uma com ruído usando `NoiseModel`, `QuantumError` e `ReadoutError`, nomenclatura usada pela documentação oficial [6].

### Seção 7 — Algoritmos quânticos

**Conteúdo.** A introdução apresenta interferência, Deutsch–Jozsa, Grover e Shor. O texto acerta ao dizer que o oráculo é uma abstração e que seu custo precisa ser contabilizado. Também acerta ao qualificar Grover como aceleração quadrática, não busca clássica completa em paralelo.

**Fórmulas.** O phase kickback `(-1)^{f(x)}|x⟩|−⟩` está correto para o alvo preparado em `|−⟩`. A iteração de Grover `k≈(π/4)√(N/M)` é a aproximação padrão para poucos itens marcados. Falta a expressão exata do ângulo e o limite de sucesso, especialmente quando `M` não é conhecido.

**Implementação e exercícios.** Deutsch–Jozsa e Grover não têm circuitos, oráculos ou código. O exercício de Grover é conceitualmente correto, mas a solução não executa o cálculo para um `N` pequeno. A seção afirma Shor sem implementar aritmética modular ou mostrar uma instância.

**Recomendação.** Implementar Deutsch–Jozsa para dois bits, Grover para `N=4` e uma simulação de amplificação com tabela de amplitudes por iteração. Para Grover, separar consultas ao oráculo, difusão, preparação e verificação clássica. Para Shor, deixar claro que a seção seguinte desenvolve a parte de fase.

### Seção 8 — Fourier quântica e estimativa de fase

**Conteúdo.** A seção introduz QFT, QPE e a redução de Shor. A fórmula da QFT
`QFT_N|x⟩=(1/√N)Σ_y exp(2πixy/N)|y⟩`
é uma convenção válida; a documentação IBM apresenta a mesma convenção positiva e confirma que, para `N=2^m`, a implementação direta usa custo `O(m²)` [2] [3].

**Fórmulas e implementação.** A equação de autovalor `U|ψ⟩=e^{2πiθ}|ψ⟩` está correta. O texto menciona potências controladas de U e QFT inversa, mas não mostra o registrador de controle, a ordem dos qubits, a inversão de bits da QFT ou um caso com saída conhecida. Para `θ=1/4`, a recomendação do livro é boa, mas deve declarar se a leitura `01` é escrita em ordem MSB→LSB ou pela convenção do SDK.

A expressão `f(a)=a^x mod N` é ambígua. Na formulação usual, escolhe-se uma base `a` coprima com `N` e define-se a função de entrada `f(x)=a^x mod N`; o período é tomado em `x`. A documentação IBM descreve Shor como redução da fatoração ao problema de encontrar a ordem, com pós-processamento clássico [4].

**Recomendação.** Incluir a matriz `QFT_4`, verificar `QFT_4†QFT_4=I`, desenhar QPE com `θ=1/4`, medir a distribuição e mostrar a aproximação para uma fase não exatamente representável. Para Shor, usar uma instância pequena, separar aritmética modular, estimativa de fase, frações contínuas e cálculo clássico dos fatores.

### Seção 9 — Ruído, decoerência e correção de erros

**Conteúdo.** A seção diferencia bit-flip, phase-flip, decoerência, síndromes, código de repetição, estabilizadores e limiar. A distinção entre mitigação de erro e correção aparece mais claramente na seção 10.

**Fórmulas.** O canal `E(ρ)=(1-p)ρ+pXρX` está correto para bit-flip. A síndrome `s=Hx^T mod 2` é a fórmula clássica de síndrome e pode ser usada para a parte CSS ou para o código de repetição, mas `x` e `H` precisam ser definidos. `S_i|ψ_L⟩=|ψ_L⟩` está correto para o subespaço comum de +1 dos estabilizadores, desde que os geradores sejam compatíveis e independentes.

**Correção de erros.** O texto afirma corretamente que uma síndrome pode identificar o erro sem medir diretamente a informação lógica. As notas de Preskill definem um código como uma aplicação de `k` qubits lógicos em `n` qubits físicos e explicam que geradores estabilizadores funcionam como operadores de verificação [5]. O livro não apresenta, contudo, um circuito de síndrome, uma tabela completa nem um limiar numérico associado a código, decodificador e modelo de ruído.

**Recomendação.** Trabalhar o código de repetição de três qubits para bit-flip, depois explicar por que ele não corrige sozinho phase-flip de um qubit desconhecido. Acrescentar o código de cinco ou nove qubits apenas se houver espaço para circuito e análise de recursos. Ao mencionar limiar, sempre informar código, geometria, decodificador, correlação de erros e se o número é de capacidade de código, de circuito ou de superfície.

### Seção 10 — Tolerância a falhas e recursos

**Conteúdo.** A seção discute propagação por CNOT, operações lógicas codificadas e mitigação versus correção. É uma divisão adequada, mas permanece descritiva.

**Fórmulas.** `CNOT(X⊗I)=(X⊗X)CNOT` está correta para um X no controle. A afirmação deveria ser completada com `CNOT(I⊗X)=(I⊗X)CNOT`, `CNOT(Z⊗I)=(Z⊗I)CNOT` e `CNOT(I⊗Z)=(Z⊗Z)CNOT`, pois o padrão completo é indispensável para engenharia de códigos. `U_L C⊆C` é uma condição suficiente de preservação do subespaço, mas uma operação lógica pode também atuar como uma transformação definida no espaço codificado; a notação deve dizer o que é `C` e se a igualdade, em vez da inclusão, é desejada para uma unitária.

A fórmula de mitigação `⟨O⟩_mitigated≈lim_{λ→0}⟨O⟩_λ` é uma boa intuição para zero-noise extrapolation, mas não é uma identidade universal. É preciso definir como o ruído é escalado, qual família de curvas é ajustada, qual intervalo de `λ` é usado e como a variância cresce. A documentação IBM também alerta que mitigação envolve overhead de pré-processamento e pós-processamento [1] [6].

**Recomendação.** Transformar cada subseção em um exemplo de propagação Pauli, uma porta transversal de código específico e um experimento de ZNE com dados simulados. Separar claramente supressão, mitigação e correção.

### Seção 11 — Complexidade, hardware e prática

**Conteúdo.** A seção é a mais próxima de um protocolo científico. Cobre BPP/BQP, simulação local, métricas de recursos e um laboratório que compara predição, simulador, ruído, shots e baseline clássico. A discussão de profundidade, shots, compilação e linha de base é consistente com a documentação IBM sobre circuitos, Sampler, Estimator e profundidade [1].

**Fórmulas.** O critério `Pr[aceitar]≥2/3` ou `≤1/3` representa corretamente uma margem de erro limitado, mas o texto não define completude, soundness, família de circuitos gerada em tempo polinomial nem a natureza de promise problems. Watrous define BQP como bounded-error quantum polynomial time e explicita a necessidade de famílias de circuitos geradas em tempo polinomial [7].

A fórmula de memória `2^n × bytes por amplitude` está correta como estimativa de vetor de estado. Em precisão dupla complexa, isso corresponde a 16 bytes por amplitude: aproximadamente 16 MiB para 20 qubits e 16 GiB para 30 qubits, antes de overhead. A fórmula de “custo total” como `execuções×(profundidade+leitura)` é apenas uma aproximação didática e não tem unidades consistentes sem definir o custo por camada e o custo de leitura.

**Laboratório e implementação.** O Mermaid renderiza, e a tabela de artefatos e os passos são boas recomendações metodológicas. O código Python, porém, não executa: quatro funções são indefinidas, não há `requirements.txt`, versão de Qiskit/Aer, definição de circuito, implementação do ruído, serialização JSON ou teste esperado. O exercício 7.4.1 é o melhor exercício do livro porque distingue bit-flip de erro de leitura por hipóteses, matriz de confusão, incerteza e validação fora da amostra; ainda assim, sua solução permanece uma especificação, não um programa.

**Recomendação.** Tornar o laboratório um notebook ou script completo. Para a stack atual da documentação IBM, fixar versões compatíveis, por exemplo Qiskit 2.5.x e Qiskit Aer 0.17.x, e declarar que as versões devem ser atualizadas junto com a fonte [6]. O teste mínimo deve comparar: distribuição analítica, statevector ideal, Aer ideal, Aer com canal e counts de shots. O baseline deve ser executável e medir custo de preparação, transpile, circuito, execução e pós-processamento.

### Seção 12 — Referências e limites de atualização

A seção de referências contém fontes relevantes: Feynman, Deutsch, Preskill, IBM, Shor, Grover e NIST. Os DOIs de Feynman, Deutsch, Shor e Grover são URLs canônicas úteis. A referência de Shor está correta como artigo de *SIAM Review* [11], e a de Grover identifica o artigo original [12].

**Achados confirmados.** A lista não é citada no corpo por marcadores que liguem afirmações específicas às fontes. Preskill aparece duplicado em [4] e [9]. O Internet Archive é apresentado como fonte de estudo, mas não deve ser tratado como substituto de artigo ou documentação primária. A referência IBM sobre Qiskit aponta para uma página institucional/marketing; para afirmações técnicas, deve-se preferir a documentação específica de circuitos, QFT, QPE e ruído [1] [2] [3] [6]. A página NIST consultada é institucional e informa criação em 2025 e atualização em 28 de maio de 2026 [8], portanto a data no livro deve ser mantida sincronizada.

**Imagens.** O registro de direitos é melhor que uma atribuição ausente, mas “verificar termos de reutilização” não é uma licença. Antes de distribuir o pacote, confirmar permissão, licença ou substituir as imagens por retratos com licença inequívoca. O alt text também afirma apenas que o retrato foi obtido de “fonte externa”; a atribuição poderia ser mais específica.

## 4. Auditoria matemática consolidada

| Item | Veredito | Condição ou ajuste necessário |
|---|---|---|
| Normalização de qubit | Correto | Declarar que o estado é definido até fase global. |
| Produto interno complexo | Correto | Manter conjugação no primeiro argumento e fixar convenção. |
| Regra de Born | Correto | Incluir projetores e bases gerais, não só base computacional. |
| Hadamard e `H²=I` | Correto | Mostrar multiplicação matricial. |
| CNOT | Correto | Fixar qubit de controle, alvo e endianess. |
| Bell `Φ⁺` | Correto | Mostrar os quatro estados, não somente um. |
| Teletransporte | Correto sob convenção | Definir a ordem dos bits medidos e a ordem `X^n Z^m`. |
| Expectativa `Tr(ρO)` | Correto | Declarar que `O` é observável e que `ρ` é estado físico. |
| Kraus/CPTP | Correto | Demonstrar positividade completa e condição de completude. |
| Matriz `γ(t)` | Parcial | É modelo de desfasamento; não representa genericamente amplitude damping. |
| Grover | Correto como assintótica | Explicar número de soluções, overshooting e custo do oráculo. |
| QFT | Correto sob convenção positiva | Mostrar QFT inversa e inversão de bits. |
| QPE | Correto em alto nível | Incluir potência controlada, distribuição e precisão. |
| Shor | Notação ambígua | Trocar para `f(x)=a^x mod N`, com `a` fixo e coprimo de `N`. |
| BQP | Parcial | Definir circuit family, promise, completeness e soundness. |
| Síndrome | Correto no caso clássico/CSS | Definir `H`, vetor de erro e relação com operadores Pauli. |
| Estabilizadores | Correto sob hipóteses | Definir geradores comutantes, independência e espaço codificado. |
| Propagação Pauli por CNOT | Parcialmente demonstrada | Incluir as quatro identidades X/Z. |
| ZNE | Intuição correta | Não apresentar extrapolação como limite universal; definir ajuste e variância. |

## 5. Achados comprovados versus recomendações

### Achados comprovados

1. `npm run validate` passa com 0 erros e 0 avisos para o pacote.
2. O manifesto referencia 12 JSONs existentes e o cabeçalho/capa existem.
3. A numeração declarada das seções está fora de ordem e contém duplicidades: 4, 4 e 6, 6, além de saltos para 10 e 13.
4. As seções “Sistemas multipartidos e protocolos” e “Emaranhamento e informação quântica” repetem os mesmos três temas e essencialmente os mesmos blocos.
5. O pacote contém 34 subseções, 45 exercícios, 38 blocos matemáticos, 34 blocos de código e apenas dois blocos visuais de conteúdo.
6. Trinta e três subseções usam o código textual genérico de quatro linhas; o laboratório é a exceção com um esqueleto Python específico.
7. O código Python do laboratório chama quatro funções que não estão definidas no bloco e não fornece dependências, circuito ou teste esperado.
8. O corpo do livro não usa citações numeradas ligadas a afirmações específicas; as referências ficam concentradas na seção 12.
9. A licença dos dois retratos históricos não está confirmada no registro de direitos.
10. Não há seção ou conteúdo de biologia no pacote quântico.

### Recomendações

1. Renumerar seções conforme a ordem didática ou alterar a ordem do manifesto. Uma sequência coerente seria: pré-requisitos, qubits, portas, sistemas multipartidos, emaranhamento/informação, estados mistos, algoritmos, QFT/QPE, ruído, tolerância, complexidade/laboratório e referências.
2. Fundir as seções 4 e 5 ou atribuir à seção 5 conteúdo avançado genuíno.
3. Substituir o molde repetido por exemplos resolvidos específicos, um por subseção.
4. Reescrever os exercícios genéricos com entradas numéricas, resultado esperado e solução completa.
5. Adicionar diagramas de circuitos e tabelas de amplitudes para os protocolos centrais.
6. Tornar o laboratório executável, versionado e reproduzível, incluindo artefatos JSON e testes automatizados.
7. Corrigir a notação de Shor, qualificar a fórmula de desfasamento e formalizar a extrapolação de ruído.
8. Adicionar citações inline por afirmação, preferindo artigos, DOI, notas de curso e documentação técnica canônica.
9. Confirmar licenças das imagens ou substituí-las por assets com licença inequívoca.
10. Manter o projeto de biologia separado deste pacote, conforme a proposta abaixo.

## 6. Implementação quântica recomendada para a revisão

Uma implementação mínima, reproduzível e suficiente para validar o livro deve ter os seguintes testes:

- **Qubit e H:** começar em `|0⟩`, aplicar H e medir aproximadamente 50/50; aplicar H novamente e obter `|0⟩` idealmente.
- **Bell:** H no controle seguido de CNOT; em circuito ideal, counts somente em `00` e `11`, respeitando a convenção de bits.
- **QFT4:** construir a matriz explícita, verificar `QFT4.conj().T @ QFT4 = I` e comparar o circuito com a matriz.
- **QPE:** usar um autovetor conhecido de uma fase `θ=1/4`; comparar distribuição ideal, statevector e shots.
- **Canais:** aplicar bit-flip a `|0⟩` e verificar `P(1)=p`; aplicar amplitude damping e verificar que população e coerência não mudam como no canal de desfasamento puro.
- **Teletransporte:** testar vários estados `α|0⟩+β|1⟩`, registrar os dois bits clássicos e medir fidelidade do estado recebido após a correção.
- **Código de repetição:** gerar tabela de síndromes para um erro simples, testar erro único corrigível e erro duplo não corrigível.
- **Laboratório:** ajustar hipóteses de bit-flip e readout error aos mesmos counts, informar incerteza binomial e fazer validação fora da amostra.

A implementação deve registrar versão de Python, Qiskit e Aer; semente; endianess; número de shots; circuito antes e depois da compilação; backend; parâmetros de ruído; counts brutos; e métricas. A documentação IBM descreve explicitamente `Sampler`, `Estimator`, shots, profundidade, modelos de ruído e erros de leitura [1] [6] [10].

## 7. Projeto de biologia solicitado: simulação de evolução em C++

Não há biologia no livro auditado. A proposta abaixo é uma recomendação independente, não uma sugestão para inserir biologia no pacote de computação quântica.

### Objetivo

Construir um simulador de evolução em população finita, reproduzível por semente, que permita estudar seleção, mutação, deriva genética, recombinação, migração e mudanças ambientais. O projeto deve comparar previsões analíticas simples com trajetórias estocásticas e produzir dados suficientes para análise estatística.

### Modelo

Use uma população diploide de tamanho efetivo `N`, genoma binário ou de nucleotídeos de comprimento `L`, reprodução Wright–Fisher e gerações discretas. Cada indivíduo deve ter genótipo, sexo opcional, fitness e histórico de mutações. Defina fitness por uma paisagem aditiva e, em um segundo modo, epistática:

`w(g,t) = exp(s · Σ_i a_i g_i + ε · Σ_(i,j) J_ij g_i g_j + e_t(g))`.

O ambiente `e_t` deve mudar por semente, por calendário determinístico ou por arquivo de eventos. A mutação deve aceitar taxas distintas por transição e transversão; a recombinação deve escolher pontos de crossover; a migração deve conectar demes em um grafo.

### Reprodutibilidade e organização

A árvore recomendada é:

```text
cpp-evolution/
  CMakeLists.txt
  README.md
  LICENSE
  include/evo/{model.hpp,rng.hpp,io.hpp,stats.hpp}
  src/{main.cpp,model.cpp,rng.cpp,io.cpp,stats.cpp}
  apps/evolve.cpp
  tests/{test_rng.cpp,test_mutation.cpp,test_selection.cpp,test_small_exact.cpp}
  configs/{neutral.toml,selection.toml,epistasis.toml}
  scripts/{run_replicates.py,analyze.py,plot.py}
  docs/methods.md
```

Fixar compilador C++20, opções `-O2 -Wall -Wextra -Wpedantic`, dependências por arquivo de lock ou `FetchContent` versionado, e uma semente explícita na linha de comando. A saída deve conter configuração completa, hash do commit, semente, número de réplicas, geração, frequências alélicas, heterozigosidade, diversidade nucleotídica, fitness médio, tamanho efetivo e eventos ambientais.

### Execução e testes

O executável deve aceitar `--config`, `--seed`, `--generations`, `--replicates`, `--output` e `--threads`. Para evitar resultados dependentes da ordem de threads, cada réplica deve receber uma sub-semente derivada deterministicamente de `(seed, replicate_id)` e a redução estatística deve ser associativa ou feita de forma serial reprodutível.

Os testes mínimos são: reprodução exata de uma sequência curta sob uma semente fixa; mutação que preserva o número esperado de cópias em muitas réplicas; neutralidade que converge para a deriva prevista; seleção que aumenta a frequência do alelo vantajoso sob `s>0`; recombinação que reduz desequilíbrio de ligação; e comparação de uma população pequena com enumeração exata de estados.

### Experimentos grandes

O estudo principal deve usar pelo menos 1.000 réplicas para três regimes: neutro, seleção com mutação e paisagem epistática com ambiente oscilante. Variar `N`, `L`, taxa de mutação, taxa de recombinação, intensidade de seleção e número de demes. Reportar média, mediana, quantis, intervalos de confiança e taxa de fixação. Separar variabilidade entre réplicas da incerteza de estimação.

### Critérios de aceitação

O projeto é reproduzível quando outra pessoa consegue compilar a mesma versão, executar um comando documentado, regenerar arquivos CSV/Parquet e reproduzir as figuras com a mesma semente. Nenhuma conclusão biológica deve ser apresentada sem distinguir o resultado do modelo da validade do modelo para uma população real.

## Referências

[1]: https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in-practice/running-quantum-circuits "IBM Quantum Learning — Running quantum circuits"
[2]: https://quantum.cloud.ibm.com/learning/en/modules/computer-science/qft "IBM Quantum Learning — Quantum Fourier transform"
[3]: https://quantum.cloud.ibm.com/learning/courses/fundamentals-of-quantum-algorithms/phase-estimation-and-factoring/phase-estimation-procedure "IBM Quantum Learning — The phase-estimation procedure"
[4]: https://quantum.cloud.ibm.com/learning/courses/fundamentals-of-quantum-algorithms/phase-estimation-and-factoring/shor-algorithm "IBM Quantum Learning — Shor's algorithm"
[5]: https://www.preskill.caltech.edu/ph229/notes/chap7.pdf "John Preskill — Quantum Error Correction"
[6]: https://quantum.cloud.ibm.com/docs/guides/build-noise-models "IBM Quantum Documentation — Build noise models"
[7]: https://arxiv.org/abs/0804.3401 "John Watrous — Quantum Computational Complexity"
[8]: https://www.nist.gov/quantum-information-science/quantum-computing-explained "NIST — Quantum Computing Explained"
[9]: https://quantum.cloud.ibm.com/learning/courses/general-formulation-of-quantum-information/quantum-channels/introduction "IBM Quantum Learning — Quantum channels: Introduction"
[10]: https://www.ibm.com/quantum/qiskit "IBM Quantum — Qiskit"
[11]: https://doi.org/10.1137/S0036144598347011 "Peter W. Shor — Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms"
[12]: https://doi.org/10.1145/237814.237866 "Lov K. Grover — A fast quantum mechanical algorithm for database search"
[13]: https://doi.org/10.1098/rspa.1985.0070 "David Deutsch — Quantum theory, the Church–Turing principle and the universal quantum computer"
[14]: https://doi.org/10.1007/BF02650179 "Richard P. Feynman — Simulating physics with computers"

## Resumo estruturado

```yaml
pacote: computacao-quantica
escopo: auditoria exclusiva do livro quântico; nenhum arquivo de conteúdo editado
status_estrutural: aprovado pelo validador oficial, 0 erros, 0 avisos
secoes: 12
subsecoes: 34
exercicios: 45
blocos_matematicos: 38
blocos_de_codigo: 34
blocos_visuais_de_conteudo: 2
achados_criticos:
  - numeração do manifesto fora de ordem e com duplicidades
  - duplicação substancial entre Sistemas multipartidos e Emaranhamento
  - 33 subseções usam esqueleto genérico de pseudoimplementação
  - código específico do laboratório não é executável por funções indefinidas
  - ausência de circuitos para protocolos e algoritmos centrais
  - fórmula de Shor com variáveis ambíguas
  - fórmula de decoerência não representa todos os canais citados
  - fórmula de mitigação precisa de hipótese de extrapolação
  - licenças das imagens históricas não confirmadas
achados_positivos:
  - esquemas JSON e IDs válidos
  - fórmulas fundamentais de qubit, Born, H, CNOT, Kraus, QFT e QPE em geral corretas
  - boa preocupação com custo, shots, baseline e limites
  - laboratório contém protocolo metodológico promissor
recomendacoes_prioritarias:
  - corrigir numeração e ordem
  - fundir ou diferenciar as duas seções de emaranhamento
  - substituir meta-texto repetido por exemplos resolvidos
  - implementar e testar o laboratório
  - adicionar diagramas de circuitos e convenções de qubit
  - corrigir notação de Shor e qualificar ruído/ZNE
  - inserir citações inline e confirmar direitos das imagens
biologia:
  presente_no_pacote: false
  proposta_incluida_no_relatorio: simulador de evolução em C++20 com seeds, CMake, testes, réplicas e análise estatística
artefato: /home/ubuntu/biblio-ai/reports/research-03-computacao-quantica.md
```

O relatório foi salvo em `/home/ubuntu/biblio-ai/reports/research-03-computacao-quantica.md`.
