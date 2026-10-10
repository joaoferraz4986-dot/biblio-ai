/* Painel de leitura: quanto tempo foi lido por dia, quais livros concentram esse tempo e o que
   está em andamento. Só lê o que ui/progress.js registra (time, sections, completedAt) — não
   guarda nada por conta própria. */
(function () {
  "use strict";
  var h = function () {
    return Books.util.h.apply(null, arguments);
  };
  var els = {};
  var opener = null;
  var RANGES = [
    { days: 7, label: "7 dias" },
    { days: 30, label: "30 dias" },
  ];
  var range = 7;
  var WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  var MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  function duration(seconds) {
    var minutes = Math.round((seconds || 0) / 60);
    if (!seconds) return "0min";
    if (minutes < 1) return "menos de 1min";
    var hours = Math.floor(minutes / 60),
      rest = minutes % 60;
    if (!hours) return rest + "min";
    return hours + "h" + (rest ? " " + (rest < 10 ? "0" : "") + rest + "min" : "");
  }
  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : many);
  }

  // Os últimos `count` dias, do mais antigo para hoje.
  function lastDays(count) {
    var out = [];
    for (var i = count - 1; i >= 0; i--) {
      var d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      out.push({
        key: Books.progress.dayKey(d),
        short: d.getDate() + " " + MONTHS[d.getMonth()],
        long: WEEKDAYS[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()],
        weekday: WEEKDAYS[d.getDay()],
        seconds: 0,
      });
    }
    return out;
  }

  function collect() {
    var days = lastDays(range);
    var byKey = {};
    days.forEach(function (d) {
      byKey[d.key] = d;
    });
    var since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (range - 1));
    var packages = (Books.state.catalog && Books.state.catalog.packages) || [];
    var stats = { days: days, seconds: 0, sections: 0, completed: 0, books: [], reading: [], everRead: false };
    packages.forEach(function (entry) {
      var p = Books.progress.get(entry.id);
      var time = p.time || {},
        inRange = 0,
        total = 0;
      Object.keys(time).forEach(function (key) {
        total += time[key];
        if (byKey[key]) {
          byKey[key].seconds += time[key];
          inRange += time[key];
        }
      });
      if (total) stats.everRead = true;
      var sections = p.sections || {},
        read = Object.keys(sections);
      stats.sections += read.filter(function (id) {
        return byKey[sections[id]];
      }).length;
      if (p.completed && p.completedAt && p.completedAt >= since.getTime()) stats.completed += 1;
      stats.seconds += inRange;
      if (inRange) stats.books.push({ entry: entry, seconds: inRange, total: total });
      if (!Books.progress.isNew(entry.id) && p.percent > 0 && !p.completed)
        stats.reading.push({
          entry: entry,
          percent: p.percent,
          opened: p.opened || 0,
          read: p.sectionTotal ? Math.min(read.length, p.sectionTotal) : read.length,
          sectionTotal: p.sectionTotal || 0,
        });
    });
    stats.books.sort(function (a, b) {
      return b.seconds - a.seconds;
    });
    stats.reading.sort(function (a, b) {
      return b.opened - a.opened;
    });
    stats.activeDays = days.filter(function (d) {
      return d.seconds > 0;
    }).length;
    return stats;
  }

  function tile(value, label, detail) {
    return h(
      "div",
      { class: "dash-tile" },
      h("span", { class: "dash-tile__label" }, label),
      h("strong", { class: "dash-tile__value" }, value),
      detail ? h("span", { class: "dash-tile__detail" }, detail) : null,
    );
  }

  // Teto do eixo em minutos "redondos", para as linhas de grade caírem em números limpos.
  function niceCeil(minutes) {
    var steps = [10, 20, 30, 60, 90, 120, 180, 240, 360, 480, 720, 1440];
    for (var i = 0; i < steps.length; i++) if (minutes <= steps[i]) return steps[i];
    return steps[steps.length - 1];
  }

  function chart(stats) {
    var days = stats.days;
    var peak = Math.max.apply(
      null,
      days.map(function (d) {
        return d.seconds;
      }),
    );
    var top = niceCeil(Math.ceil(peak / 60)) * 60;
    var tip = h("div", { class: "dash-chart__tip", hidden: true, "aria-hidden": "true" });
    var plot = h("div", { class: "dash-chart__plot" });
    [1, 0.5, 0].forEach(function (frac) {
      plot.appendChild(
        h(
          "div",
          { class: "dash-chart__grid", style: { bottom: frac * 100 + "%" } },
          h("span", null, frac ? duration(top * frac) : "0"),
        ),
      );
    });
    var cols = h("div", { class: "dash-chart__cols" });
    var every = range > 7 ? 5 : 1;
    days.forEach(function (d, i) {
      var fromEnd = days.length - 1 - i;
      var col = h(
        "div",
        { class: "dash-chart__col" + (fromEnd === 0 ? " is-today" : "") },
        h(
          "div",
          { class: "dash-chart__track" },
          h("div", {
            class: "dash-chart__bar",
            style: { height: (d.seconds / top) * 100 + "%" },
          }),
        ),
        h(
          "span",
          { class: "dash-chart__tick" },
          fromEnd % every === 0 ? (range > 7 ? d.short : d.weekday) : "",
        ),
      );
      col.addEventListener("mouseenter", function () {
        tip.textContent = d.long + " · " + duration(d.seconds);
        tip.hidden = false;
        var box = cols.getBoundingClientRect(),
          r = col.getBoundingClientRect();
        tip.style.left = r.left - box.left + r.width / 2 + "px";
        tip.style.bottom = "calc(" + (d.seconds / top) * 100 + "% + 8px)";
      });
      cols.appendChild(col);
    });
    cols.addEventListener("mouseleave", function () {
      tip.hidden = true;
    });
    plot.appendChild(cols);
    cols.appendChild(tip);
    // A mesma informação em tabela, para leitores de tela (o gráfico em si é decorativo para eles).
    var table = h(
      "table",
      { class: "dash-sr" },
      h("caption", null, "Tempo de leitura por dia"),
      h(
        "tbody",
        null,
        days.map(function (d) {
          return h("tr", null, h("th", { scope: "row" }, d.long), h("td", null, duration(d.seconds)));
        }),
      ),
    );
    return h(
      "section",
      { class: "dash-card" },
      h("h3", { class: "dash-card__title" }, "Tempo por dia"),
      h("div", { class: "dash-chart", "aria-hidden": "true" }, plot),
      table,
    );
  }

  function bookRow(entry, main, side, fraction, hint) {
    var row = h(
      "button",
      { type: "button", class: "dash-row", title: hint },
      h(
        "span",
        { class: "dash-row__text" },
        h("span", { class: "dash-row__title" }, entry.title || entry.id),
        h("span", { class: "dash-row__meta" }, main),
      ),
      h("span", { class: "dash-row__side" }, side),
      h("span", { class: "dash-row__meter" }, h("span", { style: { width: Math.max(2, fraction * 100) + "%" } })),
    );
    row.addEventListener("click", function () {
      delete els.root.dataset.origin; // vai direto para o livro, sem reabrir a biblioteca
      close();
      Books.events.emit("library:open", entry.id);
    });
    return row;
  }

  function listCard(title, rows, empty) {
    return h(
      "section",
      { class: "dash-card" },
      h("h3", { class: "dash-card__title" }, title),
      rows.length ? h("div", { class: "dash-list" }, rows) : h("p", { class: "dash-empty" }, empty),
    );
  }

  function draw() {
    var body = Books.util.clear(els.body);
    Books.util.clear(els.range);
    RANGES.forEach(function (r) {
      var btn = h(
        "button",
        {
          type: "button",
          class: "library-tab" + (r.days === range ? " is-active" : ""),
          "aria-pressed": r.days === range ? "true" : "false",
        },
        r.label,
      );
      btn.addEventListener("click", function () {
        range = r.days;
        draw();
      });
      els.range.appendChild(btn);
    });
    var stats = collect();
    if (!stats.everRead && !stats.reading.length) {
      body.appendChild(
        h(
          "div",
          { class: "dash-blank" },
          Books.icons.get("chart", 28),
          h("strong", null, "Ainda não há leitura registrada"),
          h("p", null, "Abra um livro e leia um pouco: o tempo, as seções e os livros mais lidos passam a aparecer aqui."),
        ),
      );
      return;
    }
    body.appendChild(
      h(
        "div",
        { class: "dash-tiles" },
        tile(duration(stats.seconds), "tempo de leitura", "nos últimos " + range + " dias"),
        tile(
          String(stats.activeDays),
          stats.activeDays === 1 ? "dia com leitura" : "dias com leitura",
          "de " + range,
        ),
        tile(String(stats.sections), stats.sections === 1 ? "seção lida" : "seções lidas", "no período"),
        tile(
          String(stats.completed),
          stats.completed === 1 ? "livro concluído" : "livros concluídos",
          "no período",
        ),
      ),
    );
    body.appendChild(chart(stats));
    var topSeconds = stats.books.length ? stats.books[0].seconds : 1;
    body.appendChild(
      h(
        "div",
        { class: "dash-columns" },
        listCard(
          "Mais lidos",
          stats.books.slice(0, 5).map(function (b) {
            return bookRow(
              b.entry,
              duration(b.total) + " no total",
              duration(b.seconds),
              b.seconds / topSeconds,
              "Abrir livro",
            );
          }),
          "Nenhuma leitura nos últimos " + range + " dias.",
        ),
        listCard(
          "Em andamento",
          stats.reading.slice(0, 5).map(function (b) {
            return bookRow(
              b.entry,
              b.sectionTotal
                ? b.read + " de " + plural(b.sectionTotal, "seção", "seções")
                : "seções ainda não contadas",
              b.percent + "%",
              b.percent / 100,
              "Continuar lendo",
            );
          }),
          "Nenhum livro em andamento.",
        ),
      ),
    );
  }

  function open() {
    opener = document.activeElement;
    if (Books.library && Books.library.isOpen()) {
      Books.library.close();
      els.root.dataset.origin = "library";
    } else {
      delete els.root.dataset.origin;
    }
    els.root.hidden = false;
    document.body.classList.add("overlay-open", "dashboard-open");
    draw();
    setTimeout(function () {
      els.close.focus();
    }, 0);
  }
  function close() {
    els.root.hidden = true;
    document.body.classList.remove("overlay-open", "dashboard-open");
    if (els.root.dataset.origin === "library") {
      delete els.root.dataset.origin;
      Books.library.open();
    } else if (opener && opener.focus) opener.focus();
  }
  function isOpen() {
    return document.body.classList.contains("dashboard-open");
  }

  function init() {
    els.root = document.getElementById("dashboardOverlay");
    els.body = document.getElementById("dashboardBody");
    els.range = document.getElementById("dashboardRange");
    els.close = document.getElementById("dashboardClose");
    els.close.addEventListener("click", close);
    els.root.addEventListener("click", function (e) {
      if (e.target === els.root) close();
    });
    document.addEventListener("keydown", function (e) {
      if (isOpen() && e.key === "Escape") close();
    });
    Books.events.on("dashboard:open", open);
  }

  Books.dashboard = { init: init, open: open, close: close, isOpen: isOpen };
})();
