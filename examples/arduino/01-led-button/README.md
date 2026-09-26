# Projeto 01 — botão, pull-up e LED no Arduino Uno

Este projeto é a base didática para o capítulo de Arduino. Abra o diretório no [Wokwi](https://wokwi.com/) ou use a extensão do Wokwi no VS Code. O `diagram.json` descreve as peças, suas posições e suas conexões; o `sketch.ino` é o firmware.

O diagrama foi verificado com o Wokwi CLI 0.27.1 usando:

```bash
curl -L https://wokwi.com/ci/install.sh | sh
wokwi-cli lint
```

O resultado esperado é `✓ No issues found`. Esse lint confirma os tipos das peças, IDs duplicados e conexões de pinos. A execução completa do firmware ainda deve ser conferida no editor/simulador Wokwi ou em uma placa real.

## O circuito antes do código

- **Arduino Uno**: fornece o microcontrolador, `5V`, `GND`, pino digital 2 e pino digital 13.
- **Botão**: é uma chave. Quando pressionado, conecta o pino 2 ao `GND`.
- **`INPUT_PULLUP`**: liga um resistor interno entre o pino 2 e `5V`. Sem pressionar, o pino lê `HIGH`; ao pressionar, o caminho para o `GND` domina e o pino lê `LOW`.
- **Resistor de 220 Ω**: limita a corrente do LED. Sem ele, o LED e o pino poderiam receber corrente acima do que o circuito deve suportar.
- **LED**: a corrente convencional entra pelo ânodo (`A`) e sai pelo cátodo (`C`) em direção ao `GND`.
- **`GND`**: é o nó de referência e o caminho de retorno da corrente. Não significa “corrente negativa”; significa potencial de referência do circuito.

A corrente convencional, quando o LED está aceso, segue aproximadamente:

```text
5V interno do pino 13 → pino 13 → resistor → ânodo do LED → cátodo → GND
```

No botão pressionado, o caminho de entrada é:

```text
5V → resistor pull-up interno → pino 2 → botão → GND
```

O elétron tem movimento físico em sentido oposto à corrente convencional. O livro usa a convenção de corrente convencional porque ela é a adotada nos esquemas e na análise de circuitos.

## Passo 1 — abrir o projeto

1. Crie um projeto Arduino Uno no Wokwi.
2. Substitua o `diagram.json` pelo arquivo deste diretório.
3. Cole `sketch.ino` no editor de código.
4. Inicie a simulação.
5. Pressione o botão virtual e observe o LED.

O Wokwi aceita a posição das peças e as conexões no `diagram.json`. Os fios vermelhos, pretos, verdes e laranjas foram escolhidos para tornar os papéis visíveis; a cor do fio não altera a física da simulação.

## Passo 2 — entender cada comando

`const byte PINO_BOTAO = 2;` cria um nome para o número do pino. `const` impede que o valor seja alterado por acidente. `byte` é suficiente para números pequenos de pino.

`pinMode(PINO_BOTAO, INPUT_PULLUP);` configura o pino como entrada e ativa o resistor pull-up interno. A consequência é uma lógica **ativa em nível baixo**: `LOW` significa botão pressionado.

`pinMode(PINO_LED, OUTPUT);` coloca o pino 13 no modo de saída. Nesse modo o microcontrolador tenta dirigir o pino para nível baixo ou alto, respeitando os limites elétricos da placa.

`digitalRead(PINO_BOTAO)` lê o nível lógico do pino. O retorno é `HIGH` ou `LOW`; isso é uma abstração digital de uma tensão que está dentro das faixas válidas do microcontrolador.

`digitalWrite(PINO_LED, HIGH)` solicita nível alto no pino do LED. O resistor em série transforma a diferença de tensão em uma corrente limitada. `digitalWrite(..., LOW)` interrompe o caminho de corrente pelo pino.

`millis()` retorna o tempo decorrido desde o início do programa. O código usa a diferença entre dois valores, em vez de `delay()`, para que o microcontrolador continue executando o `loop()` enquanto espera.

## Passo 3 — por que existe debounce

Um botão mecânico não muda de aberto para fechado uma única vez. Os contatos vibram durante alguns milissegundos. Sem debounce, uma única pressão pode ser interpretada como várias transições.

O algoritmo é:

1. ler o botão;
2. detectar se a leitura mudou em relação à leitura anterior;
3. guardar o instante da mudança;
4. esperar a leitura permanecer diferente por pelo menos 30 ms;
5. aceitar a nova leitura como estado estável;
6. atualizar o LED somente nesse momento.

A expressão `millis() - instanteDaMudanca >= DEBOUNCE_MS` mede o tempo desde a última transição sem bloquear o programa.

## Passo 4 — testar por partes

1. Troque `INPUT_PULLUP` por `INPUT` e observe que a entrada fica flutuante se não houver resistor externo.
2. Remova o resistor de 220 Ω apenas na simulação; entenda que essa não é uma montagem segura para hardware.
3. Troque `PINO_LED` por outro pino e atualize a conexão no `diagram.json`.
4. Aumente `DEBOUNCE_MS` para 200 ms e perceba o atraso intencional.
5. Faça o LED acender quando o botão estiver solto, trocando a comparação `estadoEstavel == LOW` por `estadoEstavel == HIGH`.

## Validação em hardware real

Antes de ligar a placa, confirme no datasheet e no manual da placa a tensão da alimentação, o limite de corrente por pino, a polaridade do LED e o mapa de pinos. Na protoboard, confirme a continuidade dos trilhos: algumas protoboards interrompem o trilho positivo ou negativo no meio. Nunca use a cor do fio como prova de conexão elétrica; siga os nós.

## Relação com os outros visuais

- `../02-protoboard-power/` mostra os nós internos e a rota da corrente sem uma fotografia poluída.
- `../03-rc-analysis/` mostra o caso analógico de carga e descarga de capacitor, que não deve ser reduzido a `HIGH`/`LOW`.
