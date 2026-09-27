(function () {
  "use strict";
  var B = Books.blocks;
  var h = function () {
    return Books.util.h.apply(null, arguments);
  };

  B.register({
    type: "math",
    label: "Fórmula (LaTeX)",
    group: "diagrama",
    icon: "sparkles",
    doc: "Equação matemática em destaque, escrita em LaTeX (a sintaxe do KaTeX — praticamente o LaTeX de matemática padrão: \\frac, \\sum, \\int, letras gregas \\alpha, expoentes x^2, índices x_i etc.). O campo `tex` já é display e não precisa de `$...$` nem `$$...$$`. Para matemática no texto de qualquer bloco, use `$...$` ou `$$...$$`; os dois delimitadores permanecem inline.",
    example: {
      type: "math",
      tex: "E = mc^2",
      reading:
        "Lê-se: energia é igual à massa vezes a velocidade da luz ao quadrado.",
      caption: "energia de repouso",
    },
    defaults: function () {
      return { tex: "a^2 + b^2 = c^2", reading: "", caption: "" };
    },
    fields: [
      { key: "tex", label: "LaTeX", kind: "code", rows: 3, required: true },
      {
        key: "reading",
        label: "Leitura em português",
        kind: "text",
        rows: 2,
        required: true,
      },
      { key: "caption", label: "Legenda", kind: "line" },
    ],
    summary: function (b) {
      return (b.caption ? Books.inline.toPlain(b.caption) + " · " : "") + b.tex;
    },
    render: function (b) {
      var el = h("div", { class: "b-math__eq" });
      el.dataset.math = b.tex || "";
      el.dataset.display = "1";
      el.textContent = b.tex || "";
      var reading = h(
        "p",
        { class: "b-math__reading" },
        h("strong", null, "Leitura: "),
        Books.inline.render(b.reading || "Leitura não informada."),
      );
      var fig = h(
        "figure",
        { class: "b-math" },
        h("div", { class: "b-math__scroll" }, el),
        reading,
      );
      if (b.caption)
        fig.appendChild(h("figcaption", null, Books.inline.render(b.caption)));
      return fig;
    },
  });
})();
