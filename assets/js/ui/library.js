(function () {
  "use strict";
  var h = function () {
    return Books.util.h.apply(null, arguments);
  };
  var els = {};
  var query = "";

  function placeholderNode(entry) {
    var initials = Books.inline
      .toPlain(entry.title || entry.id)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) {
        return w[0];
      })
      .join("")
      .toUpperCase();
    return h(
      "div",
      { class: "book-card__placeholder", "aria-hidden": "true" },
      initials || "?",
    );
  }
  function coverNode(entry) {
    if (entry.cover && entry.cover.src) {
      var url = Books.repo.assetUrl(entry.id, entry.cover.src);
      var img = h("img", {
        src: url,
        alt: entry.cover.alt || "",
        loading: "lazy",
      });
      img.addEventListener(
        "error",
        function () {
          img.replaceWith(placeholderNode(entry));
        },
        { once: true },
      );
      return img;
    }
    return placeholderNode(entry);
  }

  function matches(entry, q) {
    if (!q) return true;
    var hay = (
      entry.title +
      " " +
      (entry.description || "") +
      " " +
      (entry.tags || []).join(" ")
    ).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  // Abas da biblioteca. "by" é o campo de data que ordena a aba (mais recente primeiro).
  var TABS = [
    { id: "all", label: "Todos", empty: "Nenhum livro encontrado." },
    {
      id: "reading",
      label: "Continuar lendo",
      by: "opened",
      empty: "Nenhuma leitura em andamento. Abra um livro e ele aparece aqui.",
      test: function (p, isNew) {
        return !isNew && p.percent > 0 && !p.completed;
      },
    },
    {
      id: "pinned",
      label: "Favoritos",
      by: "pinnedAt",
      empty: "Nenhum favorito ainda. Use o alfinete na capa de um livro para fixá-lo.",
      test: function (p) {
        return p.pinned;
      },
    },
    {
      id: "later",
      label: "Ler depois",
      by: "laterAt",
      empty: "Sua lista está vazia. Use o marcador na capa de um livro para guardá-lo aqui.",
      test: function (p) {
        return p.later;
      },
    },
    {
      id: "completed",
      label: "Completos",
      by: "completedAt",
      empty: "Nenhum livro concluído ainda.",
      test: function (p) {
        return p.completed;
      },
    },
  ];
  var ACTIONS = [
    { flag: "pinned", icon: "pin", on: "Desafixar", off: "Fixar no topo" },
    { flag: "later", icon: "bookmark", on: "Remover de Ler depois", off: "Ler depois" },
    { flag: "completed", icon: "check", on: "Desmarcar como concluído", off: "Marcar como concluído" },
  ];
  var tab = "all";

  function inTab(def, entry) {
    return (
      !def.test ||
      def.test(Books.progress.get(entry.id), Books.progress.isNew(entry.id))
    );
  }
  function sortFor(def, list) {
    return list.slice().sort(function (a, b) {
      var pa = Books.progress.get(a.id),
        pb = Books.progress.get(b.id);
      if (def.by) return (pb[def.by] || 0) - (pa[def.by] || 0);
      // "Todos": fixados no topo; dentro de cada grupo, os últimos abertos primeiro
      if (pa.pinned !== pb.pinned) return pa.pinned ? -1 : 1;
      return (pb.opened || 0) - (pa.opened || 0);
    });
  }

  function renderTabs(packages) {
    Books.util.clear(els.tabs);
    TABS.forEach(function (def) {
      var count = packages.filter(function (entry) {
        return inTab(def, entry);
      }).length;
      var btn = h(
        "button",
        {
          type: "button",
          class:
            "library-tab" +
            (def.id === tab ? " is-active" : "") +
            (count ? "" : " is-empty"),
          "aria-pressed": def.id === tab ? "true" : "false",
        },
        h("span", null, def.label),
        h("span", { class: "library-tab__count" }, String(count)),
      );
      btn.addEventListener("click", function () {
        tab = def.id;
        render();
      });
      els.tabs.appendChild(btn);
    });
  }

  function actionButton(entry, p, action) {
    var on = !!p[action.flag];
    var label = on ? action.on : action.off;
    var btn = h(
      "button",
      {
        class: "book-card__action" + (on ? " is-on" : ""),
        type: "button",
        title: label,
        "aria-label": label,
        "aria-pressed": on ? "true" : "false",
        dataset: { action: action.flag },
      },
      Books.icons.get(action.icon, 16),
    );
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      Books.progress.toggle(entry.id, action.flag); // redesenha a grade via progress:changed
      var again = els.grid.querySelector(
        '[data-book="' + entry.id + '"] [data-action="' + action.flag + '"]',
      );
      if (again) again.focus();
    });
    return btn;
  }

  function render() {
    var catalog = Books.state.catalog;
    var packages = (catalog && catalog.packages) || [];
    var def =
      TABS.find(function (t) {
        return t.id === tab;
      }) || TABS[0];
    renderTabs(packages);
    var grid = Books.util.clear(els.grid);
    var list = sortFor(
      def,
      packages.filter(function (e) {
        return inTab(def, e) && matches(e, query.toLowerCase());
      }),
    );
    els.empty.hidden = list.length !== 0;
    els.empty.textContent = query ? TABS[0].empty : def.empty;
    els.count.textContent =
      list.length + (list.length === 1 ? " livro" : " livros");
    list.forEach(function (entry) {
      var p = Books.progress.get(entry.id);
      var isNew = Books.progress.isNew(entry.id);
      var stoppedAt =
        !isNew && p.sectionTitle ? "Você parou em: " + p.sectionTitle : null;
      var editBtn = h(
        "button",
        {
          class: "book-card__action",
          type: "button",
          title: "Editar livro",
          "aria-label": "Editar livro",
        },
        Books.icons.get("edit", 16),
      );
      editBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        Books.events.emit("editor:open", entry.id);
      });
      var card = h(
        "article",
        {
          class: "book-card",
          role: "button",
          tabindex: "0",
          dataset: { book: entry.id },
          title: stoppedAt,
        },
        h(
          "div",
          { class: "book-card__cover" },
          coverNode(entry),
          h(
            "div",
            { class: "book-card__actions" },
            ACTIONS.map(function (action) {
              return actionButton(entry, p, action);
            }),
            editBtn,
          ),
          p.percent > 0
            ? h(
                "div",
                { class: "book-card__progress" },
                h("span", { style: { width: p.percent + "%" } }),
              )
            : null,
        ),
        h(
          "div",
          { class: "book-card__info" },
          h("h3", null, entry.title),
          tab === "reading" && p.sectionTitle
            ? h("p", { class: "book-card__resume" }, "Parou em: " + p.sectionTitle)
            : entry.description
              ? h("p", null, entry.description)
              : null,
          h(
            "div",
            { class: "book-card__meta" },
            // uma linha só: a tag que não couber inteira fica oculta, em vez de cortada
            h(
              "div",
              { class: "book-card__tags" },
              (entry.tags || []).slice(0, 3).map(function (t) {
                return h("span", { class: "tag" }, t);
              }),
            ),
            isNew
              ? h("span", { class: "book-card__pct is-new" }, "novo")
              : h(
                  "span",
                  { class: "book-card__pct" },
                  p.completed ? "concluído" : p.percent + "%",
                ),
          ),
        ),
      );
      card.addEventListener("click", function () {
        Books.events.emit("library:open", entry.id);
      });
      card.addEventListener("keydown", function (event) {
        if (event.target !== card) return; // Enter/espaço num botão da capa é do botão, não abre o livro
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          Books.events.emit("library:open", entry.id);
        }
      });
      grid.appendChild(card);
    });
  }

  function open() {
    els.root.hidden = false;
    document.body.classList.add("overlay-open", "library-open");
    els.close.hidden = !Books.state.pkg;
    els.search.value = query;
    render();
    setTimeout(function () {
      els.search.focus();
    }, 30);
  }
  function close() {
    els.root.hidden = true;
    document.body.classList.remove("overlay-open", "library-open");
  }
  function isOpen() {
    return document.body.classList.contains("library-open");
  }

  function init() {
    els.root = document.getElementById("libraryOverlay");
    els.tabs = document.getElementById("libraryTabs");
    els.grid = document.getElementById("libraryGrid");
    els.empty = document.getElementById("libraryEmpty");
    els.count = document.getElementById("libraryCount");
    els.search = document.getElementById("librarySearch");
    els.close = document.getElementById("libraryClose");
    els.new = document.getElementById("libraryNew");
    els.newSet = document.getElementById("libraryNewSet");
    els.importSet = document.getElementById("libraryImportSet");
    els.importSetInput = document.getElementById("libraryImportSetInput");
    els.settings = document.getElementById("libraryOpenSettings");
    els.dashboard = document.getElementById("libraryOpenDashboard");
    els.close.addEventListener("click", close);
    els.root.addEventListener("click", function (e) {
      if (e.target === els.root) close();
    });
    els.search.addEventListener("input", function () {
      query = els.search.value;
      render();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen() && Books.state.pkg) close();
    });
    els.new.addEventListener("click", function () {
      Books.events.emit("library:new");
    });
    els.newSet.addEventListener("click", function () {
      Books.events.emit("library:new-set");
    });
    els.importSet.addEventListener("click", function () {
      els.importSetInput.click();
    });
    els.importSetInput.addEventListener("change", function () {
      var files = els.importSetInput.files;
      if (!files || !files.length) return;
      Books.events.emit("library:import-set", files);
      els.importSetInput.value = "";
    });
    els.settings.addEventListener("click", function () {
      Books.events.emit("settings:open");
    });
    els.dashboard.addEventListener("click", function () {
      Books.events.emit("dashboard:open");
    });
    Books.events.on("catalog:changed", function () {
      if (isOpen()) render();
    });
    Books.events.on("progress:changed", function () {
      if (isOpen()) render();
    });
  }

  Books.library = {
    init: init,
    open: open,
    close: close,
    isOpen: isOpen,
    render: render,
  };
})();
