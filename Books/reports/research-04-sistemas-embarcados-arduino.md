# Auditoria do livro “Sistemas Embarcados com Arduino”

**Repositório auditado:** `/home/ubuntu/biblio-ai`  
**Pacote auditado exclusivamente:** `content/packages/sistemas-embarcados-arduino/`  
**Data da auditoria:** 24 de setembro de 2026  
**Escopo:** `docs/FORMATO-DO-LIVRO.md`, `docs/ARQUITETURA.md`, `docs/REFERENCIAS-REVISAO.md`, o `manifest.json`, o `header.json` e os 14 JSONs em `sections/`. Nenhum arquivo do livro foi editado.

## Resumo executivo

O pacote é **válido como JSON e compatível com o validador do repositório**, mas ainda não é uma edição técnica pronta para publicação. O validador oficial terminou com **0 erros e 0 avisos**, e a checagem estrutural independente encontrou 14 seções, 45 subseções, 58 exercícios, 41 blocos de código, 5 tabelas, 3 fórmulas e 1 diagrama Mermaid sem falhas de schema, campos obrigatórios, IDs duplicados ou ativos locais ausentes. Esse resultado comprova apenas conformidade estrutural; não comprova profundidade, precisão ou reprodutibilidade.

O problema principal é editorial e pedagógico. Grande parte das subseções repete o mesmo molde: duas frases genéricas sobre requisitos, um callout de “Critério acadêmico”, um callout de “Ideia central”, o código abstrato `read_input(); update_state(now); ...` e um exercício do tipo “Projete um teste local”. Em consequência, os títulos cobrem o currículo esperado, mas muitos exemplos não ensinam o mecanismo nomeado, as fórmulas quase não existem e os exercícios não fornecem dados suficientes para uma solução verificável.

Há dois achados objetivos de alta prioridade. Primeiro, a lista do manifesto não é numerada monotonicamente: depois da seção 11 aparecem novamente as seções 4 e 11, seguidas da 12. Segundo, o exemplo de temporização com `millis()` usa `if (now >= nextSample)` e `nextSample = now + period`, sem tratar o rollover documentado de `millis()` nem declarar a política de perda ou recuperação de períodos. A documentação oficial informa que `millis()` volta a zero aproximadamente após 50 dias e recomenda cuidado com aritmética de tipos inteiros [4].

O conteúdo conceitual básico é, em geral, plausível: a descrição da Arduino UNO R3 coincide com a documentação oficial — ATmega328P, 14 I/O digitais, 6 saídas PWM, 6 entradas analógicas e ressonador de 16 MHz [2] — e as relações de Ohm e potência estão algebricamente corretas sob hipóteses apropriadas. Contudo, o livro precisa declarar essas hipóteses, diferenciar garantia do padrão de comportamento de uma ferramenta e fornecer exemplos numéricos que possam ser executados e medidos.

Não há biologia nem computação quântica no pacote auditado. Portanto, não seria correto atribuir ao livro fórmulas ou implementações desses domínios. Para atender à solicitação explícita sem ampliar silenciosamente o escopo, este relatório inclui, em seções separadas e marcadas como **recomendação fora do escopo atual**, um projeto grande e reproduzível de simulação evolutiva em C++ e um controle de consistência para fórmulas e implementação quânticas. O pacote `computacao-quantica` e o pacote `reinos-microscopicos` não foram auditados como livros, pois isso violaria o escopo exclusivo solicitado.

## 1. Critério de avaliação e evidência

A estrutura foi comparada com o contrato descrito em `docs/FORMATO-DO-LIVRO.md`: pacote com manifesto, cabeçalho e seções; IDs únicos em minúsculas, números e hífens; blocos tipados; linguagens de código permitidas; campos obrigatórios de fórmulas, tabelas, exercícios e diagramas. A arquitetura em `docs/ARQUITETURA.md` foi usada para verificar que o conteúdo segue a representação por blocos tipados e não HTML cru. O guia `docs/REFERENCIAS-REVISAO.md` foi usado como critério de rastreabilidade e atualização de fontes.

A validação oficial foi executada com `node tools/validate.js`. O resultado registrado foi `sistemas-embarcados-arduino (14 seções) — OK`, com `0 erro(s), 0 aviso(s) no total`. A inspeção também verificou sintaxe JSON, existência dos 14 caminhos do manifesto, unicidade e formato dos IDs e existência de `cover.svg` e das duas imagens históricas. Esses são **achados comprovados no repositório**.

Para a correção técnica, foram consultadas fontes canônicas ou institucionais. A referência oficial Arduino documenta a separação entre funções, variáveis e estrutura da linguagem e lista I/O digital, I/O analógico, interrupções, tempo, SPI, Serial e Wire [1]. O datasheet da Microchip confirma os recursos do ATmega328P, incluindo 32 KB de Flash, 2 KB de SRAM, 1 KB de EEPROM, ADC de 10 bits, USART, SPI, interface de dois fios, watchdog e tensão de operação dependente da condição de frequência [3]. As demais fontes estão listadas ao final.

## 2. Achados comprovados

### 2.1 Identidade, ordem e contrato do pacote

O `manifest.json` declara corretamente `books.package.v2`, `book-package`, o ID `sistemas-embarcados-arduino`, idioma `pt-BR`, o cabeçalho e 14 caminhos de seção. O `header.json` declara `books.header.v2`, `book-header`, título, subtítulo, texto de estudo, capa 16:9 e rodapé. A capa declarada existe. O campo `legend` vazio é permitido pelo formato, embora reduza a utilidade visual do cabeçalho.

O achado estrutural confirmado é a numeração das seções. A ordem do manifesto e os números presentes são:

| Ordem no manifesto | Arquivo | Número declarado |
|---:|---|---:|
| 1–11 | fundamentos até referências | 1–11 |
| 12 | `cadeia-ferramentas.json` | **4** |
| 13 | `verificacao-validacao.json` | **11** |
| 14 | `robustez-ciclo-vida.json` | 12 |

Assim, “C embarcado e cadeia de ferramentas” aparece depois de “Referências oficiais”, mas conserva o número 4, e “Verificação, depuração e validação” repete o número 11. Isso pode produzir sumário e navegação ambíguos mesmo com o validador estrutural verde. É um **defeito comprovado**, não apenas uma recomendação estilística.

As 45 subseções têm IDs únicos e válidos. Porém, 44 delas deixam `number` vazio; somente o capstone declara `10.4`. Como `number` é opcional no schema, isso não é erro de validação. É, contudo, uma inconsistência editorial: os cartões usam tags `01`, `02`, `03`, enquanto a numeração formal não aparece. Os títulos também alternam palavras com capitalização inglesa, como “E”, “De”, “Rtos”, “Isr”, “Hal” e “Wcet”. Recomenda-se padronizar a capitalização em português e preencher a numeração ou remover a expectativa de numeração do layout.

### 2.2 Conteúdo, exemplos e exercícios

A coleção tem boa amplitude temática, mas a profundidade é irregular. Os blocos introdutórios e as quatro primeiras seções usam exemplos concretos de Arduino, divisor de tensão, semáforo, ADC e ISR. A partir das subseções repetitivas, a maioria dos “exemplos trabalhados” é apenas um pedido para o leitor descrever um sistema; o código fornecido é um pseudocódigo de quatro chamadas que não implementa o conceito do título.

Os 58 exercícios são uma força formal do pacote, mas 41 são variantes de um mesmo enunciado R1, com o padrão “informe os requisitos mensuráveis e descreva uma falha”. A solução normalmente repete “entrada, saída esperada, limite temporal e critério de falha”. Isso fornece uma rubrica de resposta, mas não um problema reprodutível com parâmetros, dados, saída esperada e teste automatizado. Os exercícios iniciais são mais efetivos: divisor de 5 V para 2 V, conversão de semáforo para máquina de estados, comunicação ISR–loop, estratégia de testes de sensor e projeto OTA.

### 2.3 Fórmulas

Há somente três fórmulas em todo o livro:

1. `V = R I`. Está correta para um elemento ôhmico no regime considerado. Deve ser acompanhada da hipótese de resistência constante e de uma nota de que dispositivos não lineares e circuitos AC com impedância não são descritos integralmente por essa forma.
2. `P = V I = I^2 R = V^2/R`. Está correta para resistor sob as mesmas hipóteses. Em AC, a potência ativa deve ser distinguida de potência aparente e reativa; em sinais variáveis, a forma instantânea e os valores RMS precisam ser declarados.
3. `T_resposta = T_latencia + T_ISR + T_processamento`. É um orçamento serial útil como primeira aproximação. Não é uma fórmula universal para sistemas com preempção, filas, bloqueio, DMA, cache, concorrência ou retransmissão. Deve ser rotulada como limite ou decomposição sob hipóteses explícitas.

A seção de ADC não fornece a relação de quantização, por exemplo `LSB = Vref/(2^N-1)` para a convenção adotada, nem converte um código de ADC em tensão. A seção de amostragem menciona aliasing, mas não apresenta `f_s > 2B` nem um sinal que demonstre a ambiguidade espectral. A fonte de Berkeley explica que a reconstrução ideal exige banda limitada e que componentes acima da banda provocam aliasing [5]. A seção de ponto fixo não apresenta escala Q, erro de arredondamento, saturação ou overflow. RTOS não apresenta equações de utilização, resposta ou análise de prioridades. Essas ausências são recomendações técnicas de alta prioridade.

### 2.4 Diagramas e tabelas

Há cinco tabelas e um único diagrama Mermaid. As tabelas de interfaces, famílias de arquitetura e comparação Arduino/RTOS são legíveis, porém qualitativas. O capstone possui a melhor instrumentação: período de amostragem de 2 ms, jitter de 0,5 ms, deadline de 1 ms, fila de 32 mensagens, timeout de 100 ms, detecção de brownout e rollback. A tabela deve separar requisito, método de medição, tolerância, amostra mínima e critério de aprovação para ser evidência, não apenas orçamento inicial.

O diagrama do capstone separa ISR, fila, controle, HAL, telemetria, rede, watchdog e bootloader. A direção é didaticamente adequada, mas o nó `SAFE` aponta diretamente para o controle sem indicar quem detecta, quem arbitra a transição ou como o atuador entra no estado seguro. Também não representa armazenamento, confirmação de imagem e origem das chaves. Recomenda-se acrescentar os caminhos de erro e a relação entre imagem primária, slot secundário e confirmação.

### 2.5 Código e implementação

O sketch com `millis()` é o único exemplo de código introdutório não abstrato. O padrão Arduino realmente oferece `setup()`, `loop()`, `millis()`, I/O, ADC e comunicação [1]. Entretanto, o trecho:

```cpp
if (now >= nextSample) {
  nextSample = now + period;
  sampleSensor();
}
```

não é seguro após o rollover de `millis()`. A documentação oficial informa o retorno a zero após aproximadamente 50 dias e alerta para aritmética com tipos menores [4]. Um padrão mais robusto para tarefas periódicas é:

```cpp
const unsigned long period = 1000;
unsigned long lastSample = 0;

void loop() {
  const unsigned long now = millis();
  if ((unsigned long)(now - lastSample) >= period) {
    lastSample += period;       // preserva a fase; use now se quiser descartar atraso
    sampleSensor();
  }
  serviceCommunication();
}
```

A decisão entre preservar fase, executar uma única amostra atrasada ou recuperar múltiplos períodos precisa ser explicitada. O exemplo não declara placa, frequência, custo de `sampleSensor()` nem comportamento sob atraso.

O código do capstone usa APIs plausíveis de FreeRTOS, mas não é compilável como está: `sample_t`, `samples`, `adc_read_minimal`, `sensor_is_valid`, `actuator_safe_output`, `actuator_write` e `control_step` não são definidos. A chamada `xQueueSendFromISR` ignora o retorno e, portanto, não registra fila cheia, embora a tabela exija contador de descarte. `state` é marcado como `volatile`; isso não oferece atomicidade nem sincronização entre threads. A semântica de `volatile` não substitui atômicos ou primitivas de sincronização em C++ [6]. O estado também não retorna explicitamente de `DEGRADED` a `RUNNING` após recuperação. Esses pontos precisam ser corrigidos antes de chamar o exemplo de referência executável.

### 2.6 Referências e proveniência

`referencias.json` contém oito itens, mas apenas sete URLs distintas, porque a introdução do Zephyr aparece duas vezes. As fontes são principalmente oficiais de Arduino, Zephyr, FreeRTOS e Arm. Faltam referências canônicas para Microchip/ATmega328P, RISC-V, NIST IoT, MCUboot, especificações de I2C/SPI/UART, linguagem C/C++, amostragem e teste de software. Também faltam versão, data de acesso e escopo da afirmação.

As seções não têm referências locais associadas; toda a rastreabilidade está concentrada em uma seção final. Isso é válido para o schema, mas fraco para revisão: um leitor não sabe qual fonte sustenta uma afirmação de interrupção, segurança ou arquitetura. Recomenda-se incluir citações inline nos textos ou um campo de referências por seção, caso o produto editorial aceite essa extensão.

A imagem de Margaret Hamilton tem origem declarada como NASA e a de Massimo Banzi como Maker Faire, mas o próprio `image-rights.json` diz “verify image-specific usage terms”. Isso é uma pendência de licenciamento comprovada no metadado, não um erro de renderização. A legenda alternativa está presente.

## 3. Auditoria por seção e subseção

A tabela abaixo registra todas as 14 seções na ordem declarada pelo manifesto. “Comprovado” descreve o que existe no JSON; “recomendação” descreve o que deve ser aprofundado.

| Seção e número | Conteúdo, exemplo e fórmula | Diagrama, exercícios e referências | Avaliação |
|---|---|---|---|
| 1. Fundamentos de Arduino | Define plataforma, microcontrolador, requisitos, GPIO, datasheet e prototipagem. Tem biografia, distinções corretas entre placa, MCU e firmware. As subseções repetem o esqueleto genérico. | 4 exercícios; nenhum diagrama ou fórmula. Referência indireta à documentação Arduino. | Boa porta de entrada; falta um sketch completo com `pinMode`, leitura, debounce, corrente e teste de placa. |
| 2. Eletricidade, sinais e segurança | Divisor, ADC, referência, resolução, amostragem, filtragem, proteção e ponto fixo. Fórmulas de Ohm e potência corretas sob hipóteses. | 5 exercícios; sem diagrama. Nenhuma fórmula de ADC, Nyquist ou ponto fixo. | Conteúdo essencial, mas subdesenvolvido; adicionar cálculo numérico, carga, tolerância, anti-aliasing e saturação. |
| 3. Programação, sketch e temporização | `setup/loop`, `delay`, `millis`, estados e testes host/placa. Código introdutório é útil, porém vulnerável ao rollover. | 5 exercícios; sem diagrama ou fórmula. | Corrigir temporização e incluir máquina de estados compilável, debounce e teste de rollover. |
| 4. Periféricos e comunicação | ADC, UART, SPI, I2C, timeouts e HAL. Tabela inicial distingue interfaces e riscos. | 5 exercícios; sem diagrama ou fórmula. Referência Arduino é insuficiente para detalhes elétricos de cada barramento. | Boa seleção, pouca operação real; incluir frames, ACK/NACK, pull-ups, chip select, clock stretching, níveis e recuperação. |
| 5. Interrupções, memória e concorrência | ISR, memória, `volatile`, atomicidade, seções críticas e buffer circular. Fórmula de orçamento de resposta. | 4 exercícios; sem diagrama. | Conceitos corretos em alto nível; falta código de buffer SPSC, prova de overflow e distinção `volatile`/atomicidade. |
| 6. Firmware confiável e testável | Camadas, contratos, injeção de falhas, watchdog e atualização. Biografia de Hamilton. | 5 exercícios; sem diagrama ou fórmula. Imagem local existe; licenciamento requer confirmação específica. | Tema adequado ao trabalho profissional, mas os exemplos genéricos não demonstram framework de teste, watchdog ou bootloader. |
| 7. RTOS, tarefas e sistemas reativos | Tarefas, prioridades, filas, mutex, inversão, WCET, jitter e deadlines; tabela Arduino/RTOS. | 4 exercícios; sem diagrama ou fórmula. FreeRTOS e Zephyr são citados. | A comparação é correta como orientação; falta escalonamento passo a passo, cálculo de bloqueio e código compilável. |
| 8. Arquiteturas usadas no mercado | BSP/HAL/drivers, AVR, Cortex-M, RISC-V, bare metal, RTOS, Linux e co-projeto. Tabela de famílias. | 5 exercícios; sem diagrama ou fórmula. | Abrangente, porém superficial e com repetição; associar cada escolha a placas, toolchains, MMU/MPU, energia e casos de uso verificáveis. |
| 9. Conectividade, segurança e atualização | Identidade, boot confiável, chaves, telemetria, OTA, rollback, protocolos e superfície de ataque. | 4 exercícios; sem diagrama ou fórmula. NIST e MCUboot não aparecem nas referências internas. | Direção de segurança correta; falta ameaça formal, anti-rollback, provisionamento, rotação/revogação e teste de energia durante OTA. |
| 10. Projeto integrador e carreira | Requisitos, passos, validação, relatório, manutenção e capstone observável. É a seção mais concreta. | 5 exercícios, uma tabela, um diagrama Mermaid e código C/FreeRTOS. | Melhor seção do livro, mas o capstone precisa compilar, declarar plataforma e fechar inconsistências de fila, estado e watchdog. |
| 11. Referências oficiais | Lista URLs Arduino, Zephyr, FreeRTOS e Arm; recomenda registrar versões. | Lista numerada e callout; sem fórmula ou diagrama. | Duplicata de Zephyr; adicionar fontes de MCU, RISC-V, segurança, atualização, C/C++ e sinais. |
| **4. C embarcado e cadeia de ferramentas** | Ponteiros, `volatile`, tipos, startup, ABI, linker, mapa de memória e binário. | 4 exercícios; 3 códigos genéricos em texto; sem fórmula ou diagrama. Referências ausentes para ABI, linker e padrão C. | **Ordem/número incorretos no manifesto.** Conteúdo precisa de compilação AVR real, `objdump`, linker script e exemplos de seção `.data/.bss`. |
| **11. Verificação, depuração e validação** | Unidade, integração, debugger, trace, cobertura, falhas injetadas e evidência. | 4 exercícios; 3 códigos genéricos; sem fórmula ou diagrama. | **Número duplicado.** Recomenda-se matriz requisito–teste–evidência, comandos de teste e diferença entre verificação e validação. |
| 12. Robustez, energia e ciclo de vida | Baixo consumo, confiabilidade, segurança, atualização, requisitos e manutenção. | 4 exercícios; 3 códigos genéricos; sem fórmula ou diagrama. | Boa extensão de ciclo de vida, mas não há modelo de energia, MTBF/FMEA, brownout ou custo de manutenção trabalhado. |

### 3.1 Subsections de “Fundamentos de Arduino”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Requisitos E Restrições** | O nome é adequado, mas o texto repete a regra “traduzir requisito” e não apresenta uma especificação concreta. | Exemplo é apenas um sistema a ser descrito; código genérico; exercício R1. Criar requisito SMART para LED/sensor com período, energia, falha e aceitação. |
| **Gpio, Datasheet E Temporização** | Cobre a distinção entre API e datasheet, mas não seleciona uma placa/pino real. | Sem fórmula/diagrama; código genérico; R1. Usar UNO R3, limites de corrente e temporizador, citando [2] e [3]. |
| **Arduino Como Plataforma De Prototipagem** | A tese de que Arduino é camada de prototipagem está correta e útil. | Sem fórmula/diagrama; código genérico; R1. Comparar sketch, core, bootloader e firmware bare metal em um caso executável. |

### 3.2 Subseções de “Eletricidade, sinais e segurança”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Divisor de tensão** | É a subseção mais concreta do capítulo; reconhece carga e impedância. | Exercício 2.1 pede 2 V a partir de 5 V e trata carga. Falta a fórmula explícita `Vout = Vin R2/(R1+R2)` e esquema do circuito. |
| **Adc, Referência E Resolução** | O conteúdo menciona referência, resolução e condicionamento, sem quantificar ADC real. | Sem fórmula/diagrama; R1 genérico. Adicionar `N`, `Vref`, LSB, erro de offset/ganho e código `analogRead` para uma placa especificada. |
| **Amostragem E Filtragem** | Identifica aliasing e largura de banda, mas não explica espectro nem filtro. | Sem fórmula/diagrama; R1 genérico. Incluir Nyquist–Shannon, filtro RC com frequência de corte e experimento com seno acima da banda [5]. |
| **Proteção Elétrica E Ponto Fixo** | Mistura proteção de hardware e representação numérica sem conectar os mecanismos. | Sem fórmula/diagrama; R1 genérico. Separar diodo/limitador/brownout de Q-format, saturação, overflow e erro de arredondamento. |

### 3.3 Subseções de “Programação, sketch e temporização”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Máquinas de estados** | Define estados e transições e tem o exercício do semáforo. | Exercício 3.1 tem solução correta em alto nível; sem diagrama/fórmula. Incluir enum, tabela de transição e teste de cada evento. |
| **Superloop E Máquina De Estados** | Título repete parcialmente a subseção anterior; conteúdo volta ao molde genérico. | Código abstrato e R1. Diferenciar superloop cooperativo de FSM e demonstrar duas tarefas com orçamento de execução. |
| **Temporização Não Bloqueante** | Tema relevante e relacionado ao exemplo de `millis()`. | Código no bloco da seção, mas precisa corrigir rollover e atraso acumulado; sem fórmula/diagrama; R1 genérico. |
| **Testes Em Host E Placa** | Afirma a necessidade de dois níveis, sem indicar harness ou ferramenta. | Código abstrato; R1. Adicionar teste host com relógio fake, teste de placa com serial/GPIO e critérios de divergência. |

### 3.4 Subseções de “Periféricos e comunicação”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **ADC e aquisição** | Introduz amostra quantizada, taxa, faixa, ruído e unidade física. | Exercício 4.1 é adequado e pede calibração, incerteza e saturação; sem fórmula/diagrama. Adicionar sensor concreto e conversão numérica. |
| **Uart, Spi E I2C** | O agrupamento é pertinente, mas só repete requisitos e abstrações. | Código genérico; R1. Acrescentar três frames reais, temporização, pull-ups I2C e tratamento de erro. |
| **Timeouts E Recuperação** | Declara o princípio, mas não define timeout absoluto, retry ou backoff. | Código genérico; R1. Implementar máquina de recuperação com limite de tentativas e estado seguro. |
| **Hal E Drivers** | Distingue HAL e driver em termos gerais, sem interface concreta. | Código genérico; R1. Mostrar uma interface C, fake host, driver real e contrato de erro. |

### 3.5 Subseções de “Interrupções, memória e concorrência”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Latência E Isr** | Relaciona ISR, prioridade, atomicidade e regras de compartilhamento. | Fórmula apenas no nível da seção; código genérico; R1. Incluir medição com GPIO/timer e separar latência de execução e throughput, conforme [8]. |
| **Mapa De Memória E Volatile** | Lista Flash, SRAM, stack, heap e registradores, mas não mostra mapa. | Código genérico; R1. Mostrar linker map, endereços e contraexemplo em que `volatile` não corrige corrida, conforme [6]. |
| **Concorrência E Seções Críticas** | Reconhece risco de chamadas não reentrantes, mas não define a seção crítica no AVR. | Código genérico; R1. Criar contador ISR/loop, demonstrar perda de atualização e solução atômica/buffer. |

### 3.6 Subseções de “Firmware confiável e testável”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Testes em camadas** | A separação host–dublê–placa–falha é conceitualmente correta. | Exercício 6.1 é o melhor exemplo do capítulo; não há código/fórmula/diagrama. Fornecer uma matriz de testes com fixtures, oracle e logs. |
| **Contratos De Módulo** | O nome é adequado, mas a subseção não define pré-condição, pós-condição nem erro. | Código genérico; R1. Especificar interface de sensor com unidade, faixa, timeout, erro e propriedade testável. |
| **Testes E Injeção De Falhas** | Menciona falha, mas não distingue falha de hardware, comunicação, software e ambiente. | Código genérico; R1. Incluir injeção controlada e resultado observável, com repetição determinística. |
| **Watchdog E Atualização** | Nome cobre dois mecanismos diferentes; o texto não mostra alimentação supervisionada nem boot. | Código genérico; R1. Separar watchdog de atualização e fornecer teste de travamento, imagem inválida e retorno. |

### 3.7 Subseções de “RTOS, tarefas e sistemas reativos”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Tarefas E Escalonamento** | Afirma corretamente que RTOS não garante determinismo por si só. | Código genérico; R1. Simular três tarefas com períodos, prioridades e linha do tempo; documentar tick e preempção. |
| **Mutex, Fila E Inversão De Prioridade** | O tema está correto, mas não há sequência de baixa/média/alta prioridade. | Código genérico; R1. Demonstrar mutex versus semáforo e herança de prioridade; FreeRTOS informa que sua herança básica minimiza, mas não elimina, inversão [7]. |
| **Wcet, Jitter E Deadlines** | É um título essencial, mas não fornece método para medir ou limitar WCET. | Código genérico; R1. Adicionar GPIO de trace, histogramas, pior caso observado, margem e análise de bloqueio. |

### 3.8 Subseções de “Arquiteturas usadas no mercado”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **BSP, HAL e drivers** | É o único nome curto e claro do grupo; conteúdo define as camadas em alto nível. | Exercício 8.1 é concreto; sem fórmula/diagrama. Mostrar árvore devicetree, BSP e driver real do Zephyr, que documenta suporte a arquiteturas, subsistemas, drivers e devicetree [10]. |
| **Avr, Cortex-M E Risc-V** | O nome cobre três famílias heterogêneas sem declarar critérios comparáveis. | Código genérico; R1. Fixar três alvos, medir Flash/RAM/latência e separar ISA, núcleo, SoC e placa; a especificação RISC-V é uma ISA, não uma placa [9]. |
| **Bare Metal, Rtos E Linux** | A comparação qualitativa é correta, mas “Linux” não é apenas uma camada de drivers. | Código genérico; R1. Comparar MMU/MPU, isolamento, boot, atualização, latência e manutenção com um mesmo requisito. |
| **Co-Projeto Hardware/Software** | O nome é adequado, porém o conteúdo não demonstra trade-off hardware/software. | Código genérico; R1. Criar duas arquiteturas, estimar custo de BOM, energia, latência e risco, e decidir com dados. |

### 3.9 Subseções de “Conectividade, segurança e atualização”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Protocolos E Enquadramento** | Não define campos, CRC, escape, MTU, ACK ou timeout de um protocolo. | Código genérico; R1. Incluir frame binário com versão, tamanho, sequência, CRC, timeout e teste de corrupção. |
| **Ameaças E Superfície De Ataque** | Afirma que conectividade amplia risco, mas não apresenta ameaça, ativo ou adversário. | Código genérico; R1. Usar matriz ativo–ameaça–controle–evidência e citar a linha de base NIST [11]. |
| **Telemetria E Atualização Segura** | A direção de OTA é correta, mas “segura” precisa abranger identidade, assinatura, anti-rollback e revogação. | Código genérico; R1. Separar integridade de autenticidade; o fluxo deve modelar energia interrompida e confirmação de saúde. MCUboot documenta test swap, confirmação e revert [12]. |

### 3.10 Subseções de “Projeto integrador e carreira”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Requisitos Rastreáveis** | Reforça o requisito mensurável, mas não mostra matriz de rastreabilidade. | Código genérico; R1. Adicionar IDs de requisito, teste, evidência, versão e critério de liberação. |
| **Validação De Sistema** | Usa corretamente o vocabulário de validação, mas não distingue claramente verificação de validação. | Código genérico; R1. Fornecer cenário de aceitação, ambiente, dados e decisão passa/falha. |
| **Relatório Técnico E Manutenção** | Tema adequado, sem modelo de relatório ou análise de manutenção. | Código genérico; R1. Incluir histórico de versão, diagnóstico, peças, procedimento de atualização e limitações. |
| **Capstone: produto observável e seguro** | É a subseção mais forte: possui arquitetura, orçamento, instrumentação, falhas, Mermaid, tabela, C e passos. | Exercício 10.4.1 é reproduzível em intenção. Corrigir código não compilável, contar drops de fila, definir `sample_t`, inicializar fila e declarar plataforma/toolchain. |

### 3.11 Seção “Referências oficiais”

A lista é útil como ponto de partida, mas repete Zephyr e não inclui a documentação oficial que sustenta várias afirmações presentes no texto. Deve conter Microchip ATmega328P [3], Arduino UNO R3 [2], RISC-V [9], NIST IR 8259A [11], MCUboot [12], documentação de C/C++ e uma fonte institucional para amostragem [5]. Para cada fonte, registrar título exato, versão ou revisão quando disponível e data de acesso.

### 3.12 Subseções de “C embarcado e cadeia de ferramentas”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Ponteiros, Volatile E Tipos** | O nome é importante, mas o conteúdo não explica aliasing, representação, alinhamento ou registradores. | Código genérico; R1. Incluir ponteiro para registrador, `const volatile`, largura fixa e contraexemplo de corrida. |
| **Startup, Abi E Linker** | O escopo é correto, mas não há startup, ABI ou linker script reais. | Código genérico; R1. Fornecer mapa ELF, vetor de interrupções, cópia `.data`, zeragem `.bss` e flags reproduzíveis. |
| **Mapa De Memória E Binário** | Lista a ideia, sem mapa ou artefato observável. | Código genérico; R1. Incluir `size`, `objdump`, linker map e relação entre Flash, SRAM, stack e heap. |

### 3.13 Subseções de “Verificação, depuração e validação”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Testes De Unidade E Integração** | Distingue unidade por dependências simuladas e integração por periférico real. | Código genérico; R1. Incluir um teste executável com fake de I2C e um teste de hardware-in-the-loop. |
| **Debugger, Trace E Cobertura** | O nome promete ferramentas, mas nenhum comando, trace ou métrica aparece. | Código genérico; R1. Mostrar GDB/OpenOCD ou equivalente, trace de GPIO, cobertura de decisão e limites da cobertura. |
| **Falhas Injetadas E Evidência** | O título é bom, mas o conteúdo não define catálogo de falhas nem evidência mínima. | Código genérico; R1. Apresentar tabela de injeção, observação, requisito coberto e artefato arquivado. |

### 3.14 Subseções de “Robustez, energia e ciclo de vida”

| Subseção | Avaliação do nome e do conteúdo | Exemplo, fórmula, diagrama, exercício e recomendação |
|---|---|---|
| **Baixo Consumo E Confiabilidade** | O conteúdo menciona energia e falha, sem orçamento de corrente ou medição. | Código genérico; R1. Adicionar estados de sono, corrente ativa, energia por ciclo, autonomia e método de medição. |
| **Segurança E Atualização** | Repete o tema da seção 9 e não adiciona mecanismo específico. | Código genérico; R1. Remeter ao capstone e detalhar chave, versão, anti-rollback, revogação e queda de energia. |
| **Requisitos E Manutenção** | Relaciona requisitos e ciclo de vida em termos gerais. | Código genérico; R1. Incluir manutenção preventiva, diagnóstico de campo, compatibilidade e política de fim de suporte. |

## 4. Recomendações priorizadas

### Prioridade P0 — corrigir antes de publicar

1. Corrigir os números duplicados e a ordem do manifesto. Uma ordem pedagógica plausível é recolocar “C embarcado e cadeia de ferramentas” após fundamentos/programação, colocar “Verificação” após firmware, e deixar “Referências” no final.
2. Corrigir o exemplo de `millis()` para rollover e declarar a política de atraso. Testar o caso de wrap-around com relógio fake.
3. Corrigir o código C/FreeRTOS do capstone: definir tipos e handles, verificar retorno de `xQueueSendFromISR`, contar perdas, declarar a fila bounded, definir política de recuperação e substituir `volatile` quando a comunicação exigir sincronização.
4. Fazer uma revisão técnica por plataforma. Toda afirmação sobre pinos, tensão, ADC, corrente, frequência, watchdog, memória ou API deve nomear placa, core, toolchain, versão e datasheet.

### Prioridade P1 — aumentar a qualidade didática

1. Substituir o esqueleto genérico de cada subseção por um caso mínimo correspondente ao título. “Mutex” deve mostrar bloqueio e herança; “linker” deve mostrar um artefato ELF; “I2C” deve mostrar frame e recuperação; “ponto fixo” deve mostrar escala e saturação.
2. Transformar exercícios R1 em experimentos com parâmetros e saída esperada. Cada exercício deve informar entrada, ambiente, procedimento, métrica, tolerância e critério de aprovação.
3. Adicionar fórmulas de ADC, amostragem, filtros, ponto fixo, utilização de CPU, jitter, fila e energia, sempre com símbolos, unidades e hipóteses.
4. Acrescentar diagramas somente onde eles esclarecem uma relação: mapa de memória, cadeia de boot, frame de protocolo, estados de OTA, escalonamento e caminhos de falha.
5. Reescrever os títulos com capitalização portuguesa consistente e preencher `number` ou remover a dependência visual de numeração.

### Prioridade P2 — rastreabilidade e ciclo de vida

1. Expandir “Referências oficiais” com fontes canônicas e retirar a duplicata de Zephyr.
2. Associar cada seção às fontes que sustentam suas afirmações. Uma referência global não permite revisão eficiente.
3. Registrar versões e datas de acesso de Arduino core, FreeRTOS, Zephyr, toolchain e datasheets.
4. Confirmar termos de uso das imagens de NASA e Maker Faire no nível do arquivo, em vez de deixar “verify image-specific usage terms”.

## 5. Projeto recomendado de biologia fora do pacote atual: simulação evolutiva reproduzível em C++

### Limite de escopo

O livro auditado não contém uma seção de biologia. O projeto abaixo é uma recomendação de conteúdo adicional, não um achado sobre o pacote `sistemas-embarcados-arduino`. Ele é deliberadamente reproduzível, local e independente de nuvem, para preservar o padrão de engenharia defendido no livro. O modelo de Wright–Fisher descreve uma população diploide finita, com gerações discretas e amostragem aleatória; a literatura apresenta a forma básica de deriva para dois alelos e população de tamanho fixo [15].

### Objetivo e modelo

Simular a frequência de um alelo `A` ao longo de gerações em uma população diploide de tamanho `N`, permitindo deriva genética, seleção e mutação. Em cada geração, a frequência `p` de `A` determina os genótipos `AA`, `Aa` e `aa`. As aptidões são `1+s`, `1+h*s` e `1`, respectivamente. Após seleção:

```text
w_bar = p²(1+s) + 2p(1-p)(1+h*s) + (1-p)²
p_sel = [p²(1+s) + p(1-p)(1+h*s)] / w_bar
p_mut = p_sel(1-mu) + (1-p_sel)nu
K_next ~ Binomial(2N, p_mut)
p_next = K_next/(2N)
```

`mu` é a taxa de mutação `A -> a`, `nu` é a taxa `a -> A`, e `K_next` representa a amostragem de `2N` cópias gênicas. Com `s=mu=nu=0`, a esperança condicional de `p_next` é `p`, mas a variância de deriva é aproximadamente `p(1-p)/(2N)`. Sem mutação reversa, `p=0` e `p=1` são estados absorventes. O modelo não representa recombinação entre loci, estrutura espacial, idade, sexo, ambiente variável ou seleção dependente de frequência.

### Implementação C++17 autocontida

O seguinte arquivo é suficiente para gerar um CSV determinístico com uma semente fixa. A recomendação editorial é colocá-lo em uma seção própria com testes e um `CMakeLists.txt`; ele não foi gravado no repositório porque a solicitação exigiu auditoria sem editar os arquivos do livro.

```cpp
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>

struct Config {
    int N = 500;
    int generations = 2000;
    int replicates = 100;
    double p0 = 0.10;
    double selection = 0.02;
    double dominance = 0.5;
    double mu = 1e-4; // A -> a
    double nu = 1e-5; // a -> A
    std::uint64_t seed = 123456789ULL;
    std::string output = "evolution.csv";
};

static double read_double(const char* s) { return std::stod(s); }
static int read_int(const char* s) { return std::stoi(s); }

Config parse(int argc, char** argv) {
    Config c;
    for (int i = 1; i < argc; ++i) {
        const std::string a = argv[i];
        auto need = [&](const char* name) -> const char* {
            if (i + 1 >= argc) throw std::runtime_error(std::string("faltou valor para ") + name);
            return argv[++i];
        };
        if (a == "--N") c.N = read_int(need("--N"));
        else if (a == "--generations") c.generations = read_int(need("--generations"));
        else if (a == "--replicates") c.replicates = read_int(need("--replicates"));
        else if (a == "--p0") c.p0 = read_double(need("--p0"));
        else if (a == "--s") c.selection = read_double(need("--s"));
        else if (a == "--h") c.dominance = read_double(need("--h"));
        else if (a == "--mu") c.mu = read_double(need("--mu"));
        else if (a == "--nu") c.nu = read_double(need("--nu"));
        else if (a == "--seed") c.seed = std::stoull(need("--seed"));
        else if (a == "--output") c.output = need("--output");
        else throw std::runtime_error("argumento desconhecido: " + a);
    }
    if (c.N <= 0 || c.generations < 0 || c.replicates <= 0)
        throw std::runtime_error("N, generations e replicates devem ser positivos");
    if (!(c.p0 >= 0.0 && c.p0 <= 1.0)) throw std::runtime_error("p0 fora de [0,1]");
    if (c.mu < 0 || c.mu > 1 || c.nu < 0 || c.nu > 1)
        throw std::runtime_error("taxa de mutação fora de [0,1]");
    if (c.dominance < 0 || c.dominance > 1)
        throw std::runtime_error("h fora de [0,1]");
    return c;
}

double next_frequency(double p, const Config& c, std::mt19937_64& rng) {
    const double q = 1.0 - p;
    const double wAA = 1.0 + c.selection;
    const double wAa = 1.0 + c.dominance * c.selection;
    const double waa = 1.0;
    const double zAA = p * p * wAA;
    const double zAa = 2.0 * p * q * wAa;
    const double zaa = q * q * waa;
    const double mean_w = zAA + zAa + zaa;
    const double p_sel = (zAA + 0.5 * zAa) / mean_w;
    const double p_mut = p_sel * (1.0 - c.mu) + (1.0 - p_sel) * c.nu;
    std::binomial_distribution<int> sample(2 * c.N, p_mut);
    return static_cast<double>(sample(rng)) / static_cast<double>(2 * c.N);
}

int main(int argc, char** argv) {
    try {
        const Config c = parse(argc, argv);
        std::ofstream out(c.output);
        if (!out) throw std::runtime_error("não foi possível abrir " + c.output);
        out << "replicate,generation,p\n" << std::setprecision(17);
        for (int r = 0; r < c.replicates; ++r) {
            // A semente da execução é única e a sequência é registrada no cabeçalho.
            std::mt19937_64 rng(c.seed + static_cast<std::uint64_t>(r));
            double p = c.p0;
            out << r << ",0," << p << "\n";
            for (int g = 1; g <= c.generations; ++g) {
                p = next_frequency(p, c, rng);
                out << r << ',' << g << ',' << p << "\n";
            }
        }
        std::cerr << "seed=" << c.seed << " output=" << c.output << '\n';
    } catch (const std::exception& e) {
        std::cerr << "erro: " << e.what() << '\n';
        return 2;
    }
}
```

Compilação e execução:

```bash
g++ -std=c++17 -O2 -Wall -Wextra -pedantic evolution.cpp -o evolution
./evolution --N 500 --generations 2000 --replicates 100 --p0 0.10 \
  --s 0.02 --h 0.5 --mu 0.0001 --nu 0.00001 \
  --seed 123456789 --output evolution.csv
sha256sum evolution.csv
```

### Plano de reprodução e testes

O experimento deve publicar o commit do compilador, o comando, a semente, a configuração e o hash do CSV. Repetir o mesmo comando deve produzir o mesmo hash em uma mesma implementação padrão; se o projeto precisar de reprodutibilidade entre libstdc++ diferentes, deve publicar também uma versão do gerador e um teste de golden output.

A suíte mínima deve executar cinco cenários. No cenário neutro, usar `s=mu=nu=0`, duas populações grandes e comparar a média de `p` entre réplicas com `p0`; o resultado esperado é aproximadamente constante, enquanto a variância cresce. No cenário de deriva forte, usar `N=20`, `p0=0.5`, sem seleção e medir a fração de réplicas que chega a `0` ou `1`. No cenário de seleção positiva, usar `s>0` e verificar tendência estatística, sem afirmar que toda réplica fixa `A`. No cenário de mutação reversível, usar `mu>0` e `nu>0` e verificar que os extremos deixam de ser absorventes. No cenário de invariantes, verificar em todas as linhas `0 <= p <= 1`, número inteiro implícito de alelos e monotonicidade do contador de geração.

O projeto deve distinguir **simulação populacional** de **algoritmo genético**. O primeiro tenta representar um modelo biológico com hipóteses explícitas; o segundo é uma meta-heurística para otimização. Essa distinção evita que o exercício seja apresentado como evidência experimental de evolução natural.

## 6. Controle de computação quântica fora do pacote atual

O pacote `sistemas-embarcados-arduino` não contém fórmulas, código ou subseções de computação quântica. Logo, não há um erro quântico interno a confirmar. O controle abaixo é uma recomendação para eventual inclusão ou para uma auditoria separada do pacote `computacao-quantica`, que não foi auditado nesta tarefa.

A checagem canônica do IBM Quantum confirma que um qubit pode ser escrito como:

```text
|psi> = alpha|0> + beta|1>,       |alpha|² + |beta|² = 1
```

A porta de Hadamard é:

```text
H = 1/sqrt(2) [[1, 1], [1, -1]]
H|0> = (|0> + |1>)/sqrt(2)
```

Essas fórmulas e a condição de normalização estão corretas [13]. A evolução unitária deve satisfazer `U†U = I`. O relatório editorial deve distinguir estado vetorial, medição probabilística, fase global e ruído; uma medição não “lê” simultaneamente os dois termos da superposição.

A implementação mínima atual, compatível com a API documentada do Qiskit, é:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)
print(qc.draw())
```

A documentação atual de `QuantumCircuit` mostra a criação do circuito e a aplicação de `h`; a classe também oferece `measure` como operação não unitária [14]. Para validar probabilidades, executar muitas amostras e esperar aproximadamente 50% de `0` e 50% de `1`, não uma saída determinística em uma única medição. Se for usado `Statevector`, separar simulação ideal de execução em hardware e registrar a versão de Qiskit. O controle quântico recomendado é, portanto, **fórmula correta, implementação mínima correta, ausência de conteúdo quântico no livro auditado**.

## 7. Conclusão

O pacote tem uma base editorial funcional, uma cobertura temática bem escolhida e um capstone promissor. A validação de schema e a organização por blocos são sólidas. As falhas críticas estão na numeração do manifesto, na repetição de conteúdo, na insuficiência de exemplos executáveis, na falta de fórmulas e na rastreabilidade de referências. O resultado atual é melhor descrito como um **esqueleto curricular técnico com alguns exemplos bons**, não como um livro completo de sistemas embarcados.

A ordem recomendada de trabalho é: corrigir manifesto e exemplo de temporização; tornar o capstone compilável; substituir os esqueletos genéricos por casos correspondentes aos títulos; adicionar fórmulas e medições; transformar os R1 em testes reproduzíveis; e ampliar as referências canônicas. Depois dessas mudanças, repetir o validador oficial e executar os exemplos em pelo menos uma UNO R3 e uma plataforma Cortex-M ou RISC-V declaradas.

## Referências externas canônicas

[1]: https://docs.arduino.cc/language-reference/ "Arduino Language Reference"
[2]: https://docs.arduino.cc/hardware/uno-rev3 "Arduino UNO R3 — documentação oficial"
[3]: https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf "Microchip ATmega328P Datasheet"
[4]: https://docs.arduino.cc/language-reference/en/functions/time/millis/ "Arduino millis() — documentação oficial"
[5]: https://ptolemy.eecs.berkeley.edu/eecs20/week13/nyquistShannon.html "UC Berkeley EECS — The Nyquist–Shannon Sampling Theorem"
[6]: https://en.cppreference.com/w/cpp/language/cv "cppreference — Type qualifiers e volatile"
[7]: https://freertos.org/Documentation/02-Kernel/02-Kernel-features/02-Queues-mutexes-and-semaphores/04-Mutexes "FreeRTOS Mutexes e priority inheritance"
[8]: https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/beginner-guide-on-interrupt-latency-and-interrupt-latency-of-the-arm-cortex-m-processors "Arm — A Beginner’s Guide on Interrupt Latency"
[9]: https://docs.riscv.org/reference/isa/v20260120/unpriv/unpriv-index.html "RISC-V International — Instruction Set Manual, Volume I"
[10]: https://docs.zephyrproject.org/latest/introduction/index.html "Zephyr Project — Introduction"
[11]: https://csrc.nist.gov/pubs/ir/8259/a/final "NIST IR 8259A — IoT Device Cybersecurity Capability Core Baseline"
[12]: https://docs.mcuboot.com/design.html "MCUboot — Design and image swap documentation"
[13]: https://quantum.cloud.ibm.com/learning/en/courses/utility-scale-quantum-computing/bits-gates-and-circuits "IBM Quantum Learning — Bits, gates, and circuits"
[14]: https://quantum.cloud.ibm.com/docs/api/qiskit/qiskit.circuit.QuantumCircuit "IBM Quantum Documentation — QuantumCircuit API"
[15]: https://pmc.ncbi.nlm.nih.gov/articles/PMC4269093/ "Tran, Hofrichter e Jost — An introduction to the mathematical structure of the Wright–Fisher model of population genetics"

### Arquivos internos usados como referência editorial

- `docs/FORMATO-DO-LIVRO.md`
- `docs/ARQUITETURA.md`
- `docs/REFERENCIAS-REVISAO.md`
- `content/packages/sistemas-embarcados-arduino/manifest.json`
- `content/packages/sistemas-embarcados-arduino/header.json`
- `content/packages/sistemas-embarcados-arduino/sections/*.json`
- `content/packages/sistemas-embarcados-arduino/image-rights.json`
- `tools/validate.js`

**Status final:** relatório concluído; nenhum arquivo do livro foi editado.
