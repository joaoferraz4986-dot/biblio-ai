# Ferramentas visuais para Arduino

O repositório mantém **projetos e materiais visuais**, não livros prontos. O usuário pode importar os livros que quiser em `content/packages/`.

## Escolha de ferramentas

- **Wokwi**: usado para circuitos digitais executáveis, Arduino Uno, LEDs, botões, sensores, código e conexões. O projeto fica em `examples/arduino/01-led-button/`.
- **SVG autoral**: usado quando a intenção é explicar a topologia da protoboard, a rota da corrente convencional, trilhos positivo/negativo e nós internos sem poluição de uma captura de tela.
- **ngspice + gráfico**: reservado a comportamento analógico, como carga/descarga de capacitor e resposta RC. O Wokwi não deve ser tratado como simulador analógico geral.
- **Manim**: usado para mostrar evolução temporal, estados, sinais e algoritmos. Os projetos Manim do corpus revisado permanecem fora deste repositório vazio.

## Projeto documentado

`examples/arduino/01-led-button/` é um projeto Wokwi completo. Ele contém `diagram.json`, `sketch.ino`, `wokwi.toml` e um guia passo a passo. O circuito usa um Arduino Uno, um botão com pull-up interno e um LED com resistor limitador. O guia explica:

1. identificação de cada peça;
2. nós da protoboard e trilhos de alimentação;
3. caminho da corrente convencional;
4. diferença entre `5V`, `GND`, entrada e saída;
5. cada comando do sketch;
6. debounce por tempo;
7. validação no Wokwi e em hardware real.

`02-protoboard-power/` contém ilustrações SVG limpas dos trilhos e dos nós. `03-rc-analysis/` contém um netlist ngspice para o comportamento analógico RC.

## Fontes consultadas

[1]: https://docs.wokwi.com/diagram-format "Wokwi diagram.json File Format"
[2]: https://docs.wokwi.com/guides/diagram-editor "Wokwi Interactive Diagram Editor"
[3]: https://www.tinkercad.com/circuits "Tinkercad Circuits"
[4]: https://fritzing.org/learning/tutorials/creating-custom-parts "Fritzing — Creating Custom Parts"
[5]: https://docs.arduino.cc/language-reference/en/functions/digital-io/pinMode/ "Arduino pinMode reference"
[6]: https://docs.arduino.cc/language-reference/en/functions/digital-io/digitalWrite/ "Arduino digitalWrite reference"
[7]: https://docs.arduino.cc/language-reference/en/functions/time/millis/ "Arduino millis reference"

O formato Wokwi define peças com `id`, `type`, posição e atributos, e conexões com origem, destino, cor e instruções de roteamento [1]. O editor visual do Wokwi permite adicionar, mover, rotacionar e conectar peças [2]. Fritzing é mantido como alternativa para vistas breadboard, esquema e PCB, especialmente quando a montagem física precisa ser comparada ao esquemático [4].
