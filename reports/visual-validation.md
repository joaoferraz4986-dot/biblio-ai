# Validação visual registrada

- Biblioteca recarregada sem cache em 2026-09-25.
- As seis capas aparecem com composição horizontal e específicas por livro; biologia, computação quântica e embarcados não usam mais o SVG genérico.
- O leitor de biologia carregou a imagem do neurônio e o diagrama Mermaid sem fallback de imagem.
- A nova subseção `5.4 Projeto: evolução digital reproduzível em C++` aparece no sumário e no leitor.
- A subseção renderizou título, callout, diagrama de arquitetura e fórmula Wright–Fisher com leitura em português; o exercício segue no formato expansível.
- O menu do editor exibiu `Iframe seguro` e `Vídeo MP4` como tipos disponíveis sem inserir esses blocos em nenhum livro.
- A primeira tentativa de criação de iframe revelou que `height` era um número validado como texto; isso foi corrigido com o tipo de campo numérico e validado novamente.
- O leitor de combinatória recarregado mostrou a fórmula da regra da soma como painel matemático dedicado, precedida por definição e seguida por passos e leitura, preservando a expansão dos exercícios.
- A seção `15. Referências, trilha de prática e reprodutibilidade` apareceu no sumário e foi visualmente inspecionada no leitor. O painel mostrou o texto introdutório, a subseção de trilha, tabela de critérios e passos numerados com layout consistente.
