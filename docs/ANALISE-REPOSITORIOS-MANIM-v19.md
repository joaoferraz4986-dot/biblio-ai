# Análise de referências Manim e plano de integração — v19

## Diretriz adotada

Os livros serão distribuídos localmente. A análise de licenças continua registrada para preservar a proveniência das adaptações e dos créditos, mas não será usada para bloquear conteúdo local. A regra prática será: usar os códigos dos repositórios como base de portabilidade, traduzir textos para português, ajustar a composição ao nível dos livros e testar cada cena; não simplesmente copiar vídeos pré-renderizados.

## Auditoria atual

A auditoria v18 encontrou:

- `reinos-microscopicos`: 11 seções, 256 textos, 24 fórmulas, 5 códigos, 17 blocos históricos, 2 imagens, 3 vídeos e 43 exercícios.
- `arquitetura-memoria-cpp`: 10 seções, 156 textos, 32 códigos, 1 bloco histórico e 26 exercícios, sem fórmulas, diagramas, imagens ou vídeos.
- `sistemas-embarcados-arduino`: 14 seções, 389 textos, 10 fórmulas, 36 códigos, 7 imagens, 1 vídeo e 59 exercícios.
- `computacao-quantica`: 12 seções, 227 textos, 39 fórmulas, 11 códigos, 2 vídeos e 45 exercícios.
- `calculo-1-e-ponte-2`: 18 seções, 288 textos, 18 fórmulas, 18 códigos, 8 vídeos e 54 exercícios.
- `algebra-linear-fundamentos-e-aplicacoes`: 18 seções, 288 textos, 18 fórmulas, 18 códigos, 8 vídeos e 54 exercícios.
- `programacao-competitiva-cpp`: 15 seções, 833 textos, 94 códigos, 7 vídeos e 87 exercícios.
- `combinatoria-computacao`: 9 seções, 510 textos, 33 fórmulas, 13 códigos e 36 exercícios.

A maior lacuna comum é visual: muitos livros têm texto, fórmulas e exercícios, mas poucos diagramas e vídeos.

## O que incorporar

### Biologia e biocomputação

DNA storage deve ser incorporado ao livro de biologia, ligado explicitamente a DNA como informação, complementaridade, replicação, codificação, síntese, armazenamento, sequenciamento, ruído e recuperação. Não será um desvio isolado: entrará depois da explicação molecular e antes/ao lado da ponte para biocomputação.

Também devem entrar, em sequência coesa:

1. escala e diversidade microscópica;
2. arquitetura comparada de procariontes e eucariontes;
3. origem da vida/LUCA como hipótese e evidência;
4. Grande Oxidação;
5. endossimbiose;
6. DNA como informação;
7. DNA storage;
8. bioeletricidade e neurônio;
9. LIF, Hodgkin–Huxley, sinapse e redes neurais;
10. fechamento ligando informação biológica e computação.

Os repositórios `comp_neurosci_videos`, `manim-evolution-story`, `DNA-storage-models` e `EduGen` oferecem referências distintas. O código de DNA storage encontrado contém um roteiro sobre Poisson, cobertura de sequenciamento, strings e recuperação. A adaptação deve traduzir e ampliar a ligação curricular, não copiar o vídeo.

### Computação quântica

O livro atual precisa de mais diagramas. A prioridade é:

- circuito H + CNOT e estado de Bell;
- esfera de Bloch e medição;
- circuito lógico → transpilation → backend → shots;
- ruído, density matrix e erro de leitura;
- surface code, síndrome, decoder e qubit lógico;
- Shor em N=15 com QFT e frações contínuas;
- Grover/VQE com custo, shots e limites;
- memória quântica/repetidores, EIT/AFC, perdas e fidelidade;
- comparação de supercondutores, íons, átomos neutros e fotônica.

`manim-quantum` é a base mais diretamente portável para circuito, state vector e Bloch sphere. `quantum-computing` serve como roteiro Qiskit para Bell, Deutsch–Jozsa, Grover e VQE. `Shors-Algorithm-Introduction` oferece a narrativa matemática, embora o circuito esteja incompleto. `Quantum-Memories-and-Repeaters-Visualised` oferece material para memória quântica e repetidores.

### Arduino, circuitos e lógica

O livro Arduino deve receber:

- RC com constante de tempo;
- leitura ADC e limiar;
- botão, pull-up, LED e debounce;
- portas lógicas e tabela-verdade;
- mapa de Karnaugh;
- autômato finito para debounce;
- UART/SPI/I2C e fluxo de dados;
- interrupção, timer e máquina de estados;
- SVGs Arduino reais já presentes no pacote.

`manimtronics` é a referência real para resistor, capacitor, fonte, ground, fios e SignalFlow. `manim-eng` oferece esquemas e labels. `LogicGates.py`/`Kmap.py` oferece portas e Karnaugh. `manim-automata` oferece DFA/NFA/PDA, mas apenas DFA pequeno deve entrar no núcleo do livro.

### Memória e compiladores

O livro de memória deve ganhar diagramas para:

- fonte C++ → pré-processador → compilador/IR → assembler → linker/ELF → loader → processo;
- `.text`, `.rodata`, `.data`, `.bss`, heap e stack;
- ponteiros, referências, lifetime, ownership e dangling pointer;
- registrador → cache → RAM → armazenamento;
- frames da stack e alocação dinâmica;
- relação entre objeto C++, ABI, assembly e processo.

Os repositórios do anexo não oferecem uma biblioteca pronta para isso. A adaptação será feita com primitivas Manim e código didático do próprio livro, não com analogias elétricas inadequadas.

### Algoritmos e estruturas

`manim-dsa`, `DSA-Animations`, `Algorithms-Project`, `ManimSort`, `manim-data-structures` e `CourserLi/Manim` oferecem material para:

- Dijkstra;
- BFS/DFS;
- BST, AVL e B-tree;
- heap, priority queue e HeapSort;
- Bubble, Selection, Insertion, Merge e Quick Sort;
- array, lista, stack, queue, hash table e KMP;
- Prim, Kruskal e Union-Find;
- recorrência, call stack, subconjuntos, Pascal e DP.

A adaptação deve usar um kit visual comum e associar cada cena a um exercício, invariante, caso-limite e complexidade.

### Cálculo e Álgebra Linear

Do 3Blue1Brown, o corte deve preservar ideias essenciais e eliminar introduções, wrappers, personagens e variações repetidas:

- Cálculo: limite, epsilon-delta, secante/tangente, regras de derivação, integral/FTC, Taylor, campo de direções e uma ponte curta para Laplace.
- Álgebra: vetor/span/base, transformação/matriz, projeção/mínimos quadrados, autovalores/diagonalização, SVD como rotação–escala–rotação e Fourier.

O material de 3Blue1Brown é referência visual, não substituto do texto completo dos livros. Nenhuma explicação, demonstração ou exercício deve ser removido por causa de uma animação.

## Ports reais já iniciados

Foi criado `referenced_adaptations_pt.py` usando APIs reais dos repositórios:

- `manim-quantum`: circuito Bell e Bloch sphere;
- `manim-dsa`: MArray e MStack;
- `manimtronics`: resistor, capacitor, fonte, ground e fios;
- `DNA-storage-models`: sequência de codificação/armazenamento/decodificação com texto em português.

Os plugins foram instalados localmente para validar imports. O port quântico precisa de LaTeX no ambiente para renderizar os labels MathTex do plugin; o código está pronto para ser renderizado após essa dependência. O objetivo é portar o código e o roteiro, não entregar um vídeo recriado sem fonte.

## Fontes consultadas

- https://github.com/AniruthSuresh/DNA-storage-models
- https://github.com/lina-usc/comp_neurosci_videos
- https://github.com/NullLabTests/manim-evolution-story
- https://github.com/ahammadnafiz/EduGen
- https://github.com/ProfessorNova/manim-quantum
- https://github.com/pmmathias/quantum-computing
- https://github.com/hz826/Shors-Algorithm-Introduction
- https://github.com/VishuVish/Quantum-Memories-and-Repeaters-Visualised
- https://github.com/mfranzon/manimtronics
- https://github.com/overegneered/manim-eng
- https://github.com/Daniel20010822/Manim-animation
- https://github.com/SeanNelsonIO/manim-automata
- https://github.com/F4bbi/manim-dsa
- https://github.com/paarthsiloiya/dsa-animations
- https://github.com/HudhaifaGburi2/Algorithms-Project
- https://github.com/VashLT/ManimSort
- https://github.com/drageelr/manim-data-structures
- https://github.com/Likey00/manim-data-structures
- https://github.com/CourserLi/Manim
- https://github.com/3b1b/videos
