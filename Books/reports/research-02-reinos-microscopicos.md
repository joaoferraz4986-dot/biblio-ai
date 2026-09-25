# Auditoria de pesquisa — Biologia dos Reinos Microscópicos

**Repositório auditado:** `/home/ubuntu/biblio-ai`  
**Pacote auditado:** `content/packages/reinos-microscopicos/`  
**Data da auditoria:** 24 de setembro de 2026  
**Escopo:** somente o livro **Biologia dos Reinos Microscópicos**. Nenhum JSON, imagem, código ou documentação-fonte do livro foi editado. O único arquivo criado no repositório foi este relatório, conforme solicitado.

## Resumo executivo

O pacote está **formalmente válido**, mas **não está pronto para publicação como livro didático de biologia** sem uma revisão editorial e factual substancial. O validador oficial do projeto terminou com **0 erros e 0 avisos**. Todos os 11 JSONs de seção são JSON válido, os IDs de seções e subseções são únicos e seguem o padrão permitido, as imagens referenciadas existem e as tabelas são retangulares. Esses resultados comprovam somente conformidade com o esquema de conteúdo; não comprovam correção científica, sequência pedagógica ou adequação dos exemplos.

Os principais achados comprovados são os seguintes:

1. O manifesto lista **11 seções**, porém a sequência contém números repetidos (`2` e `5`) e não está ordenada numericamente: depois das seções 1–7 aparecem as seções 2, 5, 9 e 12. Isso é uma inconsistência editorial clara, embora não seja rejeitada pelo esquema.
2. Há **32 subseções**. Trinta têm `number: ""` e duas subseções herdadas têm `number: null` e não têm `tag`/`accent`. A estrutura funciona, mas a numeração visível prometida pelo formato não está preenchida.
3. Há **42 exercícios**, todos com solução expansível válida. Entretanto, a maior parte das soluções e dos enunciados das subseções usa o mesmo molde genérico: “compare dois casos”, “declare as hipóteses” e “discuta um caso-limite”. Isso comprova repetição textual, não uma sequência de atividades específicas para os mecanismos ensinados.
4. Os blocos de código são **30** e usam repetidamente `language: "text"` com o mesmo esqueleto `question -> hypothesis -> control -> measurement`; não há implementação biológica executável, análise de dados ou simulação no pacote.
5. O livro contém apenas **duas fórmulas**: `ΔG = ΔH − TΔS` e a equação de balanço de corrente `C_m dV/dt = −I_ion + I_ext`. Ambas são plausíveis e compatíveis com as fontes, mas faltam definições de símbolos, unidades, convenções de sinal, hipóteses e um exemplo numérico reproduzível.
6. Há um único diagrama conceitual em SVG e duas imagens SVG decorativas. As imagens chamadas de esquema celular e esquema neuronal exibem principalmente títulos, círculos e linhas; não mostram, de fato, membrana, núcleo, mitocôndrias, dendritos, axônio, canais ou sinapses na granularidade sugerida pelas legendas.
7. A subseção **Biossegurança E Ética** e quatro subseções metodológicas contêm texto deslocado de computação de hardware — “plataforma, clock, memória, latência, energia, falha e teste”, “driver” e “sistema operacional”. Trata-se de contaminação temática comprovada por inspeção textual.
8. O termo **protistas** aparece no manifesto e no mapa, mas não há capítulo ou subseção dedicada a protistas. A fonte consultada caracteriza “protista” como um termo guarda-chuva para eucariontes muito diversos, e não como um grupo monofilético simples [4]. O mapa precisa deixar explícito que se trata de uma categoria didática histórica/operacional, não de um ramo taxonômico equivalente a Bacteria, Archaea ou Fungi.
9. A seção de referências tem apenas nove entradas e não há citações numéricas junto às afirmações dos demais capítulos. Faltam, entre outras, referências explícitas para membranas e transporte, termodinâmica, replicação e reparo, RNA-seq, transferência horizontal, desenho experimental, biossegurança, evolução populacional e simulação computacional.
10. Não há qualquer termo, fórmula ou código de **computação quântica** no pacote auditado. Portanto, não existe implementação quântica ou fórmula quântica que possa ser conferida sem sair do escopo exclusivo deste livro. A recomendação para eventual capítulo futuro é usar a formulação de qubit, medição e circuitos da IBM Quantum [13] e verificar a API corrente do Qiskit [14].

A recomendação prioritária é separar uma **correção estrutural** — ordem e numeração — de uma **revisão de conteúdo**. Em seguida, cada subseção deve receber pelo menos um exemplo mecanístico próprio, uma fonte canônica localmente citada, uma fórmula ou grandeza quando pertinente, uma atividade verificável e uma solução específica. O projeto de simulação evolutiva em C++ incluído neste relatório oferece um caminho seguro, reproduzível e quantitativo para preencher essa lacuna sem cultivo de amostras desconhecidas.

## Base documental e método de auditoria

Foram lidos integralmente `docs/FORMATO-DO-LIVRO.md`, `docs/ARQUITETURA.md`, `docs/REFERENCIAS-REVISAO.md`, `manifest.json`, `header.json` e os 11 arquivos JSON em `content/packages/reinos-microscopicos/sections/`. Também foram inspecionados o validador, o registro dos blocos, o bloco de exercícios e o arquivo de direitos de imagem para distinguir problemas de esquema, problemas de conteúdo e problemas de proveniência.

A verificação estrutural foi feita com o validador oficial (`npm run validate`). O resultado foi `0 erro(s), 0 aviso(s) no total`, incluindo `reinos-microscopicos (11 seções) — OK`. A inspeção adicional contou blocos, verificou IDs, assets, tabelas, fórmulas e textos duplicados. A verificação científica cotejou fontes canônicas ou acadêmicas, incluindo ICTV, OpenStax, IUPAC, NIH/PubMed, OMS, IBM Quantum e artigo acadêmico sobre Wright–Fisher.

Neste relatório, **achado comprovado** significa algo diretamente observado no repositório, na saída do validador ou em uma fonte consultada. **Recomendação** é uma ação editorial ou didática proposta a partir desses achados. Uma recomendação não deve ser lida como prova de que o conteúdo atual é falso.

## Inventário do pacote

| Item | Resultado observado | Avaliação |
|---|---:|---|
| Seções listadas no manifesto | 11 | Formalmente válido; ordem editorial inconsistente |
| Subseções | 32 | IDs únicos; numeração ausente ou vazia |
| Exercícios | 42 | Bloco reconhecido e validado; conteúdo excessivamente genérico |
| Blocos `paragraph` | 149 | Volume alto, com repetição de moldes |
| Blocos `callout` | 102 | Muitos são critérios genéricos repetidos |
| Blocos `code` | 30 | Todos os esqueletos de método; nenhum programa executável |
| Blocos `math` | 2 | Fórmulas plausíveis, sem desenvolvimento quantitativo |
| Diagramas SVG | 1 | Mapa conceitual; risco de ambiguidade taxonômica |
| Imagens | 2 blocos SVG locais + 2 retratos históricos | Assets locais presentes; créditos externos requerem conferência |
| Tabelas | 1 | Comparação curta de Bacteria, Archaea e Fungi |
| Referências no capítulo próprio | 9 | Insuficientes para o conteúdo total e sem citações inline |
| Resultado do validador | 0 erros, 0 avisos | Conformidade formal, não validação científica |

### Identidade do cabeçalho

O cabeçalho define o livro como “Biologia dos Reinos Microscópicos”, com o subtítulo “Da célula ao neurônio e aos sistemas vivos”. A nota de leitura recomenda três passagens: definição e mecanismo, comparação e exercício de transferência. Essa proposta é pedagogicamente coerente com a intenção do pacote. O próprio cabeçalho, contudo, reconhece que as figuras são esquemas conceituais, não micrografias nem dados experimentais; as figuras presentes devem ser redesenhadas para realmente cumprir a função conceitual anunciada.

### Sequência do manifesto

| Posição | Arquivo | Número | Título |
|---:|---|---:|---|
| 1 | `mapa-da-vida-microscopica.json` | 1 | Mapa da vida microscópica |
| 2 | `celula-e-metabolismo.json` | 2 | Célula, membranas e metabolismo |
| 3 | `bacterias-arqueias-fungos.json` | 3 | Bactérias, arqueias e fungos |
| 4 | `virus-e-infeccao.json` | 4 | Vírus, genomas e infecção |
| 5 | `neuronios-e-biocomputacao.json` | 5 | Neurônios e biocomputação |
| 6 | `metodos-e-ecologia.json` | 6 | Métodos, ecologia e biossegurança |
| 7 | `referencias.json` | 7 | Referências e limites de atualização |
| 8 | `fundamentos-moleculares.json` | 2 | Fundamentos moleculares e físico-químicos |
| 9 | `genomas-e-expressao.json` | 5 | Genomas e expressão gênica |
| 10 | `integracao-celular.json` | 9 | Integração de biologia celular |
| 11 | `metodos-e-sintese.json` | 12 | Métodos, síntese e aplicações |

**Achado comprovado:** os números `2` e `5` aparecem duas vezes, e a seção 7 “Referências” vem antes das seções 8–11. **Recomendação:** decidir se as quatro últimas seções são uma expansão planejada do livro. Se forem, renumerar todas as seções em uma sequência única e mover “Referências” para o final. Se não forem, removê-las do manifesto ou integrá-las aos capítulos correspondentes. Não é recomendável manter numeração duplicada apenas porque o validador aceita strings livres.

## Auditoria por seção

### 1. Mapa da vida microscópica

**Conteúdo e nomes.** O texto introdutório acerta ao separar entidades celulares e acelulares e ao afirmar que “microscópico” é uma escala de observação, não um táxon. Também é correto não tratar vírus como células. O ponto frágil é a expressão “reinos microscópicos”: o próprio livro inclui vírus, que não são reino, e protistas, que não constituem um clado simples em classificações modernas [4].

**Exemplo e diagrama.** O exemplo histórico de Antonie van Leeuwenhoek é adequado para discutir instrumento, resolução e inferência. O SVG coloca “células”, “vírus”, “fungos” e “protistas” como quatro ramos irmãos sob “vida microscópica”. Como esquema funcional isso pode ser aceitável, mas falta uma segunda dimensão explícita que separe organização celular, filogenia e estratégia de replicação. O diagrama pode induzir o leitor a interpretar os quatro rótulos como categorias taxonômicas equivalentes.

**Exercícios.** O exercício de classificação em três níveis é o mais adequado da seção, porque pede que o critério seja declarado. As três atividades das subseções são genéricas e não trabalham escala, resolução ou biossegurança com dados concretos.

**Referências.** O capítulo não contém citação local para microscopia, resolução ou classificação. O capítulo de referências menciona ICTV e OpenStax, mas não vincula cada afirmação à fonte correspondente.

**Recomendação.** Redesenhar o mapa como matriz: entidade celular/acelular, material genético, metabolismo próprio e critério filogenético. Adicionar um exemplo quantitativo de resolução óptica e uma micrografia com escala, método e fonte.

### 2. Célula, membranas e metabolismo

**Conteúdo.** A descrição de bicamada lipídica, proteínas de transporte, receptores e gradientes é correta em nível introdutório. A fonte OpenStax confirma que a membrana é uma bicamada seletivamente permeável, que moléculas pequenas e apolares atravessam mais facilmente e que transporte ativo usa energia de ATP [6]. O exercício que distingue difusão simples, difusão facilitada e transporte ativo está conceitualmente correto, mas a resposta deveria separar transporte ativo primário de secundário e distinguir gradiente químico de gradiente eletroquímico.

**Fórmula.** `\Delta G = \Delta H - T\Delta S` é a definição usual de energia de Gibbs em temperatura termodinâmica [7]. A legenda acerta ao restringir a interpretação de espontaneidade a condições de temperatura e pressão constantes, mas não define `ΔG`, `ΔH`, `T` e `ΔS`, nem explica que espontaneidade termodinâmica não é sinônimo de reação rápida. Também não mostra como o acoplamento a ATP ou a força próton-motriz altera a energia livre efetiva.

**Imagem.** `cell-schematic.svg` existe, mas é um cartão gráfico com a palavra “CÉLULA”, um círculo e linhas decorativas. A legenda afirma “membrana, núcleo, mitocôndria e ribossomos”, elementos que não são identificáveis na imagem. Isso é um desalinhamento comprovado entre alt/legenda e conteúdo visual.

**Exercícios.** Há um exercício introdutório, um exercício de revisão e três exercícios de subseção. As soluções são corretas em linhas gerais, porém não incluem cálculo de potencial, concentração, fluxo ou energia.

**Referências.** Faltam referências inline para membrana, transporte e termodinâmica. A inclusão de IUPAC e OpenStax resolveria a base conceitual, desde que as citações sejam inseridas junto às fórmulas e afirmações.

**Recomendação.** Substituir a imagem por um diagrama funcional com bicamada, canais, bomba Na⁺/K⁺ e gradientes. Acrescentar `ΔG = ΔG°' + RT\ln Q`, declarar convenções e resolver um exemplo de transporte acoplado.

### 3. Bactérias, arqueias e fungos

**Conteúdo e tabela.** O parágrafo principal é majoritariamente correto. Bacteria e Archaea são procariontes, mas diferem em membranas, paredes e maquinaria molecular. A fonte OpenStax confirma peptidoglicano em bactérias, ausência de peptidoglicano em arqueias e ligações éter com cadeias de isopreno em membranas arqueanas [2]. Fungos são eucariontes heterotróficos, absorvem nutrientes e têm parede de quitina; hifas, micélio e leveduras são formas ou organizações distintas [3].

A tabela reduz “estratégia energética” a três linhas. Isso é útil como primeira aproximação, mas “quimiossíntese” é um termo amplo e impreciso nesse contexto; convém falar em quimiolitotrofia/quimioautotrofia quando a intenção for metabolismo energético. A tabela também não inclui protistas, apesar de o livro anunciá-los.

**História e imagem.** Lynn Margulis é um exemplo pertinente para endossimbiose. A imagem existe, mas o arquivo de direitos atribui crédito a “Lynn Margulis” e aponta para uma página NASA, sem URL direta da imagem nem licença específica confirmada. Isso não prova infração, mas deixa a proveniência incompleta.

**Exercícios.** O exercício principal acerta ao separar estrutura, membrana e metabolismo. Os três exercícios de subseção repetem o molde genérico e não pedem comparação de uma membrana arqueana, coloração de Gram, fermentação, metanogênese ou crescimento de fungos.

**Referências.** OpenStax é adequado para introdução, mas a seção deveria citar diretamente a fonte no texto e complementar com uma referência de filogenia molecular e uma referência de ecologia microbiana.

**Recomendação.** Ampliar a tabela para incluir composição de membrana, parede, ribossomo, compartimentalização, metabolismo e evidência filogenética. Acrescentar um exercício de inferência que compare morfologia com sequência molecular, deixando claro que morfologia isolada não estabelece parentesco.

### 4. Vírus, genomas e infecção

**Conteúdo.** A definição de vírus como entidade acelular dependente de célula hospedeira é apropriada para o nível introdutório. A descrição de adsorção, entrada, expressão, replicação, montagem e liberação é corretamente apresentada como dependente do vírus e do hospedeiro. OpenStax confirma capsídeo, genoma e envelope opcional, além de grande diversidade morfológica [5]. O alerta que separa infecção, doença e transmissão é importante.

**Taxonomia.** A referência ao ICTV é pertinente, mas precisa ser atualizada por versão. O ICTV mantém um navegador da versão corrente e uma Master Species List [1]. Como taxonomia viral muda, o capítulo deve registrar a data e o release consultado, em vez de tratar a URL geral como evidência suficiente.

**Exercício de antibiótico.** O raciocínio é correto para antibióticos dirigidos à síntese de parede bacteriana. A redação “antibióticos exploram alvos bacterianos” deve ser qualificada: antimicrobianos incluem antibióticos, antivirais, antifúngicos e antiparasitários, e nem todo antibiótico tem o mesmo alvo. A OMS explicita essa distinção e observa que resistência também pode ocorrer em vírus e fungos [18].

**Exercícios e referências.** Há um exercício 4.1, três exercícios de subseção e soluções genéricas. Não há um modelo quantitativo de infecção, curva de crescimento, força de infecção, sensibilidade de teste ou número reprodutivo, apesar de o texto citar esses conceitos.

**Recomendação.** Incluir uma tabela que relacione genoma, capsídeo, envelope, receptor e método de detecção. Adicionar um modelo epidemiológico simples com definições de população, tempo e hipótese, sem transformar um modelo didático em previsão clínica.

### 5. Neurônios e biocomputação

**Conteúdo.** A anatomia funcional básica — dendritos, soma, axônio e sinapse — está correta. A seção também acerta ao dizer que uma rede artificial não reproduz toda a biologia. OpenStax descreve potencial de repouso, canais de Na⁺ e K⁺, limiar, despolarização, repolarização e hiperpolarização [10].

**Fórmula.** `C_m\frac{dV}{dt} = -I_{ion}(V,t) + I_{ext}(t)` é uma forma geral de conservação de corrente de membrana. Ela necessita de convenção explícita: se `C_m` é capacitância por área, as correntes precisam ser densidades de corrente; se é capacitância total, as correntes precisam ser correntes totais. Também falta indicar que `I_ion` costuma ser soma de correntes de vazamento, sódio, potássio e outras. O modelo Hodgkin–Huxley original fornece o contexto para essas correntes [11].

**Modelo integrate-and-fire.** O exercício 5.1 está alinhado à literatura: o modelo gera disparo quando a voltagem atinge um limiar e omite as condutâncias que dirigem o potencial de ação [12]. A solução, entretanto, deveria escrever uma regra, por exemplo `τ_m dV/dt = -(V-E_L)+R_m I(t)`, aplicar limiar/reset e mostrar o que é perdido em relação a Hodgkin–Huxley.

**Imagem.** `neuron.svg` também é predominantemente um cartão tipográfico com “NEURÔNIO”, círculos e linhas, não um esquema identificável com dendritos, soma, axônio e terminais. O alt e a legenda prometem mais informação do que a figura entrega.

**Exercícios e referências.** Há cinco exercícios. O exercício de biocomputação poderia ser forte, mas falta uma implementação executável e uma métrica, baseline ou conjunto de dados.

**Recomendação.** Recriar a figura como diagrama anotado; definir unidades e convenções da equação; incluir um notebook ou programa mínimo de integrate-and-fire com gráfico de `V(t)` e comparação de limiar, frequência e período refratário com uma versão reduzida de Hodgkin–Huxley.

### 6. Métodos, ecologia e biossegurança

**Conteúdo.** A abertura distingue corretamente microscopia, cultura, sequenciamento e ensaio funcional. A advertência sobre vieses de cultura e marcador único é metodologicamente adequada. A solução do exercício 6.1, que propõe desenho fatorial, réplicas biológicas e análise de efeitos principais e interação, é o ponto mais sólido de desenho experimental no pacote.

**Problema temático comprovado.** A subseção “Desenho Experimental” contém texto sobre plataforma, clock, memória, latência, energia, driver e sistema operacional. “Microscopia E Dados Públicos” contém o mesmo bloco de hardware. Essas frases não são uma tradução válida de requisitos de biologia e devem ser removidas.

**Biossegurança.** O texto geral recomenda não cultivar amostras desconhecidas. Essa é uma recomendação prudente, mas deveria apontar para uma avaliação de risco institucional. O manual de biossegurança laboratorial da OMS defende abordagem baseada em avaliação de risco antes da atividade e controles proporcionais ao risco [16].

**Exercícios e referências.** Os três exercícios de subseção não têm conjuntos de dados, desenho de amostragem ou cálculo de índice de diversidade. Não há referência para Shannon, PCR, sequenciamento, metagenômica ou ética laboratorial.

**Recomendação.** Retirar o texto de hardware e criar uma atividade com dados públicos: matriz de abundância microbiana, metadados, normalização, índice de Shannon, intervalo de confiança e análise de sensibilidade à unidade taxonômica. O protocolo deve registrar amostragem, replicação, versão de software e critérios de exclusão.

### 7. Referências e limites de atualização

**Conteúdo.** A seção alerta corretamente que taxonomias, software e hardware mudam. A lista de nove referências cobre ICTV, vírus, procariontes, protistas, fungos, neurônios, potencial de ação, organoides e ética de organoides. São boas fontes de partida.

**Problemas comprovados.** Não há citações numéricas nos capítulos. A lista não cobre as fórmulas e métodos efetivamente usados: Gibbs, transporte de membrana, replicação, reparo, expressão diferencial, transferência horizontal, desenho experimental, biossegurança, evolução populacional e reprodutibilidade computacional. A referência ao Internet Archive aparece em `docs/REFERENCIAS-REVISAO.md`, não como fonte vinculada a uma afirmação deste livro.

**Recomendação.** Transformar a lista em referências numeradas com títulos, autores/organizações, DOI ou URL canônica e data/release quando a informação for mutável. Inserir `[n]` nas afirmações e fórmulas relevantes. Adicionar um registro de limitações: o que a fonte sustenta, em qual nível de evidência e quais condições não são cobertas.

### 8. Fundamentos moleculares e físico-químicos

**Conteúdo e nomes.** As três subseções — “Água, Ph E Interações”, “Macromoléculas E Proteínas” e “Enzimas, Atp E Redox” — têm nomes pertinentes, mas usam capitalização editorial inconsistente (`Ph` e `Atp` em vez de `pH` e `ATP`). Cada uma repete a mesma sequência de parágrafos e callouts, seguida de um exemplo que só pede formulação de pergunta.

**Exemplos, fórmulas e diagramas.** Não há fórmula, diagrama ou exemplo numérico próprio. O texto menciona ligações, dobramento, modificações pós-traducionais e redox, mas não fornece estruturas, reação ou transformação intermediária. A afirmação de que sequência não determina sozinha fenótipo é correta como ressalva, porém deve ser conectada a regulação, ambiente e desenho experimental.

**Exercícios e referências.** São três exercícios de subseção mais uma revisão. As soluções são quase intercambiáveis e não resolvem pH, Henderson–Hasselbalch, cinética de Michaelis–Menten ou balanço redox. Não há referências locais para água, proteínas ou enzimas.

**Recomendação.** Criar um estudo de caso distinto por subseção: tampão e pH, saturação enzimática e inibição, ou transferência de elétrons e potencial redox. Definir símbolos, unidades, aproximações e domínio de validade.

### 9. Genomas e expressão gênica

**Conteúdo.** As três subseções — “Replicação E Reparo”, “Transcrição E Tradução” e “Regulação E Transferência Horizontal” — apresentam ressalvas corretas: genoma inclui regiões codificantes, regulatórias, repetitivas e estruturais; RNA não equivale a proteína; expressão depende de tipo celular, tempo e ambiente.

**RNA-seq.** O callout sobre normalização, replicatas biológicas, lote e múltiplos testes é metodologicamente correto. Um estudo de 48 replicatas encontrou que três replicatas recuperavam apenas 20–40% dos genes diferencialmente expressos detectados no conjunto completo em várias ferramentas, e recomendou pelo menos seis em situações gerais e mais quando se deseja detectar efeitos menores [8]. Essa fonte não autoriza transformar “seis” em regra universal; o número depende de efeito, variância, desenho e custo. O livro deve apresentar isso como planejamento de poder, não como receita.

**Transferência horizontal.** O texto cita o tema mas não descreve transformação, conjugação, transdução, elementos móveis ou critérios de inferência. A literatura mostra que a transferência horizontal é força evolutiva importante e complica a ideia de uma árvore única da vida [9].

**Exercícios e referências.** Há três exercícios repetitivos e uma revisão. Não há sequência curta, dados de expressão, matriz de contagens, hipótese de reparo ou exemplo de transferência de plasmídeo em ambiente simulado.

**Recomendação.** Introduzir um fluxo seguro de análise com dados públicos: qualidade, normalização, desenho, replicatas, modelo estatístico, FDR e interpretação. Para transferência horizontal, usar uma rede de genes ou exemplo de plasmídeo em simulação, sem instruções experimentais de engenharia biológica.

### 10. Integração de biologia celular

**Conteúdo.** “Sinalização E Receptores”, “Ciclo Celular E Morte” e “Imunidade E Diferenciação” cobrem temas relevantes. A cadeia estímulo → sensor → transdutor → efetor → resposta → feedback é uma boa organização conceitual. A ideia de que dose, duração, localização e história celular alteram respostas é correta.

**Problema temático comprovado.** A primeira subseção contém texto de requisitos de hardware, exatamente incompatível com sinalização celular. O restante da seção volta à biologia, o que indica erro de geração ou colagem, não uma posição conceitual consistente.

**Exemplos, fórmulas e diagramas.** Não há fórmula, diagrama ou exemplo de receptor, cascata de fosforilação, checkpoint, apoptose ou diferenciação. A única atividade por subseção é genérica.

**Exercícios e referências.** Há três exercícios de subseção e uma revisão, todos de comparação abstrata. Faltam referências para sinalização, ciclo celular, apoptose e imunologia.

**Recomendação.** Substituir o texto de hardware por um exemplo de dose–resposta ou feedback. Adicionar um diagrama de cadeia causal e um exercício que obrigue o leitor a distinguir correlação de causalidade, marcador de atividade e mecanismo causal.

### 11. Métodos, síntese e aplicações

**Conteúdo.** “Desenho Experimental”, “Microscopia E Métodos Moleculares” e “Estudo De Caso E Incerteza” têm uma boa intenção: ligar método, replicação, versão de software, critérios de exclusão e análise. O callout de protocolo reproduzível é coerente com boas práticas. A Turing Way recomenda capturar o ambiente computacional, versões, configurações e dependências para que outras pessoas consigam executar a análise [17].

**Exemplos, fórmulas e diagramas.** Não há caso de dados, fórmula, diagrama ou implementação. Os três blocos de subseção são variações do mesmo texto, e todos os exercícios pedem “compare dois casos” sem fornecer casos.

**Exercícios e referências.** Há três exercícios de subseção e uma síntese final. A solução final fala em custo, precisão ou segurança, mas não fornece critérios, números ou um caso mínimo. Não há referências para incerteza de medição, metadados ou análise estatística.

**Recomendação.** Transformar a seção em capítulo prático. Fornecer um conjunto de dados pequeno, um protocolo de análise, um arquivo de configuração, uma tabela de resultados e uma seção de limitações. O projeto de evolução em C++ abaixo pode ser a aplicação integradora.

## Auditoria de cada subseção

A tabela abaixo registra as 32 subseções individualmente. “Base” resume o conteúdo efetivamente encontrado; “achado” separa o que foi comprovado no arquivo; “ação” é uma recomendação editorial.

| Seção | Subseção | Base encontrada | Achado comprovado | Ação recomendada |
|---|---|---|---|---|
| Mapa | Escala E Resolução | Escala microscópica, resolução, método e incerteza | Sem número, fórmula óptica ou dado de escala | Adicionar resolução, unidade, escala gráfica e exemplo de imagem |
| Mapa | Método Científico E Evidência | Hipótese, controle, medição e limite | Texto e exercício são genéricos | Inserir estudo de caso com dado observado e alternativa causal |
| Mapa | Biossegurança E Ética | Critérios de biossegurança e atividade segura | Contém texto de clock, memória, driver e sistema operacional | Substituir por avaliação de risco, consentimento, descarte e supervisão |
| Célula | Fluxo de energia e informação | ATP, ribossomo, regulação, compartimentos | Subseção legada sem `tag`/`accent`/`number`; exercício local existe | Normalizar metadados e incluir fluxo energético quantitativo |
| Célula | Membranas E Gradientes | Bicamada, canais, bombas e gradientes | Repetição do molde; nenhum valor de concentração ou potencial | Adicionar Nernst, gradiente eletroquímico e caso de transporte |
| Célula | Enzimas E Energia Livre | ATP, NADH, força próton-motriz e `ΔG` | Sem cinética, reação ou exemplo numérico | Incluir Michaelis–Menten, acoplamento e limites da fórmula |
| Célula | Compartimentalização Celular | Compartimentos e redes de reação | Sem mapa de organelas ou fluxo de matéria | Adicionar diagrama de compartimentos e experimento de localização |
| Bactérias | Filogenia Dos Três Domínios | Marcadores moleculares, morfologia e nicho | Sem árvore, alinhamento ou marcador especificado | Usar árvore didática com ressalvas e marcador declarado |
| Bactérias | Metabolismo E Ciclos | Metabolismo, reprodução, nicho e ciclos | Texto repete o foco de filogenia; sem ciclo biogeoquímico | Inserir nitrogênio, carbono ou enxofre com balanço simples |
| Bactérias | Biofilmes E Resistência | Biofilme, metabolismo e resistência | Não define matriz extracelular, tolerância ou resistência | Separar resistência genética de tolerância fenotípica e incluir dados |
| Vírus | Genomas Virais E Replicação | Capsídeo, envelope, tropismo e ciclo | Sem tipo de genoma ou caso viral específico | Comparar DNA/RNA e citar release ICTV |
| Vírus | Ciclos Lítico E Lisogênico | Entrada, replicação e transmissão | Não explica profago, indução ou limites do par lítico/lisogênico | Usar bacteriófago como estudo de caso e explicitar o modelo |
| Vírus | Detecção E Prevenção | Detecção, prevenção, população e tempo | Sem sensibilidade, especificidade ou teste | Incluir matriz de confusão e prevenção baseada em fonte oficial |
| Neurônios | Do potencial de membrana ao modelo computacional | Integração, abstração e limites | Subseção legada sem `tag`/`accent`/`number`; sem regra formal | Escrever LIF e comparar com Hodgkin–Huxley |
| Neurônios | Potencial De Membrana | Canais, limiar, refratariedade e geometria | Correto em alto nível, sem parâmetros | Adicionar `V_rest`, limiar, unidades e gráfico reproduzível |
| Neurônios | Sinapses E Integração | Sinapses químicas/elétricas e plasticidade | Sem receptor, corrente sináptica ou regra de plasticidade | Incluir soma temporal/espacial e métrica de resposta |
| Neurônios | Biocomputação E Bioinformática | Mecanismo, representação, tarefa e métrica | Sem implementação e sem baseline | Adicionar programa, conjunto de dados e comparação com baseline |
| Métodos | Desenho Experimental | Amostragem, cultura, PCR, sequenciamento | Contém texto de hardware deslocado | Trocar por desenho fatorial e viés de amostragem |
| Métodos | Microscopia E Dados Públicos | Método, amostragem e diversidade | Contém texto de hardware deslocado | Usar imagem pública com escala, licença e metadados |
| Métodos | Ecologia Microbiana | Nicho, competição, mutualismo e Shannon | Sem matriz de abundância ou cálculo de índice | Criar exercício com abundância, cobertura e sensibilidade |
| Fundamentos | Água, Ph E Interações | Água, pH, mecanismo e hipótese | Capitalização `Ph`; sem fórmula ou tampão | Corrigir para `pH` e incluir Henderson–Hasselbalch |
| Fundamentos | Macromoléculas E Proteínas | Estrutura, função, dobramento e contexto | Sem estrutura visual, sequência ou proteína exemplo | Usar uma proteína e separar sequência, estrutura e função |
| Fundamentos | Enzimas, Atp E Redox | Enzimas, ATP, redox e validação | Capitalização `Atp`; sem equação de velocidade | Corrigir para `ATP` e incluir cinética/inibição |
| Genomas | Replicação E Reparo | Genoma, replicação, reparo e métodos | Sem polimerase, lesão ou via de reparo | Expor mecanismo e caso de mutação/reparo |
| Genomas | Transcrição E Tradução | Expressão, RNA e proteína | Sem promotor, processamento ou tradução codônica | Adicionar sequência curta e produto esperado |
| Genomas | Regulação E Transferência Horizontal | Regulação, HGT, RNA-seq e causalidade | HGT é nomeado, mas não mecanizado | Comparar transferência vertical/horizontal com rede gênica |
| Integração | Sinalização E Receptores | Ligante, receptor, transdução e feedback | Contém texto de hardware deslocado | Remover contaminação e adicionar curva dose–resposta |
| Integração | Ciclo Celular E Morte | Estados celulares, feedback e evidência | Sem checkpoints, apoptose ou marcadores | Inserir ciclo, checkpoint e distinção apoptose/necrose |
| Integração | Imunidade E Diferenciação | Resposta, diferenciação e evidência | Mistura cadeia viral com tema celular; sem caso | Escolher caso imunológico e separar níveis de evidência |
| Síntese | Desenho Experimental | Observação, hipótese, experimento e replicação | Sem caso concreto, fórmula ou dados | Transformar em protocolo executável e auditável |
| Síntese | Microscopia E Métodos Moleculares | Imagem, métodos moleculares e metadados | Sem pipeline, controle ou resultado | Adicionar pipeline de dados públicos e controle negativo |
| Síntese | Estudo De Caso E Incerteza | Protocolo, incerteza e síntese | Sem incerteza calculada ou caso nomeado | Incluir propagação de incerteza e análise de sensibilidade |

## Auditoria de exemplos, fórmulas, diagramas e exercícios

### Exemplos

Os exemplos são quase sempre instruções para o leitor formular uma pergunta, declarar variável independente, escolher controle e prever resultado. Isso é uma boa moldura de investigação, mas não é ainda um exemplo trabalhado: faltam organismo ou sistema, valores, dados, procedimento, resultado e interpretação. O livro promete “definição, mecanismo, aplicação e limite”, porém muitos blocos entregam apenas definição genérica e metacomentário sobre como escrever uma resposta.

**Recomendação:** cada subseção deve ter ao menos um caso trabalhado com quatro partes: hipótese mecanística, observação esperada, resultado alternativo e limite de inferência. Dados públicos ou simulações são preferíveis a cultivo doméstico.

### Fórmulas

#### Energia de Gibbs

A expressão `ΔG = ΔH − TΔS` é correta como relação entre energia de Gibbs, entalpia, temperatura termodinâmica e entropia [7]. O livro deve definir todos os símbolos e evitar a interpretação simplista “`ΔG < 0` significa que a reação ocorre rapidamente”. Para uma aplicação celular, vale mostrar energia de reação e acoplamento, além da dependência de composição por `RT ln Q`.

#### Membrana neuronal

A expressão `C_m dV/dt = −I_ion + I_ext` é uma forma correta de balanço de corrente, desde que as grandezas tenham dimensões compatíveis. Uma versão didática mínima poderia definir:

```text
C_m dV/dt = -(I_L + I_Na + I_K) + I_ext
I_L  = g_L (V - E_L)
I_Na = g_Na m^3 h (V - E_Na)
I_K  = g_K n^4 (V - E_K)
```

A forma expandida não deve ser apresentada como se fosse a única biologia possível. Ela serve para mostrar por que o modelo integrate-and-fire perde variáveis de condução e dinâmica de canais [11] [12].

### Diagramas e imagens

O único diagrama propriamente dito é o SVG do mapa da vida microscópica. Os dois SVGs restantes são imagens locais descritas como esquemas, mas visualmente funcionam como capas tipográficas. O arquivo `image-rights.json` registra autoria de projeto para `cover.svg`, `cell-schematic.svg` e `neuron.svg`, e fontes externas para os retratos de Leeuwenhoek e Margulis. Para os retratos, a licença está explicitamente como “verify”, portanto a redistribuição ainda depende de conferência da licença específica.

**Recomendação:** não usar um alt que enumere estruturas não visíveis. Ou a imagem deve ser redesenhada para conter as estruturas, ou o alt/legenda deve ser reduzido ao que realmente aparece. Para cada retrato, preservar URL direta, autor/fotógrafo quando conhecido, licença e data de acesso.

### Exercícios

Os 42 exercícios são aceitos pelo bloco oficial `exercise`, cuja solução é corretamente armazenada em `solutionBlocks`. Cada subseção contém um exercício local, portanto a regra de validação de “subseção sem exercício” é atendida. A auditoria semântica encontra, entretanto, três problemas:

- Enunciados de 30 exercícios de subseção têm a mesma forma e não fornecem dois casos concretos para comparar.
- As 42 soluções têm somente um bloco de parágrafo; muitas são intercambiáveis entre temas.
- Os exercícios de biocomputação, RNA-seq, ecologia, pH, redox e vírus não exigem execução, cálculo ou dados, apesar de o livro reivindicar foco em métodos e evidência.

**Recomendação:** manter o bloco expansível, mas diversificar formatos. Incluir pelo menos um cálculo, uma interpretação de figura, uma depuração de código, uma análise de tabela e uma crítica de desenho por seção. Soluções devem mostrar desenvolvimento, não somente critérios abstratos.

## Biologia: projeto grande e reproduzível de simulação de evolução em C++

A ausência de uma simulação executável é uma lacuna importante. A proposta abaixo é segura porque modela populações abstratas e não requer cultivo, patógenos ou engenharia biológica. Ela pode ser incorporada à seção “Métodos, síntese e aplicações” ou à subseção “Regulação E Transferência Horizontal” como uma simulação de dinâmica evolutiva, sem alegar que o modelo representa um organismo específico.

### Objetivo

Simular, em uma população diploide finita, a frequência de um alelo ao longo de gerações sob deriva genética, seleção, mutação e migração. Repetir o experimento com várias réplicas para estimar média, desvio-padrão, heterozigosidade esperada, fixação e perda. O núcleo neutro deve reproduzir o modelo Wright–Fisher: a geração seguinte é amostrada com reposição a partir de `2N` cópias gênicas [15].

### Modelo

Para a réplica `r` na geração `t`, seja `p_t` a frequência do alelo A.

1. **Seleção simplificada:** para aptidão relativa `1+s` de A e `1` de a,
   `p_sel = p_t(1+s) / (1 + s p_t)`.
2. **Migração:** com taxa `m` e frequência de migrantes `p_m`,
   `p_mig = (1−m)p_sel + m p_m`.
3. **Mutação bidirecional:** com taxas `u` de A→a e `v` de a→A,
   `p_mut = (1−u)p_mig + v(1−p_mig)`.
4. **Amostragem Wright–Fisher:**
   `X_{t+1} ~ Binomial(2N, p_mut)` e `p_{t+1}=X_{t+1}/(2N)`.
5. **Heterozigosidade esperada:** `H_t = 2p_t(1−p_t)`.

O modelo neutro deve ser executado com `s=u=v=m=0`. A expectativa qualitativa é que populações menores sofram deriva mais forte e atinjam fixação ou perda mais rapidamente. Não se deve comparar uma única trajetória com uma conclusão geral; são necessárias réplicas e um relatório de sementes, parâmetros e ambiente.

### Estrutura de projeto proposta

```text
evolution-sim/
  README.md
  CMakeLists.txt
  src/evolution_sim.cpp
  config/neutral.txt
  config/selection.txt
  scripts/plot.py
  results/.gitkeep
```

O programa deve escrever:

- `trajectory.csv`: geração, frequência média, desvio-padrão, heterozigosidade média, fixações e perdas;
- `summary.csv`: frequência final e estado de cada réplica;
- `config.txt`: todos os parâmetros e a semente;
- opcionalmente, um arquivo de metadados com versão do compilador e sistema operacional.

### Implementação C++17

O código abaixo é uma implementação compacta, mas completa, do núcleo. Ele recebe `N`, número de gerações, número de réplicas, semente e prefixo de saída na linha de comando. O valor inicial é `p0=0,5`; seleção, mutação e migração ficam em valores explícitos no arquivo de configuração gerado e podem ser expostos como argumentos em uma extensão posterior.

```cpp
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <random>
#include <string>
#include <vector>

struct Config {
  std::uint64_t N = 100, generations = 500, replicates = 100;
  double p0 = 0.5, selection = 0.01;
  double mutation_forward = 1e-4, mutation_backward = 1e-4;
  double migration = 0.0, migrant_frequency = 0.5;
  std::uint64_t seed = 20260924;
  std::string output = "evolution";
};

static double clamp01(double x) {
  return std::max(0.0, std::min(1.0, x));
}

static double apply_selection(double p, double s) {
  const double w = 1.0 + s;
  const double mean_w = (1.0 - p) + p * w;
  return clamp01(mean_w > 0.0 ? p * w / mean_w : p);
}

static double deterministic_step(double p, const Config& c) {
  p = apply_selection(p, c.selection);
  p = (1.0 - c.migration) * p + c.migration * c.migrant_frequency;
  p = (1.0 - c.mutation_forward) * p
      + c.mutation_backward * (1.0 - p);
  return clamp01(p);
}

int main(int argc, char** argv) {
  Config c;
  if (argc > 1) c.N = std::stoull(argv[1]);
  if (argc > 2) c.generations = std::stoull(argv[2]);
  if (argc > 3) c.replicates = std::stoull(argv[3]);
  if (argc > 4) c.seed = std::stoull(argv[4]);
  if (argc > 5) c.output = argv[5];
  if (c.N == 0 || c.replicates == 0) return 2;

  std::ofstream trajectory(c.output + "_trajectory.csv");
  std::ofstream summary(c.output + "_summary.csv");
  std::ofstream metadata(c.output + "_config.txt");
  if (!trajectory || !summary || !metadata) return 3;
  trajectory << "generation,mean_frequency,sd_frequency,"
             << "mean_heterozygosity,fixations,losses\n";
  summary << "replicate,final_frequency,fixated,lost\n";
  metadata << "N=" << c.N << "\ngenerations=" << c.generations
           << "\nreplicates=" << c.replicates << "\np0=" << c.p0
           << "\nselection=" << c.selection
           << "\nmutation_forward=" << c.mutation_forward
           << "\nmutation_backward=" << c.mutation_backward
           << "\nmigration=" << c.migration
           << "\nmigrant_frequency=" << c.migrant_frequency
           << "\nseed=" << c.seed << "\n";

  std::mt19937_64 rng(c.seed);
  const std::uint64_t copies = 2 * c.N;
  std::vector<double> p(c.replicates, c.p0);

  for (std::uint64_t t = 0; t <= c.generations; ++t) {
    double mean = 0.0, mean2 = 0.0, mean_h = 0.0;
    std::uint64_t fixed = 0, lost = 0;
    for (double x : p) {
      mean += x; mean2 += x * x; mean_h += 2.0 * x * (1.0 - x);
      fixed += (x >= 1.0); lost += (x <= 0.0);
    }
    const double R = static_cast<double>(c.replicates);
    mean /= R; mean2 /= R; mean_h /= R;
    const double variance = std::max(0.0, mean2 - mean * mean);
    trajectory << t << ',' << std::setprecision(12) << mean << ','
               << std::sqrt(variance) << ',' << mean_h << ','
               << fixed << ',' << lost << '\n';
    if (t == c.generations) break;

    for (double& x : p) {
      const double q = deterministic_step(x, c);
      std::binomial_distribution<std::uint64_t> draw(copies, q);
      x = static_cast<double>(draw(rng)) / static_cast<double>(copies);
    }
  }

  for (std::uint64_t r = 0; r < c.replicates; ++r) {
    summary << r << ',' << std::setprecision(12) << p[r] << ','
            << (p[r] >= 1.0) << ',' << (p[r] <= 0.0) << '\n';
  }
}
```

### Reprodução e testes

Em um ambiente com compilador C++17, a execução mínima é:

```bash
g++ -std=c++17 -O2 -Wall -Wextra -pedantic evolution_sim.cpp -o evolution_sim
./evolution_sim 100 500 100 20260924 neutral
```

O protocolo de validação deve incluir:

1. **Teste determinístico:** mesma semente e mesmos parâmetros devem produzir os mesmos CSVs.
2. **Teste neutro:** com `s=0`, `u=v=m=0`, comparar média entre muitas réplicas com a expectativa neutra aproximada e registrar fixação/perda.
3. **Teste de seleção:** `s>0` deve aumentar a frequência média em relação ao cenário neutro em réplicas suficientes, sem garantia de monotonicidade em cada trajetória.
4. **Teste de mutação:** taxas simétricas devem impedir absorção permanente em execuções longas, dentro da variabilidade amostral.
5. **Teste de tamanho populacional:** reduzir `N` deve aumentar a variância entre réplicas.
6. **Teste de ambiente:** registrar compilador, versão, arquitetura, parâmetros e semente. A captura de ambiente é necessária para reprodução computacional [17].

**Limitação operacional desta auditoria:** o ambiente de execução não tinha `g++`, `clang++` ou `c++`, portanto o código não pôde ser compilado localmente. O relatório não afirma que a implementação foi executada; afirma apenas que a especificação e o código foram escritos para C++17 e que a execução de validação acima deve ser feita em um ambiente com compilador instalado.

## Computação quântica: resultado da verificação de escopo

Foi feita uma busca textual nos 11 JSONs do pacote por “quantum”, “qubit”, “Qiskit” e “computação quântica”. Não houve ocorrência. As únicas fórmulas no pacote são biológicas: Gibbs e balanço de corrente neuronal. Assim, **não há fórmula nem implementação de computação quântica neste livro para validar**. Auditar o livro `computacao-quantica` violaria o escopo exclusivo solicitado.

Para uma futura expansão, a verificação mínima deve incluir:

- estado de um qubit `|ψ⟩ = α|0⟩ + β|1⟩`, com `|α|²+|β|²=1`;
- regra de Born para medição na base computacional;
- matrizes e convenções das portas `X`, `H` e `CX`;
- ordem do produto tensorial e endianness entre fórmula, diagrama e código;
- circuito Qiskit que gere, simule e meça o estado, conferindo contagens e semente quando aplicável.

A lição oficial da IBM apresenta a normalização do qubit, as matrizes de `X` e `H`, superposição, medição, emaranhamento e circuitos [13]. A documentação da API define `QuantumCircuit`, inclusão de portas, `cx`, medição e desenho do circuito [14]. Essas fontes são adequadas para uma futura auditoria, mas não constituem achados sobre este pacote de biologia.

## Achados comprovados versus recomendações

### Achados comprovados

- O validador oficial retorna zero erros e zero avisos para todos os livros, incluindo este pacote.
- O manifesto do pacote lista 11 seções em ordem não numérica e repete os números 2 e 5.
- Existem 32 subseções, 42 exercícios, 30 blocos de código, 2 fórmulas, 1 SVG conceitual e 2 imagens SVG locais.
- Os IDs de seção e subseção são únicos e válidos.
- Os dois assets `images/cell-schematic.svg` e `images/neuron.svg` existem, mas o conteúdo visual é tipográfico/decorativo e não corresponde integralmente às estruturas descritas nas legendas.
- As subseções legadas “Fluxo de energia e informação” e “Do potencial de membrana ao modelo computacional” não têm o conjunto de metadados visuais das demais subseções.
- As soluções dos exercícios estão em `solutionBlocks` e são aceitas pelo bloco oficial `exercise`.
- O padrão de enunciado e solução genéricos se repete por dezenas de blocos.
- O texto de hardware aparece em “Biossegurança E Ética”, “Desenho Experimental”, “Microscopia E Dados Públicos” e “Sinalização E Receptores”.
- Não há ocorrência de computação quântica no pacote.
- A seção de referências tem nove itens e não há citações numéricas inline nos capítulos.
- `image-rights.json` existe e contém registros para capa, SVGs e retratos; as licenças dos dois retratos externos ainda estão descritas como algo a verificar.

### Recomendações

- Renumerar e reordenar seções; preencher `number`, `tag` e `accent` de subseções legadas.
- Substituir ou redesenhar as duas imagens decorativas para que o alt e a legenda descrevam o que está realmente visível.
- Diferenciar protistas como categoria didática heterogênea, não como ramo equivalente aos outros grupos.
- Inserir fontes canônicas inline e referências para todas as fórmulas e métodos.
- Transformar o molde de investigação em exemplos resolvidos com dados e limites reais.
- Criar exercícios específicos de cálculo, interpretação, código, tabela e desenho experimental.
- Remover todas as frases de hardware e substituí-las por requisitos biológicos observáveis.
- Expandir a seção de vírus com release ICTV, método de detecção e distinção entre antimicrobianos.
- Expandir RNA-seq com planejamento de replicatas, normalização, lote, FDR e interpretação causal limitada.
- Adicionar a simulação evolutiva em C++ com semente, configuração, CSV, testes e ambiente registrado.
- Manter computação quântica fora deste livro ou criar capítulo explicitamente delimitado e auditá-lo como projeto separado.

## Prioridade de correção

**P0 — antes de publicação:** corrigir ordem e numeração do manifesto; remover texto de hardware; alinhar alt/legenda às imagens; inserir citações e conferir licenças externas; decidir o estatuto de protistas.

**P1 — revisão didática:** substituir exemplos genéricos por casos trabalhados; definir símbolos e unidades das duas fórmulas; escrever soluções específicas; fornecer diagramas científicos legíveis.

**P2 — aprofundamento:** incorporar o projeto C++ de evolução, uma atividade de RNA-seq com dados públicos, um modelo neuronal executável e métricas de avaliação. Só depois considerar qualquer extensão a computação quântica.

## Referências

[1]: https://ictv.global/taxonomy "ICTV Taxonomy Browser — current virus taxonomy release"
[2]: https://openstax.org/books/biology-2e/pages/22-2-structure-of-prokaryotes-bacteria-and-archaea "OpenStax Biology 2e — Structure of Prokaryotes: Bacteria and Archaea"
[3]: https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi "OpenStax Biology 2e — Characteristics of Fungi"
[4]: https://openstax.org/books/biology-2e/pages/23-2-characteristics-of-protists "OpenStax Biology 2e — Characteristics of Protists"
[5]: https://openstax.org/books/biology-2e/pages/21-1-viral-evolution-morphology-and-classification "OpenStax Biology 2e — Viral Evolution, Morphology, and Classification"
[6]: https://openstax.org/books/anatomy-and-physiology-2e/pages/3-1-the-cell-membrane "OpenStax Anatomy and Physiology 2e — The Cell Membrane"
[7]: https://goldbook.iupac.org/terms/view/G02629 "IUPAC Gold Book — Gibbs energy"
[8]: https://doi.org/10.1261/rna.053959.115 "Schurch et al. — How many biological replicates are needed in an RNA-seq experiment"
[9]: https://doi.org/10.1101/cshperspect.a018036 "Daubin and Szöllősi — Horizontal Gene Transfer and the History of Life"
[10]: https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential "OpenStax Anatomy and Physiology 2e — The Action Potential"
[11]: https://doi.org/10.1113/jphysiol.1952.sp004764 "Hodgkin and Huxley — A quantitative description of membrane current and its application to conduction and excitation in nerve"
[12]: https://pubmed.ncbi.nlm.nih.gov/16622699/ "Burkitt — A review of the integrate-and-fire neuron model"
[13]: https://quantum.cloud.ibm.com/learning/en/courses/utility-scale-quantum-computing/bits-gates-and-circuits "IBM Quantum Learning — Bits, gates, and circuits"
[14]: https://quantum.cloud.ibm.com/docs/api/qiskit/qiskit.circuit.QuantumCircuit "IBM Quantum Documentation — QuantumCircuit API"
[15]: https://doi.org/10.1007/s12064-012-0170-3 "Tran, Hofrichter and Jost — An introduction to the mathematical structure of the Wright–Fisher model of population genetics"
[16]: https://www.who.int/publications/i/item/9789240011311 "World Health Organization — Laboratory biosafety manual, 4th edition"
[17]: https://book.the-turing-way.org/reproducible-research/renv/ "The Turing Way — Reproducible Environments"
[18]: https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance "World Health Organization — Antimicrobial resistance"

---

**Conclusão:** o livro tem uma arquitetura de blocos coerente e bons princípios de cautela, mas seu estado atual é de **rascunho estruturado**, não de manual revisado. A validação formal passou; a revisão científica, editorial e pedagógica ainda é necessária.
