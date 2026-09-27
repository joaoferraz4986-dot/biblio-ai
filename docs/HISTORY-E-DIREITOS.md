# História, biografia e direitos de imagens

O bloco `history` é intencionalmente enxuto para manter a leitura natural. Seus campos visíveis são `name`, `shortBio`, `insight` e `image`, que contém `src` e `alt`. `shortBio` é uma ou duas frases; `insight` explica o porquê e/ou como conforme o assunto, sem campos obrigatórios artificiais.

Os direitos não ficam no card. Cada pacote pode conter `image-rights.json`, com um registro simples por caminho de imagem: fonte, licença, crédito e data de recuperação. O leitor mostra a atribuição sob demanda pelo botão de informação do card. Imagens do pacote devem ser locais e ter texto alternativo.

Exemplo:

```json
{
  "type": "history",
  "name": "Carl Friedrich Gauss",
  "shortBio": "Matemático e físico alemão que trabalhou em teoria dos números e eletromagnetismo.",
  "insight": "A simetria permite transformar o cálculo do campo em um fluxo pela superfície.",
  "image": { "src": "images/history-gauss.svg", "alt": "Ilustração tipográfica de Carl Friedrich Gauss" }
}
```
