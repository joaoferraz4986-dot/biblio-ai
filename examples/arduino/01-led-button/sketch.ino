// Projeto 01 — botão com pull-up interno e LED com resistor limitador.
// O LED acende enquanto o botão está pressionado.
const byte PINO_BOTAO = 2;
const byte PINO_LED = 13;
const unsigned long DEBOUNCE_MS = 30;

bool estadoEstavel = HIGH;
bool ultimaLeitura = HIGH;
unsigned long instanteDaMudanca = 0;

void setup() {
  pinMode(PINO_BOTAO, INPUT_PULLUP);
  pinMode(PINO_LED, OUTPUT);
  digitalWrite(PINO_LED, LOW);
}

void loop() {
  const bool leitura = digitalRead(PINO_BOTAO);

  if (leitura != ultimaLeitura) {
    instanteDaMudanca = millis();
    ultimaLeitura = leitura;
  }

  if (millis() - instanteDaMudanca >= DEBOUNCE_MS && leitura != estadoEstavel) {
    estadoEstavel = leitura;
    digitalWrite(PINO_LED, estadoEstavel == LOW ? HIGH : LOW);
  }
}
