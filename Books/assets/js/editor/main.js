(function () {
  "use strict";
  var h = function () {
    return Books.util.h.apply(null, arguments);
  };
  var els = {},
    pkg = null,
    activeTab = "info",
    activeSection = null,
    dirHandle = null,
    pendingPackages = [],
    collectionMode = false,
    collectionExportMode = false,
    selectedCollectionIds = {};

  function resolveAsset(src) {
    return Books.repo ? Books.repo.assetUrl(pkg.manifest.id, src) : src;
  }

  function blankPackage(id, title) {
    return {
      manifest: {
        schema: Books.schema.SCHEMAS.package,
        kind: "book-package",
        id: id,
        title: title,
        description: "",
        language: "pt-BR",
        tags: [],
      },
      header: {
        schema: Books.schema.SCHEMAS.header,
        kind: "book-header",
        id: id + "-header",
        kicker: "",
        title: title,
        subtitle: "",
        guideTitle: "Como usar este livro",
        guideText: "",
        cover: null,
        legend: [],
        footer: "",
      },
      sections: [
        {
          schema: Books.schema.SCHEMAS.section,
          kind: "book-section",
          id: "introducao",
          number: "1",
          title: "Introdução",
          blocks: [
            Books.blocks.create("paragraph", {
              text: "Comece a escrever aqui.",
              lead: true,
            }),
          ],
        },
      ],
    };
  }

  function refreshValidation() {
    var report = Books.validate.package(pkg);
    var box = els.validation;
    Books.util.clear(box);
    if (!report.errors.length && !report.warnings.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    report.errors.forEach(function (e) {
      box.appendChild(
        h(
          "div",
          { class: "validation__item is-error" },
          Books.icons.get("alert", 14),
          h("code", null, e.path),
          " — " + e.message,
        ),
      );
    });
    report.warnings.forEach(function (w) {
      box.appendChild(
        h(
          "div",
          { class: "validation__item is-warn" },
          Books.icons.get("info", 14),
          h("code", null, w.path),
          " — " + w.message,
        ),
      );
    });
    els.saveBtn.disabled = report.errors.length > 0;
    document
      .querySelectorAll("[data-editor-export]")
      .forEach(function (button) {
        button.disabled = report.errors.length > 0;
      });
    return report;
  }
  function markDirty() {
    Books.state.dirty = true;
    refreshValidation();
  }

  function renderInfo() {
    var m = pkg.manifest,
      hd = pkg.header;
    var wrap = h("div", { class: "editor-panel" });
    function f(label, obj, key, kind, extra) {
      return Books.editorFields.row(
        { key: key, label: label, kind: kind },
        Books.editorFields.buildControl(
          { key: key, kind: kind },
          obj,
          key,
          markDirty,
        ),
        extra,
      );
    }
    wrap.appendChild(h("h3", null, "Identidade do livro"));
    wrap.appendChild(
      f(
        "ID (usado em pastas e links; não mude após publicar)",
        m,
        "id",
        "plain",
      ),
    );
    wrap.appendChild(f("Título do catálogo", m, "title", "line"));
    wrap.appendChild(
      f("Descrição (aparece na biblioteca)", m, "description", "text"),
    );
    wrap.appendChild(
      f(
        "Tags (separadas por vírgula)",
        { tags: (m.tags || []).join(", ") },
        "tags",
        "line",
      ),
    );
    wrap.lastChild
      .querySelector("input")
      .addEventListener("input", function (e) {
        m.tags = e.target.value
          .split(",")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        markDirty();
      });
    wrap.appendChild(h("h3", null, "Capa de texto (topo do livro)"));
    wrap.appendChild(
      f("Selo (kicker, pequeno texto acima do título)", hd, "kicker", "line"),
    );
    wrap.appendChild(f("Título grande", hd, "title", "line"));
    wrap.appendChild(f("Subtítulo", hd, "subtitle", "text"));
    wrap.appendChild(
      f("Título do quadro de leitura", hd, "guideTitle", "line"),
    );
    wrap.appendChild(f("Texto do quadro de leitura", hd, "guideText", "text"));
    wrap.appendChild(f("Rodapé", hd, "footer", "text"));
    wrap.appendChild(h("h3", null, "Legenda de cores"));
    wrap.appendChild(legendEditor(hd));
    return wrap;
  }
  function legendEditor(hd) {
    hd.legend = hd.legend || [];
    var box = h("div", { class: "legend-editor" });
    function draw() {
      Books.util.clear(box);
      hd.legend.forEach(function (item, i) {
        var labelInput = Books.editorFields.textInput(item.label, function (v) {
          item.label = v;
          markDirty();
        });
        var accent = Books.editorFields.buildControl(
          { kind: "accent" },
          item,
          "color",
          markDirty,
        );
        var rm = h(
          "button",
          { type: "button", class: "btn btn--icon btn--danger" },
          Books.icons.get("trash", 13),
        );
        rm.addEventListener("click", function () {
          hd.legend.splice(i, 1);
          markDirty();
          draw();
        });
        box.appendChild(
          h("div", { class: "legend-editor__row" }, accent, labelInput, rm),
        );
      });
      var add = h(
        "button",
        { type: "button", class: "btn btn--ghost btn--sm" },
        Books.icons.get("plus", 13),
        h("span", null, "adicionar item"),
      );
      add.addEventListener("click", function () {
        hd.legend.push({ label: "Novo item", color: "blue" });
        markDirty();
        draw();
      });
      box.appendChild(add);
    }
    draw();
    return box;
  }

  function renderCover() {
    var hd = pkg.header;
    hd.cover = hd.cover || { src: "", alt: "", ratio: "16:9" };
    var wrap = h("div", { class: "editor-panel" });
    wrap.appendChild(h("h3", null, "Imagem de capa"));
    wrap.appendChild(
      h(
        "p",
        { class: "hint" },
        "Aparece na biblioteca e pode ser reaproveitada onde o tema do livro precisar. Envie um arquivo ou informe um caminho/URL.",
      ),
    );
    var imageControl = Books.editorFields.buildControl(
      { kind: "image" },
      hd.cover,
      "src",
      markDirty,
      resolveAsset,
    );
    wrap.appendChild(
      Books.editorFields.row({ label: "Imagem", kind: "image" }, imageControl),
    );
    wrap.appendChild(
      Books.editorFields.row(
        { label: "Texto alternativo", kind: "line" },
        Books.editorFields.buildControl(
          { kind: "line" },
          hd.cover,
          "alt",
          markDirty,
        ),
      ),
    );
    var ratioControl = Books.editorFields.buildControl(
      {
        kind: "select",
        options: [
          ["16:9", "16:9 (paisagem)"],
          ["3:4", "3:4 (retrato)"],
          ["1:1", "1:1 (quadrada)"],
          ["9:16", "9:16 (vertical)"],
        ],
      },
      hd.cover,
      "ratio",
      function () {
        markDirty();
        imageControl.updatePreviewRatio(hd.cover.ratio);
      },
    );
    wrap.appendChild(
      Books.editorFields.row(
        { label: "Proporção", kind: "select" },
        ratioControl,
      ),
    );
    var clear = h(
      "button",
      { type: "button", class: "btn btn--ghost btn--sm" },
      Books.icons.get("trash", 13),
      h("span", null, "remover capa"),
    );
    clear.addEventListener("click", function () {
      hd.cover = null;
      markDirty();
      renderTab();
    });
    wrap.appendChild(clear);
    return wrap;
  }

  function sectionMeta(section) {
    var box = h("div", { class: "section-meta" });
    function f(label, key, kind, extra) {
      return Books.editorFields.row(
        { key: key, label: label, kind: kind },
        Books.editorFields.buildControl(
          { key: key, kind: kind },
          section,
          key,
          function () {
            markDirty();
            renderSectionsList();
          },
        ),
        extra,
      );
    }
    box.appendChild(f("ID (âncora, sem espaços)", "id", "plain"));
    box.appendChild(f("Número (ex.: 1, 2.3)", "number", "plain"));
    box.appendChild(f("Título", "title", "line"));
    return box;
  }
  function renderSectionsList() {
    var box = Books.util.clear(els.sectionsList);
    pkg.sections.forEach(function (section, i) {
      var item = h(
        "div",
        {
          class:
            "section-item" + (activeSection === section ? " is-active" : ""),
        },
        h("span", { class: "section-item__num" }, section.number || "–"),
        h(
          "span",
          { class: "section-item__title" },
          Books.inline.toPlain(section.title) || "(sem título)",
        ),
        h(
          "div",
          { class: "section-item__ops" },
          h(
            "button",
            {
              type: "button",
              class: "btn btn--icon",
              title: "mover para cima",
              disabled: i === 0 ? true : null,
            },
            Books.icons.get("up", 13),
          ),
          h(
            "button",
            {
              type: "button",
              class: "btn btn--icon",
              title: "mover para baixo",
              disabled: i === pkg.sections.length - 1 ? true : null,
            },
            Books.icons.get("down", 13),
          ),
          h(
            "button",
            {
              type: "button",
              class: "btn btn--icon btn--danger",
              title: "excluir seção",
            },
            Books.icons.get("trash", 13),
          ),
        ),
      );
      item.addEventListener("click", function (e) {
        if (e.target.closest("button")) return;
        activeSection = section;
        renderSectionEditor();
        renderSectionsList();
      });
      var ops = item.querySelectorAll(".section-item__ops button");
      ops[0].addEventListener("click", function (e) {
        e.stopPropagation();
        if (i > 0) {
          pkg.sections.splice(
            i,
            1,
            pkg.sections.splice(i - 1, 1, pkg.sections[i])[0],
          );
          markDirty();
          renderSectionsList();
        }
      });
      ops[1].addEventListener("click", function (e) {
        e.stopPropagation();
        if (i < pkg.sections.length - 1) {
          pkg.sections.splice(
            i,
            1,
            pkg.sections.splice(i + 1, 1, pkg.sections[i])[0],
          );
          markDirty();
          renderSectionsList();
        }
      });
      ops[2].addEventListener("click", function (e) {
        e.stopPropagation();
        if (
          !confirm(
            'Excluir a seção "' +
              Books.inline.toPlain(section.title) +
              '" e todo o seu conteúdo?',
          )
        )
          return;
        pkg.sections.splice(i, 1);
        if (activeSection === section) activeSection = pkg.sections[0] || null;
        markDirty();
        renderSectionsList();
        renderSectionEditor();
      });
      box.appendChild(item);
    });
    var add = h(
      "button",
      { type: "button", class: "btn btn--dashed" },
      Books.icons.get("plus", 14),
      h("span", null, "nova seção"),
    );
    add.addEventListener("click", function () {
      var s = {
        schema: Books.schema.SCHEMAS.section,
        kind: "book-section",
        id: "secao-" + Books.util.uid(""),
        number: String(pkg.sections.length + 1),
        title: "Nova seção",
        blocks: [],
      };
      pkg.sections.push(s);
      activeSection = s;
      markDirty();
      renderSectionsList();
      renderSectionEditor();
    });
    box.appendChild(add);
  }
  function renderSectionEditor() {
    var box = Books.util.clear(els.sectionEditor);
    if (!activeSection) {
      box.appendChild(
        h("p", { class: "hint" }, "Selecione ou crie uma seção à esquerda."),
      );
      return;
    }
    box.appendChild(sectionMeta(activeSection));
    box.appendChild(h("h4", null, "Conteúdo"));
    activeSection.blocks = activeSection.blocks || [];
    box.appendChild(
      Books.editorBlocks.renderList(activeSection.blocks, {
        onChange: markDirty,
        defaultOpen: activeSection.blocks.length <= 3,
        assetUrl: resolveAsset,
      }),
    );
  }
  function renderSections() {
    var wrap = h(
      "div",
      { class: "editor-panel editor-panel--sections" },
      h(
        "div",
        { class: "sections-layout" },
        h("div", { class: "sections-layout__list", id: "sectionsListMount" }),
        h("div", {
          class: "sections-layout__editor",
          id: "sectionEditorMount",
        }),
      ),
    );
    els.sectionsList = wrap.querySelector("#sectionsListMount");
    els.sectionEditor = wrap.querySelector("#sectionEditorMount");
    if (!activeSection) activeSection = pkg.sections[0] || null;
    renderSectionsList();
    renderSectionEditor();
    return wrap;
  }

  function bytesToDataUrl(bytes, mime) {
    var binary = "",
      chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk)
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return (
      "data:" + (mime || "application/octet-stream") + ";base64," + btoa(binary)
    );
  }
  function zipMime(name) {
    var ext = String(name || "")
      .split(".")
      .pop()
      .toLowerCase();
    return (
      {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
        avif: "image/avif",
        mp4: "video/mp4",
        svg: "image/svg+xml",
      }[ext] || "application/octet-stream"
    );
  }
  function importZip(file) {
    return Books.zip.read(file).then(function (entries) {
      var byName = {};
      entries.forEach(function (entry) { byName[entry.name.replace(/^\.\//, "")] = entry; });
      var manifestEntries = entries.filter(function (entry) { return /(^|\/)manifest\.json$/i.test(entry.name); });
      if (!manifestEntries.length) throw new Error("O ZIP precisa conter ao menos um manifest.json.");
      function readPackage(manifestEntry) {
        var manifest = JSON.parse(manifestEntry.text());
        var parts = manifestEntry.name.split("/");
        parts.pop();
        var root = parts.length ? parts.join("/") + "/" : "";
        function entryFor(relative) {
          var clean = String(relative || "").replace(/^\//, "");
          return byName[root + clean] || byName[clean];
        }
        var headerEntry = entryFor(manifest.header || "header.json");
        if (!headerEntry) throw new Error("O ZIP não contém o header.json do livro " + (manifest.id || "sem-id") + ".");
        var header = JSON.parse(headerEntry.text());
        var sections = (manifest.sections || []).map(function (sectionPath) {
          var entry = entryFor(sectionPath);
          if (!entry) throw new Error("Seção não encontrada no ZIP: " + sectionPath);
          return JSON.parse(entry.text());
        });
        function localizeAssetRef(src) {
          if (!src || /^(data:|https?:|blob:|\/)/i.test(src)) return src;
          var mediaEntry = entryFor(src);
          return mediaEntry ? bytesToDataUrl(mediaEntry.data, zipMime(mediaEntry.name)) : src;
        }
        if (header.cover && header.cover.src) header.cover.src = localizeAssetRef(header.cover.src);
        sections.forEach(function (section) {
          Books.blocks.walk(section.blocks, function (block) {
            if ((block.type === "image" || block.type === "video") && block.src) block.src = localizeAssetRef(block.src);
            if (block.type === "history" && block.image && block.image.src) block.image.src = localizeAssetRef(block.image.src);
          });
        });
        var normalized = Books.migrate.normalizePackage({ manifest: manifest, header: header, sections: sections });
        var report = Books.validate.package(normalized);
        if (!report.ok()) throw new Error("Livro " + (manifest.id || "sem-id") + " inválido: " + report.format().split("\n").slice(0, 3).join("; "));
        return normalized;
      }
      var packages = manifestEntries.map(readPackage);
      var selected = packages.find(function (item) { return item.manifest.id === (pkg && pkg.manifest.id); }) || packages[0];
      pendingPackages = packages;
      collectionMode = true;
      pkg = selected;
      activeSection = pkg.sections[0] || null;
      Books.state.dirty = true;
      return { pkg: pkg, packages: packages };
    });
  }
  function copyPromptZip(book) {
    var prompt = Books.aiPrompt.build(book);
    var example =
      JSON.stringify(
        {
          schema: "books.section.v2",
          kind: "book-section",
          id: "exemplo",
          number: "1",
          title: "Exemplo mínimo",
          blocks: [
            { type: "paragraph", text: "Conteúdo com **marcação inline**." },
            {
              type: "history",
              name: "Pessoa ou ideia",
              shortBio: "Descrição curta.",
              insight: "Explique o porquê e/ou como.",
              image: {
                src: "images/exemplo.svg",
                alt: "Ilustração do exemplo",
              },
            },
          ],
        },
        null,
        2,
      ) + "\n";
    var readme =
      [
        "PACOTE DE ESPECIFICAÇÕES BOOKS",
        "",
        "PROMPT-IA.txt é o prompt completo gerado pelo editor.",
        "FORMATO-DO-LIVRO.md resume o contrato e os blocos registrados.",
        "EXEMPLO-minimo.json é uma seção válida para colar no editor.",
        "Não inclua HTML executável, scripts ou caminhos com .. Iframes só podem usar HTTPS; vídeos locais devem ser MP4 em media/.",
        "O bloco history usa name, shortBio, insight e image {src, alt}; direitos ficam no image-rights.json do pacote.",
      ].join("\n") + "\n";
    var blob = Books.zip.build([
      { name: "PROMPT-IA.txt", data: prompt },
      { name: "FORMATO-DO-LIVRO.md", data: "Consulte o prompt PROMPT-IA.txt e o registro de blocos do projeto para a especificação atual.\n" },
      { name: "README.txt", data: readme },
      { name: "EXEMPLO-minimo.json", data: example },
      {
        name: "schemas/history.json",
        data:
          JSON.stringify(
            {
              type: "history",
              fields: ["name", "shortBio", "insight", "image.src", "image.alt"],
            },
            null,
            2,
          ) + "\n",
      },
    ]);
    if (
      navigator.clipboard &&
      navigator.clipboard.write &&
      typeof ClipboardItem !== "undefined"
    ) {
      navigator.clipboard
        .write([new ClipboardItem({ "application/zip": blob })])
        .then(function () {
          Books.toast.show(
            "ZIP do prompt copiado para a área de transferência.",
            { tone: "ok" },
          );
        })
        .catch(function () {
          Books.util.copyText(Books.aiPrompt.build(book)).then(function () {
            Books.toast.show(
              "O navegador não permitiu ZIP na área de transferência; prompt em texto copiado.",
              { tone: "ok" },
            );
          });
        });
    } else {
      Books.util.copyText(Books.aiPrompt.build(book)).then(function () {
        Books.toast.show(
          "ZIP não é aceito na área de transferência deste navegador; prompt em texto copiado.",
          { tone: "ok" },
        );
      });
    }
  }

  function applyImportedPackages(selected) {
    if (!selected || !selected.length) return;
    pendingPackages = selected;
    pkg = selected[0];
    activeSection = pkg.sections[0] || null;
    collectionMode = true;
    collectionExportMode = false;
    activeTab = "import";
    Books.state.dirty = true;
    renderShell();
    Books.toast.show(selected.length + (selected.length === 1 ? " livro carregado" : " livros carregados") + " para revisão. Salve para gravar no dispositivo.", { tone: "ok", duration: 5000 });
  }

  function plainText(value) {
    return Books.inline ? Books.inline.toPlain(String(value || "")) : String(value || "");
  }
  var BLOCK_NAMES = {
    paragraph: "parágrafo", callout: "destaque", code: "bloco de código", image: "imagem",
    math: "equação", exercise: "exercício", history: "bloco histórico", subsection: "subseção",
    table: "tabela", diagram: "diagrama", video: "vídeo", list: "lista", quote: "citação",
    columns: "colunas", figure: "figura", steps: "passos"
  };
  var CHILD_KEYS = ["blocks", "solutionBlocks", "items", "columns"];
  function blockLabel(block) {
    var name = BLOCK_NAMES[block.type] || 'bloco "' + block.type + '"';
    var text = plainText(block.title || block.prompt || block.name || block.caption || block.text || block.tex || "");
    if (text.length > 64) text = text.slice(0, 64) + "…";
    return text ? name + " “" + text + "”" : name;
  }
  function shallowBlock(block) {
    var copy = Books.util.clone(block);
    CHILD_KEYS.forEach(function (key) { delete copy[key]; });
    return copy;
  }
  function flattenBlocks(blocks, prefix, out) {
    out = out || [];
    (blocks || []).forEach(function (block, index) {
      var path = (prefix ? prefix + "." : "") + (index + 1);
      out.push({ path: path, block: block });
      CHILD_KEYS.forEach(function (key) {
        var kids = block && block[key];
        if (Array.isArray(kids) && kids.length && typeof kids[0] === "object") flattenBlocks(kids, path, out);
      });
    });
    return out;
  }
  function sectionDiffLines(oldSection, newSection) {
    var lines = [];
    if (plainText(oldSection.title) !== plainText(newSection.title)) lines.push("título da seção alterado para “" + plainText(newSection.title) + "”");
    if ((oldSection.number || "") !== (newSection.number || "")) lines.push("numeração da seção alterada para " + (newSection.number || "(vazia)"));
    var before = flattenBlocks(oldSection.blocks), after = flattenBlocks(newSection.blocks);
    var total = Math.max(before.length, after.length);
    for (var i = 0; i < total; i++) {
      var x = before[i], y = after[i];
      if (x && !y) { lines.push("removido o " + blockLabel(x.block) + " (posição " + x.path + ")"); continue; }
      if (!x && y) { lines.push("adicionado " + blockLabel(y.block) + " (posição " + y.path + ")"); continue; }
      if (JSON.stringify(shallowBlock(x.block)) === JSON.stringify(shallowBlock(y.block))) continue;
      if (x.block.type !== y.block.type) lines.push("na posição " + y.path + ", " + blockLabel(x.block) + " foi trocado por " + blockLabel(y.block));
      else lines.push("editado o " + blockLabel(y.block) + " (posição " + y.path + ")");
    }
    return lines;
  }
  function diffText(before, after) {
    if (!before) return "Livro novo neste dispositivo: todo o conteúdo será adicionado.";
    var out = [], bm = before.manifest || {}, am = after.manifest || {};
    if (bm.title !== am.title) out.push("Título do livro alterado de “" + (bm.title || "") + "” para “" + (am.title || "") + "”.");
    if ((bm.description || "") !== (am.description || "")) out.push("Descrição do livro editada.");
    if (JSON.stringify(before.header || {}) !== JSON.stringify(after.header || {})) out.push("Abertura do livro (capa de texto, guia ou legenda) editada.");
    var bs = before.sections || [], as = after.sections || [], byId = {};
    bs.forEach(function (s) { byId[s.id] = s; });
    as.forEach(function (s) {
      var old = byId[s.id];
      if (!old) { out.push("Seção adicionada: “" + (plainText(s.title) || s.id) + "” com " + (s.blocks || []).length + " blocos."); return; }
      delete byId[s.id];
      if (JSON.stringify(old) === JSON.stringify(s)) return;
      var lines = sectionDiffLines(old, s);
      if (!lines.length) lines = ["ajustes internos de metadados da seção"];
      out.push("Seção “" + (plainText(s.title) || s.id) + "”:");
      lines.forEach(function (line) { out.push("   • " + line); });
    });
    Object.keys(byId).forEach(function (id) { out.push("Seção removida: “" + (plainText(byId[id].title) || id) + "”."); });
    return out.length ? out.join("\n") : "Nenhuma diferença em relação à versão salva neste dispositivo.";
  }

  /* Versões em edição nesta sessão (livros importados e o livro aberto no editor). */
  function editedPackagesById() {
    var map = {};
    pendingPackages.forEach(function (item) { map[item.manifest.id] = item; });
    if (pkg && pkg.manifest && pkg.manifest.id) map[pkg.manifest.id] = pkg;
    return map;
  }
  function deviceBookList() {
    var edited = editedPackagesById();
    var list = (Books.state.catalog.packages || []).map(function (entry) {
      return { id: entry.id, title: entry.title || entry.id, entry: entry, edited: !!edited[entry.id], onDevice: true };
    });
    Object.keys(edited).forEach(function (id) {
      if (!list.some(function (item) { return item.id === id; })) {
        list.push({ id: id, title: (edited[id].manifest.title || id), entry: null, edited: true, onDevice: false });
      }
    });
    return list;
  }
  /* Versão que está no dispositivo agora (inclui o que já foi salvo neste navegador). */
  function basePackageFor(id) {
    var entry = (Books.state.catalog.packages || []).find(function (candidate) { return candidate.id === id; });
    if (!entry) return Promise.resolve(null);
    return Books.repo.loadPackage(entry)
      .catch(function () { return Books.repo.loadPackage(entry, { ignoreOffline: true }); })
      .catch(function () { return null; });
  }
  function resolvePackagesByIds(ids) {
    var edited = editedPackagesById();
    return Promise.all(ids.map(function (id) {
      if (edited[id]) return Promise.resolve(Books.util.clone(edited[id]));
      var entry = (Books.state.catalog.packages || []).find(function (candidate) { return candidate.id === id; });
      if (!entry) return Promise.reject(new Error("Livro não encontrado: " + id));
      return Books.repo.loadPackage(entry);
    }));
  }
  function bookCard(info, options) {
    var button = h("button", {
      type: "button",
      class: "editor-collection__book" + (options.selected ? " is-active" : "") + (info.edited ? " is-edited" : ""),
      "aria-pressed": options.selectable ? String(!!options.selected) : null
    },
      options.selectable ? h("span", { class: "editor-collection__check" }, options.selected ? "✓ selecionado" : "○ não selecionado") : null,
      h("strong", null, info.title),
      h("small", null, (options.label || (info.edited ? "editado nesta sessão" : info.onDevice ? "sem alterações" : "novo")) + " · " + info.id)
    );
    button.addEventListener("click", options.onClick);
    return button;
  }
  function renderExportCollection(panel) {
    var books = deviceBookList();
    var selectedIds = books.filter(function (info) { return selectedCollectionIds[info.id]; }).map(function (info) { return info.id; });
    var list = h("div", { class: "editor-collection__books" });
    books.forEach(function (info) {
      list.appendChild(bookCard(info, {
        selectable: true,
        selected: !!selectedCollectionIds[info.id],
        onClick: function () { selectedCollectionIds[info.id] = !selectedCollectionIds[info.id]; renderShell(); }
      }));
    });
    panel.appendChild(list);
    panel.appendChild(h("h4", null, "Alterações que serão exportadas"));
    var diff = h("pre", { class: "editor-collection__diff" }, selectedIds.length ? "Comparando com as versões salvas neste dispositivo…" : "Selecione ao menos um livro para exportar.");
    panel.appendChild(diff);
    if (!selectedIds.length) return;
    var edited = editedPackagesById();
    Promise.all(selectedIds.map(function (id) {
      var current = edited[id];
      if (!current) return Promise.resolve("LIVRO: " + (books.filter(function (b) { return b.id === id; })[0] || {}).title + "\n   • exportado igual à versão salva neste dispositivo.");
      return basePackageFor(id).then(function (base) {
        return "LIVRO: " + (current.manifest.title || id) + "\n" + diffText(base, current).split("\n").map(function (line) { return "   " + line; }).join("\n");
      });
    })).then(function (parts) { diff.textContent = parts.join("\n\n"); });
  }
  function renderImportCollection(panel) {
    var baseEntries = Books.state.catalog.packages || [];
    var list = h("div", { class: "editor-collection__books" });
    var diff = h("pre", { class: "editor-collection__diff" }, "Selecione um livro para visualizar as diferenças.");
    function showDiff(item, target) {
      var entry = baseEntries.filter(function (candidate) { return candidate.id === item.manifest.id; })[0];
      if (!entry) { target.textContent = diffText(null, item); return; }
      target.textContent = "Comparando com a versão que está no dispositivo…";
      basePackageFor(item.manifest.id).then(function (base) {
        target.textContent = base ? diffText(base, item) : "Não foi possível carregar a versão do dispositivo para comparar.";
      });
    }
    pendingPackages.forEach(function (item) {
      var isExisting = baseEntries.some(function (entry) { return entry.id === item.manifest.id; });
      var selected = pkg && item.manifest.id === pkg.manifest.id;
      var wrap = h("div", { class: "editor-collection__book-wrap" });
      wrap.appendChild(bookCard(
        { id: item.manifest.id, title: item.manifest.title || item.manifest.id, edited: isExisting, onDevice: isExisting },
        {
          selectable: false,
          selected: selected,
          label: isExisting ? "editado (já existe no dispositivo)" : "novo",
          onClick: function () {
            pkg = item;
            activeSection = pkg.sections[0] || null;
            Books.state.dirty = true;
            renderShell();
            var freshDiff = els.body.querySelector(".editor-collection__diff");
            if (freshDiff) showDiff(item, freshDiff);
          }
        }
      ));
      var edit = h("button", { type: "button", class: "btn btn--ghost btn--sm editor-collection__edit" }, "editar conteúdo");
      edit.addEventListener("click", function (event) {
        event.stopPropagation();
        pkg = item;
        activeSection = pkg.sections[0] || null;
        activeTab = "sections";
        Books.state.dirty = true;
        renderShell();
      });
      wrap.appendChild(edit);
      list.appendChild(wrap);
      if (selected) showDiff(item, diff);
    });
    panel.appendChild(list);
    panel.appendChild(h("h4", null, "Alterações da versão importada"));
    panel.appendChild(diff);
    var load = h("button", { type: "button", class: "btn btn--primary btn--sm" }, Books.icons.get("check", 13), h("span", null, "carregar conjunto"));
    load.addEventListener("click", function () {
      confirmImportedPackages(pendingPackages, function (selected) {
        applyImportedPackages(selected);
      });
    });
    panel.appendChild(h("div", { class: "editor-import__actions" }, load));
  }
  function renderCollectionPanel() {
    var count = collectionExportMode ? deviceBookList().length : pendingPackages.length;
    var panel = h("section", { class: "editor-collection" },
      h("div", { class: "editor-collection__head" },
        h("div", null,
          h("h3", null, "Conjunto de livros"),
          h("p", { class: "hint" }, collectionExportMode
            ? "Selecione os livros com um clique e desmarque com outro clique (mínimo um). Clique novamente em exportar conjunto para gerar o .zip."
            : "Selecione um livro para ver o que mudou e use editar conteúdo para ajustar antes de carregar.")
        ),
        h("span", { class: "editor-collection__count" }, count + (count === 1 ? " livro" : " livros"))
      )
    );
    var actions = h("div", { class: "editor-import__actions" });
    var importInput = h("input", { type: "file", accept: "application/zip,.zip", class: "editor__file-input" });
    var importButton = h("button", { type: "button", class: "btn btn--primary btn--sm" }, Books.icons.get("upload", 13), h("span", null, "importar .zip"));
    importButton.addEventListener("click", function () { importInput.click(); });
    importInput.addEventListener("change", function () {
      var file = importInput.files && importInput.files[0];
      if (!file) return;
      importZip(file).then(function () {
        collectionMode = true;
        collectionExportMode = false;
        activeTab = "import";
        renderShell();
      }).catch(function (e) { Books.toast.show("Não foi possível importar o conjunto: " + e.message, { tone: "error" }); });
    });
    var exportButton = h("button", { type: "button", class: "btn btn--ghost btn--sm" }, Books.icons.get("download", 13), h("span", null, collectionExportMode ? "exportar conjunto agora" : "exportar conjunto"));
    exportButton.addEventListener("click", function () {
      if (!collectionExportMode) {
        collectionExportMode = true;
        selectedCollectionIds = {};
        var current = editedPackagesById();
        Object.keys(current).forEach(function (id) { selectedCollectionIds[id] = true; });
        renderShell();
        if (els.body && els.body.scrollTo) els.body.scrollTo({ top: 0, behavior: "smooth" });
        else if (els.body) els.body.scrollTop = 0;
        return;
      }
      var chosen = deviceBookList().filter(function (info) { return selectedCollectionIds[info.id]; }).map(function (info) { return info.id; });
      if (!chosen.length) { Books.toast.show("Selecione pelo menos um livro para exportar.", { tone: "error" }); return; }
      resolvePackagesByIds(chosen)
        .then(function (packages) { return exportZip(false, true, packages); })
        .catch(function (e) { Books.toast.show("Não foi possível exportar: " + e.message, { tone: "error" }); });
    });
    actions.appendChild(importButton);
    actions.appendChild(exportButton);
    actions.appendChild(importInput);
    panel.appendChild(actions);
    if (collectionExportMode) renderExportCollection(panel);
    else renderImportCollection(panel);
    return panel;
  }

  function confirmImportedPackages(packages, done) {
    var chosen = {};
    packages.forEach(function (item) { chosen[item.manifest.id] = true; });
    var overlay = h("div", { class: "block-context__dialog", role: "dialog", "aria-modal": "true" });
    var list = h("div", { class: "editor-collection__books" });
    packages.forEach(function (item) {
      var existing = (Books.state.catalog.packages || []).some(function (entry) { return entry.id === item.manifest.id; });
      var card = h("button", { type: "button", class: "editor-collection__book" + (existing ? " is-edited" : "") }, h("strong", null, item.manifest.title || item.manifest.id), h("small", null, (existing ? "editado · " : "novo · ") + item.manifest.id));
      card.addEventListener("click", function () { chosen[item.manifest.id] = !chosen[item.manifest.id]; card.classList.toggle("is-active", chosen[item.manifest.id]); });
      card.classList.add("is-active"); list.appendChild(card);
    });
    var cancel = h("button", { type: "button", class: "btn btn--ghost btn--sm" }, "cancelar");
    var load = h("button", { type: "button", class: "btn btn--primary btn--sm" }, "carregar selecionados");
    var close = function () { overlay.remove(); };
    cancel.addEventListener("click", close);
    load.addEventListener("click", function () {
      var selected = packages.filter(function (item) { return chosen[item.manifest.id]; });
      if (!selected.length) return;
      close(); done(selected);
    });
    overlay.appendChild(h("div", { class: "block-context__dialog-card editor-collection__confirm" }, h("h3", null, "Confirmar carregamento do conjunto"), h("p", { class: "hint" }, "Livros editados aparecem em laranja. Selecione ou deselecione antes de carregar."), list, h("div", { class: "block-context__dialog-actions" }, cancel, load)));
    document.body.appendChild(overlay);
  }

  function renderImport() {
    var wrap = h("div", { class: "editor-panel" });
    if (collectionMode || pendingPackages.length > 1) wrap.appendChild(renderCollectionPanel());
    var exportActions = h("div", { class: "editor-import__actions" });
    var exportBtn = h(
      "button",
      {
        type: "button",
        class: "btn btn--ghost btn--sm",
        dataset: { editorExport: "zip" },
      },
      Books.icons.get("download", 13),
      h("span", null, "exportar .zip"),
    );
    exportBtn.addEventListener("click", function () {
      exportZip();
    });
    wrap.appendChild(
      h(
        "div",
        { class: "editor-import__head" },
        h(
          "div",
          null,
          h("h3", null, "Importar / Exportar"),
          h(
            "p",
            { class: "hint" },
            "Use JSON para colar conteúdo ou ZIP para importar um livro completo com capa, imagens e arquivos relacionados.",
          ),
          h(
            "p",
            { class: "hint" },
            "Se este navegador guardou uma versão antiga, descarte o rascunho para voltar ao conteúdo do projeto.",
          ),
        ),
      ),
    );
    var discardDraft = h(
      "button",
      { type: "button", class: "btn btn--ghost btn--sm" },
      "descartar rascunho local",
    );
    discardDraft.addEventListener("click", function () {
      if (
        !confirm(
          "Descartar o rascunho local deste livro e recarregar o projeto?",
        )
      )
        return;
      Books.repo.discardOfflinePackage(pkg.manifest.id).then(function () {
        Books.repo.forget(pkg.manifest.id);
        Books.repo
          .loadPackage(
            Books.state.catalog.packages.find(function (entry) {
              return entry.id === pkg.manifest.id;
            }),
            { ignoreOffline: true },
          )
          .then(function (fresh) {
            pkg = Books.util.clone(fresh);
            Books.state.pkg = Books.util.clone(fresh);
            Books.state.dirty = false;
            activeSection = pkg.sections[0] || null;
            renderShell();
            Books.toast.show("Rascunho local descartado.", { tone: "ok" });
          });
      });
    });
    var zipInput = h("input", {
      type: "file",
      accept: "application/zip,.zip",
      class: "editor__file-input",
    });
    var zipButton = h(
      "button",
      { type: "button", class: "btn btn--primary btn--sm" },
      Books.icons.get("upload", 13),
      h("span", null, "importar .zip"),
    );
    var zipMsg = h("div", { class: "hint" });
    zipButton.addEventListener("click", function () {
      zipInput.click();
    });
    zipInput.addEventListener("change", function () {
      var file = zipInput.files[0];
      if (!file) return;
      importZip(file)
        .then(function (result) {
          confirmImportedPackages(result.packages, function (selected) {
            pendingPackages = selected;
            pkg = selected[0];
            activeSection = pkg.sections[0] || null;
            collectionMode = true;
            Books.state.dirty = true;
            zipMsg.textContent = selected.length + " livro(s) carregado(s) para revisão.";
            zipMsg.className = "hint is-ok";
            renderShell();
          });
        })
        .catch(function (e) {
          zipMsg.textContent = "Não foi possível importar o ZIP: " + e.message;
          zipMsg.className = "hint is-error";
        });
    });
    exportBtn.className = "btn btn--ghost btn--sm";
    wrap.appendChild(
      h(
        "div",
        { class: "editor-import__zip" },
        zipButton,
        exportBtn,
        zipInput,
        zipMsg,
      ),
    );
    wrap.appendChild(discardDraft);
    wrap.appendChild(h("h3", null, "Colar um livro completo (JSON)"));
    wrap.appendChild(
      h(
        "p",
        { class: "hint" },
        'Cole aqui um objeto { "manifest": …, "header": …, "sections": [...] } — por exemplo, a resposta de uma IA a que você pediu um livro. Isso substitui o livro que está sendo editado.',
      ),
    );
    var area = Books.editorFields.monoArea("", function () {}, 10);
    var msg = h("div", { class: "hint" });
    var apply = h(
      "button",
      { type: "button", class: "btn btn--primary btn--sm" },
      "Carregar",
    );
    apply.addEventListener("click", function () {
      var parsed;
      try {
        parsed = JSON.parse(area.value);
      } catch (e) {
        msg.textContent = "JSON inválido: " + e.message;
        msg.className = "hint is-error";
        return;
      }
      var normalized = Books.migrate.normalizePackage(parsed);
      var report = Books.validate.package(normalized);
      if (!report.ok()) {
        msg.textContent =
          "Corrigido, mas com problemas: " +
          report.errors
            .slice(0, 3)
            .map(function (e) {
              return e.path + " — " + e.message;
            })
            .join("; ");
        msg.className = "hint is-error";
      } else {
        msg.textContent = "Livro carregado com sucesso.";
        msg.className = "hint is-ok";
      }
      pkg = normalized;
      activeSection = pkg.sections[0] || null;
      Books.state.dirty = true;
      renderShell();
    });
    wrap.appendChild(area);
    wrap.appendChild(apply);
    wrap.appendChild(msg);

    wrap.appendChild(h("h3", null, "Colar uma seção (JSON)"));
    wrap.appendChild(
      h(
        "p",
        { class: "hint" },
        'Cole um objeto de seção { "id", "title", "blocks": [...] }. Se o id já existir, a seção é substituída; senão, é adicionada ao fim.',
      ),
    );
    var sarea = Books.editorFields.monoArea("", function () {}, 6);
    var smsg = h("div", { class: "hint" });
    var sapply = h(
      "button",
      { type: "button", class: "btn btn--primary btn--sm" },
      "Adicionar / substituir seção",
    );
    sapply.addEventListener("click", function () {
      var parsed;
      try {
        parsed = JSON.parse(sarea.value);
      } catch (e) {
        smsg.textContent = "JSON inválido: " + e.message;
        smsg.className = "hint is-error";
        return;
      }
      var normalized = Books.migrate.normalizeSection(parsed);
      var report = Books.validate.section(normalized);
      var idx = pkg.sections.findIndex(function (s) {
        return s.id === normalized.id;
      });
      if (idx === -1) pkg.sections.push(normalized);
      else pkg.sections[idx] = normalized;
      activeSection = normalized;
      smsg.textContent = report.ok()
        ? 'Seção "' + normalized.id + '" carregada.'
        : "Carregada com avisos/erros — veja abaixo.";
      smsg.className = report.ok() ? "hint is-ok" : "hint is-error";
      markDirty();
      activeTab = "sections";
      renderShell();
    });
    wrap.appendChild(sarea);
    wrap.appendChild(sapply);
    wrap.appendChild(smsg);

    wrap.appendChild(h("h3", null, "Exportar JSON deste livro"));
    var exportArea = Books.editorFields.monoArea(
      JSON.stringify(pkg, null, 2),
      function () {},
      10,
    );
    exportArea.readOnly = true;
    var copyBtn = h(
      "button",
      { type: "button", class: "btn btn--ghost btn--sm" },
      Books.icons.get("copy", 13),
      h("span", null, "copiar"),
    );
    copyBtn.addEventListener("click", function () {
      Books.util.copyText(exportArea.value).then(function () {
        Books.toast.show("JSON copiado.");
      });
    });
    wrap.appendChild(exportArea);
    wrap.appendChild(copyBtn);

    wrap.appendChild(h("h3", null, "Pedir a uma IA para escrever este livro"));
    wrap.appendChild(
      h(
        "p",
        { class: "hint" },
        "Copie o prompt completo em texto ou como ZIP. A IA deve devolver um ZIP no formato ideal para importar aqui, com JSONs, capas e imagens na estrutura correta.",
      ),
    );
    var promptBtn = h(
      "button",
      { type: "button", class: "btn btn--ghost btn--sm" },
      Books.icons.get("sparkles", 13),
      h("span", null, "copiar prompt para IA"),
    );
    promptBtn.addEventListener("click", function () {
      Books.util.copyText(Books.aiPrompt.build(pkg)).then(function () {
        Books.toast.show("Prompt copiado — cole na sua IA preferida.");
      });
    });
    wrap.appendChild(promptBtn);
    var promptZipBtn = h(
      "button",
      { type: "button", class: "btn btn--ghost btn--sm" },
      Books.icons.get("download", 13),
      h("span", null, "copiar prompt em ZIP"),
    );
    promptZipBtn.addEventListener("click", function () {
      copyPromptZip(pkg);
    });
    wrap.appendChild(promptZipBtn);
    return wrap;
  }

  var TABS = [
    ["info", "Informações", "file"],
    ["cover", "Capa", "image"],
    ["sections", "Seções e conteúdo", "layers"],
    ["import", "Importar / Exportar", "braces"],
  ];
  function renderTab() {
    var body = Books.util.clear(els.body);
    if (activeTab === "info") body.appendChild(renderInfo());
    else if (activeTab === "cover") body.appendChild(renderCover());
    else if (activeTab === "sections") body.appendChild(renderSections());
    else body.appendChild(renderImport());
  }
  function renderTabs() {
    var bar = Books.util.clear(els.tabs);
    TABS.forEach(function (t) {
      var btn = h(
        "button",
        {
          type: "button",
          class: "editor-tab" + (activeTab === t[0] ? " is-active" : ""),
          dataset: { tab: t[0] },
        },
        Books.icons.get(t[2], 14),
        h("span", null, t[1]),
      );
      btn.addEventListener("click", function () {
        activeTab = t[0];
        renderShell();
      });
      bar.appendChild(btn);
    });
  }
  function renderShell() {
    els.title.textContent = (pkg.manifest.title || "Novo livro") + " — edição";
    renderTabs();
    renderTab();
    refreshValidation();
  }

  async function saveOfflineFallback() {
    var offline = await Books.repo.saveOffline({
      pkg: pkg,
      packages: pendingPackages.length ? pendingPackages : [pkg],
      catalog: Books.state.catalog,
      settings: Books.personalization ? Books.personalization.get() : {},
    });
    Books.state.catalog = Books.repo.normalizeCatalog(offline.catalog);
    Books.repo.bumpAssetVersion();
    Books.state.pkg = Books.util.clone(offline.pkg);
    pkg = Books.util.clone(offline.pkg);
    pendingPackages = [];
    collectionMode = false;
    collectionExportMode = false;
    selectedCollectionIds = {};
    Books.state.dirty = false;
    Books.events.emit("catalog:changed", Books.state.pkg);
    Books.toast.show(
      "Salvo neste navegador. As alterações serão carregadas novamente ao abrir o projeto neste navegador.",
      { tone: "ok", duration: 6000 },
    );
  }

  async function saveToFolder() {
    var report = refreshValidation();
    if (report && !report.ok()) {
      Books.toast.show("Corrija os erros antes de salvar.", { tone: "error" });
      return;
    }
    if (!window.showDirectoryPicker) {
      try {
        await saveOfflineFallback();
      } catch (e) {
        console.error("[editor] fallback offline:", e);
        Books.toast.show(
          "Não foi possível salvar localmente neste navegador: " + e.message,
          { tone: "error", duration: 6500 },
        );
      }
      return;
    }
    var handle;
    try {
      handle =
        dirHandle ||
        (await window.showDirectoryPicker({
          id: "books-project",
          mode: "readwrite",
        }));
    } catch (e) {
      if (e && e.name === "AbortError") return; // usuário cancelou o seletor de pasta — nada a fazer
      console.warn(
        "[editor] seletor de pasta indisponível; usando armazenamento offline:",
        e,
      );
      try {
        await saveOfflineFallback();
      } catch (offlineError) {
        console.error("[editor] fallback offline:", offlineError);
        Books.toast.show(
          "Não foi possível salvar localmente neste navegador: " +
            offlineError.message,
          { tone: "error", duration: 6500 },
        );
      }
      return;
    }
    try {
      dirHandle = handle;
      var result = await Books.repo.saveCollectionToFolder({
        root: dirHandle,
        pkg: pkg,
        packages: pendingPackages.length ? pendingPackages : [pkg],
        catalog: Books.state.catalog,
        progress: Books.progress.all(),
        settings: Books.personalization ? Books.personalization.get() : null,
        resolvePackage: function (id) {
          return id === pkg.manifest.id
            ? null
            : Books.repo.loadPackage(
                Books.state.catalog.packages.find(function (p) {
                  return p.id === id;
                }),
                { ignoreOffline: true },
              );
        },
      });
      Books.state.catalog = Books.repo.normalizeCatalog(result.catalog);
      Books.repo.bumpAssetVersion();
      Books.state.pkg = Books.util.clone(result.pkg || pkg);
      pkg = Books.util.clone(result.pkg || pkg);
      pendingPackages = [];
      collectionMode = false;
      Books.state.dirty = false;
      Books.events.emit("catalog:changed", Books.state.pkg);
      Books.toast.show("Salvo na pasta do projeto.", { tone: "ok" });
    } catch (e) {
      console.error(e);
      Books.toast.show("Não foi possível salvar na pasta: " + e.message, {
        tone: "error",
      });
    }
  }
  async function exportZip(saveFallback, collection, chosenPackages) {
    var report = refreshValidation();
    if (report && !report.ok()) {
      Books.toast.show("Corrija os erros antes de exportar.", { tone: "error" });
      return;
    }
    var catalog = Books.util.clone(Books.state.catalog);
    var files = [];
    var packages = collection
      ? (chosenPackages ? chosenPackages.map(Books.util.clone) : (pendingPackages.length ? pendingPackages.map(Books.util.clone) : await Promise.all(catalog.packages.map(function (entry) { return Books.repo.loadPackage(entry, { ignoreOffline: true }); }))))
      : [Books.util.clone(pkg)];
    for (var pi = 0; pi < packages.length; pi++) {
      var item = packages[pi];
      var assets = await Books.repo.localizeAssets(item);
      var existingAssets = await Books.repo.collectLocalAssets(item, null);
      existingAssets.forEach(function (asset) {
        if (!assets.some(function (current) { return current.path === asset.path; })) assets.push(asset);
      });
      var entry = Books.repo.catalogEntry(item);
      var idx = catalog.packages.findIndex(function (p) { return p.id === entry.id; });
      if (idx === -1) catalog.packages.push(entry); else catalog.packages[idx] = entry;
      var pf = Books.repo.packageFiles(item);
      Object.keys(pf).forEach(function (filePath) {
        files.push({ name: "content/packages/" + item.manifest.id + "/" + filePath, data: JSON.stringify(pf[filePath], null, 2) + "\n" });
      });
      for (var a = 0; a < assets.length; a++) {
        files.push({ name: "content/packages/" + item.manifest.id + "/" + assets[a].path, data: new Uint8Array(await assets[a].blob.arrayBuffer()) });
      }
      Books.repo.remember(item);
    }
    var settingsResult = Books.personalization ? await Books.repo.localizeSettingsAssets(Books.personalization.get(), null) : { settings: null, assets: [] };
    for (var sa = 0; sa < settingsResult.assets.length; sa++) {
      files.push({ name: "content/" + settingsResult.assets[sa].path, data: new Uint8Array(await settingsResult.assets[sa].blob.arrayBuffer()) });
    }
    files.push({
      name: "content/catalog.json",
      data: JSON.stringify(catalog, null, 2) + "\n",
    });
    files.push({
      name: "content/progress.json",
      data:
        JSON.stringify(
          {
            schema: Books.schema.SCHEMAS.progress,
            kind: "book-progress",
            version: 2,
            progress: Books.progress.all() || {},
          },
          null,
          2,
        ) + "\n",
    });
    if (settingsResult.settings)
      files.push({
        name: "content/settings.json",
        data:
          JSON.stringify(
            {
              schema: "books.settings.v1",
              kind: "book-settings",
              version: 1,
              settings: settingsResult.settings,
            },
            null,
            2,
          ) + "\n",
      });
    var blob = Books.zip.build(files);
    Books.util.download(
      (collection ? "livros-conjunto" : pkg.manifest.id) + ".zip",
      await blob.arrayBuffer().then(function (b) {
        return new Uint8Array(b);
      }),
      "application/zip",
    );
    Books.toast.show(
      (collection ? packages.length + " livros exportados" : "Livro exportado") + ". ZIP completo com JSON, capas, imagens e mídia local.",
      { tone: "ok", duration: 5000 },
    );
  }

  function exportCollectionZip() { return exportZip(false, true); }

  function open(id) {
    activeSection = null;
    pendingPackages = [];
    collectionMode = false;
    collectionExportMode = false;
    selectedCollectionIds = {};
    var entry =
      id &&
      Books.state.catalog.packages.find(function (p) {
        return p.id === id;
      });
    var ready = entry
      ? Books.repo.loadPackage(entry)
      : Promise.resolve(blankPackage(promptNewId(), "Novo livro"));
    ready
      .then(function (loaded) {
        pkg = Books.util.clone(loaded);
        Books.state.dirty = !entry;
        els.root.hidden = false;
        document.body.classList.add("overlay-open", "editor-open");
        renderShell();
      })
      .catch(function (e) {
        Books.toast.show("Não foi possível abrir para edição: " + e.message, {
          tone: "error",
        });
      });
  }

  function openCollection() {
    activeSection = null;
    collectionMode = true;
    activeTab = "import";
    var entries = Books.state.catalog.packages || [];
    Promise.all(entries.map(function (entry) { return Books.repo.loadPackage(entry); }))
      .then(function (packages) {
        pendingPackages = packages;
        pkg = packages[0] || blankPackage(promptNewId(), "Novo livro");
        if (!packages.length) pendingPackages = [pkg];
        activeSection = pkg.sections[0] || null;
        Books.state.dirty = true;
        els.root.hidden = false;
        document.body.classList.add("overlay-open", "editor-open");
        renderShell();
      })
      .catch(function (e) { Books.toast.show("Não foi possível abrir o conjunto: " + e.message, { tone: "error" }); });
  }

  function openCollectionImport(file) {
    importZip(file).then(function (result) {
      confirmImportedPackages(result.packages, function (selected) {
        pendingPackages = selected; pkg = selected[0]; collectionMode = true; activeTab = "import";
        els.root.hidden = false; document.body.classList.add("overlay-open", "editor-open"); renderShell();
        Books.toast.show(selected.length + " livros carregados para revisão e diff.", { tone: "ok", duration: 5000 });
      });
    }).catch(function (e) { Books.toast.show("Não foi possível importar o conjunto: " + e.message, { tone: "error" }); });
  }
  function promptNewId() {
    var n = 1,
      id;
    do {
      id = "novo-livro" + (n > 1 ? "-" + n : "");
      n++;
    } while (
      Books.state.catalog.packages.some(function (p) {
        return p.id === id;
      })
    );
    return id;
  }
  function close() {
    if (
      Books.state.dirty &&
      !confirm("Sair sem salvar? As alterações deste livro serão perdidas.")
    )
      return;
    Books.state.dirty = false;
    pendingPackages = [];
    collectionMode = false;
    collectionExportMode = false;
    selectedCollectionIds = {};
    els.root.hidden = true;
    document.body.classList.remove("overlay-open", "editor-open");
  }

  function init() {
    els.root = document.getElementById("editorOverlay");
    els.title = document.getElementById("editorTitle");
    els.tabs = document.getElementById("editorTabs");
    els.body = document.getElementById("editorBody");
    els.validation = document.getElementById("editorValidation");
    els.saveBtn = document.getElementById("editorSave");
    els.closeBtn = document.getElementById("editorClose");
    els.closeBtn.addEventListener("click", close);
    els.saveBtn.addEventListener("click", saveToFolder);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("editor-open"))
        close();
    });
    Books.events.on("library:new", function () {
      Books.library.close();
      open(null);
    });
    Books.events.on("library:new-set", function () {
      Books.library.close();
      openCollection();
    });
    Books.events.on("library:import-set", function (file) {
      Books.library.close();
      openCollectionImport(file);
    });
    Books.events.on("editor:open", function (id) {
      open(id);
    });
  }

  Books.editor = { init: init, open: open, openCollection: openCollection, openCollectionImport: openCollectionImport, close: close };
})();
