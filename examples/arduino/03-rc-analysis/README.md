# Projeto 03 — circuito RC: quando o sinal não é apenas HIGH/LOW

Este diretório complementa o projeto Wokwi com um comportamento analógico. O arquivo `rc-step.cir` é um netlist para ngspice: uma fonte aplica um degrau, `R1` limita a corrente e `C1` armazena carga.

## Executar

Com ngspice instalado:

```bash
ngspice rc-step.cir
```

A constante de tempo é:

```text
τ = R C = 10 000 Ω × 100 µF = 1 s
```

A tensão do capacitor não salta instantaneamente. Para uma carga ideal a partir de 0 V:

```text
V_C(t) = V_final (1 − e^(−t/τ))
```

Depois de uma constante de tempo, o capacitor chega a aproximadamente 63,2% do valor final. Depois de cerca de cinco constantes de tempo, está próximo do regime estacionário. Esse fenômeno é melhor representado por gráfico ou Manim do que por uma captura de um simulador digital.

## Ligação com o Arduino

Um Arduino pode medir `V_C` com um ADC, mas o ADC apenas amostra a tensão e a quantiza. Ele não transforma um circuito analógico em um circuito digital ideal. A leitura depende de referência, resolução, impedância da fonte, taxa de amostragem, ruído e tempo de aquisição.
