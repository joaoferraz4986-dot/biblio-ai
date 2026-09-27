(function () {
  "use strict";
  var B = Books.blocks;
  var h = function () {
    return Books.util.h.apply(null, arguments);
  };
  B.register({
    type: "history",
    label: "História / Bio",
    group: "diagrama",
    icon: "info",
    doc: "Card curto de contexto histórico ou biográfico. Use uma descrição natural em `shortBio` e um `insight` explicando o porquê e/ou como. Direitos da imagem ficam no `image-rights.json` do pacote.",
    example: {
      type: "history",
      name: "Carl Friedrich Gauss",
      shortBio:
        "Matemático e físico alemão que trabalhou em teoria dos números e eletromagnetismo.",
      insight:
        "A simetria permite transformar o cálculo do campo em um fluxo pela superfície.",
      image: {
        src: "images/history-gauss.svg",
        alt: "Ilustração tipográfica de Carl Friedrich Gauss",
      },
    },
    defaults: function () {
      return {
        name: "Pessoa ou ideia",
        shortBio: "",
        insight: "",
        image: { src: "", alt: "" },
      };
    },
    fields: [
      { key: "name", label: "Nome", kind: "line", required: true },
      {
        key: "shortBio",
        label: "Descrição curta",
        kind: "text",
        rows: 3,
        required: true,
      },
      {
        key: "insight",
        label: "Porquê e/ou como",
        kind: "text",
        rows: 4,
        required: true,
      },
      { key: "image", label: "Imagem", kind: "history-image", required: true },
    ],
    summary: function (b) {
      return b.name || "História / Bio";
    },
    render: function (b, ctx) {
      var image = b.image || {};
      var src = Books.util.safeUrl(image.src || "");
      var url = src && ctx && ctx.assetUrl ? ctx.assetUrl(src) : src;
      var media = url
        ? h("img", { src: url, alt: image.alt || "", loading: "lazy" })
        : h("div", { class: "b-history__empty" }, "imagem não definida");
      if (url)
        media.addEventListener("error", function () {
          media.hidden = true;
          media.parentNode.appendChild(
            h(
              "div",
              { class: "b-history__empty" },
              "imagem indisponível — verifique o arquivo: " + src,
            ),
          );
        });
      var info = h(
        "button",
        {
          type: "button",
          class: "b-history__info",
          title: "Ver atribuição da imagem",
          "aria-label": "Ver atribuição da imagem",
        },
        Books.icons.get("info", 14),
      );
      info.addEventListener("click", function () {
        var rights =
          (ctx && ctx.imageRights && ctx.imageRights[image.src]) || null;
        var text = rights
          ? (rights.credit || "Crédito não informado") +
            (rights.license ? " · " + rights.license : "") +
            (rights.source ? " · " + rights.source : "")
          : "Atribuição registrada no image-rights.json do pacote.";
        if (Books.toast)
          Books.toast.show(text, { tone: "info", duration: 5000 });
      });
      return h(
        "aside",
        { class: "b-history", "aria-label": "História e contexto" },
        h("div", { class: "b-history__media" }, media, info),
        h(
          "div",
          { class: "b-history__body" },
          h("h3", null, Books.inline.render(b.name || "História / Bio")),
          h(
            "p",
            { class: "b-history__bio" },
            Books.inline.render(b.shortBio || ""),
          ),
          h(
            "p",
            { class: "b-history__insight" },
            Books.inline.render(b.insight || ""),
          ),
        ),
      );
    },
  });
})();
