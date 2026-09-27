(function () {
  "use strict";
  var S = Books.schema;

  function Report() {
    this.errors = [];
    this.warnings = [];
  }
  Report.prototype.error = function (path, message) {
    this.errors.push({ path: path, message: message });
  };
  Report.prototype.warn = function (path, message) {
    this.warnings.push({ path: path, message: message });
  };
  Report.prototype.ok = function () {
    return this.errors.length === 0;
  };
  Report.prototype.format = function () {
    var lines = [];
    this.errors.forEach(function (e) {
      lines.push("✖ " + e.path + ": " + e.message);
    });
    this.warnings.forEach(function (w) {
      lines.push("⚠ " + w.path + ": " + w.message);
    });
    return lines.join("\n");
  };

  var MERMAID_START =
    /^\s*(?:%%[^\n]*\n\s*)*(?:---[\s\S]*?---\s*)?(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline|sankey(?:-beta)?|xychart(?:-beta)?|block(?:-beta)?|packet(?:-beta)?|architecture(?:-beta)?|C4Context|C4Container|C4Component|C4Dynamic|kanban)\b/;

  function isString(v) {
    return typeof v === "string";
  }
  function isObj(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }
  function invalidLatex(value) {
    return /(?<!\\)\\[0-9]|(?<!\\)\\[\u0300-\u036f]/u.test(String(value || ""));
  }

  function validateItems(items, path, report) {
    if (!Array.isArray(items)) {
      report.error(path, "deve ser uma lista");
      return;
    }
    if (!items.length) report.error(path, "a lista não pode ser vazia");
    items.forEach(function (item, i) {
      var p = path + "[" + i + "]";
      if (isString(item)) return;
      if (isObj(item) && isString(item.text)) {
        if (item.items != null) validateItems(item.items, p + ".items", report);
        return;
      }
      report.error(
        p,
        'cada item deve ser texto ou { "text": "...", "items": [...] }',
      );
    });
  }

  function validateField(field, block, path, report, ctx) {
    var value = block[field.key];
    var p = path + "." + field.key;
    var missing = value === undefined || value === null || value === "";
    if (missing) {
      if (field.required && !(field.kind === "bool"))
        report.error(p, "campo obrigatório");
      return;
    }
    switch (field.kind) {
      case "line":
      case "text":
      case "code":
      case "plain":
      case "lines":
      case "image":
      case "video":
        if (!isString(value)) report.error(p, "deve ser texto");
        else if (field.pattern && !new RegExp(field.pattern).test(value))
          report.error(p, "formato inválido (esperado " + field.pattern + ")");
        break;
      case "number":
        if (typeof value !== "number" || !Number.isFinite(value)) report.error(p, "deve ser um número finito");
        else if (field.min != null && value < field.min) report.error(p, "não pode ser menor que " + field.min);
        else if (field.max != null && value > field.max) report.error(p, "não pode ser maior que " + field.max);
        break;
      case "history-image":
        if (!isObj(value)) {
          report.error(p, "deve ser um objeto com src e alt");
          break;
        }
        if (!isString(value.src) || !value.src)
          report.error(p + ".src", "imagem sem `src`");
        if (!isString(value.alt) || !value.alt.trim())
          report.error(p + ".alt", "imagem sem texto alternativo");
        break;
      case "select": {
        var allowed = field.options.map(function (o) {
          return String(o[0]);
        });
        if (allowed.indexOf(String(value)) === -1)
          report.error(
            p,
            'valor "' + value + '" inválido; use um de: ' + allowed.join(", "),
          );
        break;
      }
      case "bool":
        if (typeof value !== "boolean")
          report.error(p, "deve ser true ou false");
        break;
      case "accent":
        if (!S.accentCss(value))
          report.warn(
            p,
            'cor "' +
              value +
              '" desconhecida; use ' +
              S.ACCENTS.map(function (a) {
                return a.id;
              }).join(", ") +
              " ou #hex",
          );
        break;
      case "items":
        validateItems(value, p, report);
        break;
      case "blocks":
        validateBlocks(value, p, report, ctx);
        break;
      case "columns":
        if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
          report.error(p, "use de 1 a 4 colunas");
          break;
        }
        value.forEach(function (col, i) {
          if (!isObj(col))
            report.error(p + "[" + i + "]", "coluna deve ser objeto");
          else
            validateBlocks(col.blocks, p + "[" + i + "].blocks", report, ctx);
        });
        break;
      case "group-list":
        if (!Array.isArray(value) || !value.length) {
          report.error(p, "deve ser uma lista não vazia");
          break;
        }
        value.forEach(function (item, i) {
          if (!isObj(item)) {
            report.error(p + "[" + i + "]", "item deve ser objeto");
            return;
          }
          field.fields.forEach(function (f) {
            validateField(f, item, p + "[" + i + "]", report, ctx);
          });
        });
        break;
      default:
        break;
    }
  }

  function validateTable(b, path, report) {
    if (!Array.isArray(b.header) || !b.header.length) {
      report.error(path + ".header", "informe ao menos uma coluna");
      return;
    }
    if (!b.header.every(isString))
      report.error(path + ".header", "todas as colunas devem ser texto");
    if (!Array.isArray(b.rows)) {
      report.error(path + ".rows", "deve ser uma lista de linhas");
      return;
    }
    b.rows.forEach(function (row, i) {
      if (!Array.isArray(row) || !row.every(isString))
        report.error(
          path + ".rows[" + i + "]",
          "a linha deve ser uma lista de textos",
        );
      else if (row.length !== b.header.length)
        report.warn(
          path + ".rows[" + i + "]",
          "tem " + row.length + " células; o cabeçalho tem " + b.header.length,
        );
    });
  }

  function containsExercise(blocks) {
    return (blocks || []).some(function (item) {
      return (
        item.type === "exercise" ||
        containsExercise(item.blocks) ||
        containsExercise(item.solutionBlocks)
      );
    });
  }

  function validateBlock(block, path, report, ctx) {
    if (!isObj(block)) {
      report.error(path, "bloco deve ser um objeto");
      return;
    }
    var def = Books.blocks.get(block.type);
    if (!def) {
      report.error(
        path + ".type",
        'tipo de bloco desconhecido: "' +
          block.type +
          '". Tipos válidos: ' +
          Books.blocks
            .list()
            .map(function (d) {
              return d.type;
            })
            .join(", "),
      );
      return;
    }
    if (block.id != null) {
      if (!isString(block.id) || !S.LIMITS.anchorId.test(block.id))
        report.error(path + ".id", "id inválido");
      else claimId(block.id, path + ".id", report, ctx);
    }
    if (block.type === "table") {
      validateTable(block, path, report);
      (def.fields || [])
        .filter(function (f) {
          return f.key === "caption";
        })
        .forEach(function (f) {
          validateField(f, block, path, report, ctx);
        });
      return;
    }
    def.fields.forEach(function (field) {
      if (field.kind === "table") return;
      validateField(field, block, path, report, ctx);
    });
    if (block.type === "subsection" && isString(block.id))
      claimId(block.id, path + ".id", report, ctx, true);
    if (block.type === "subsection" && !containsExercise(block.blocks))
      report.warn(
        path + ".blocks",
        "subseção sem exercício local; adicione uma exercise relacionada ao conteúdo ensinado",
      );
    if (
      block.type === "callout" &&
      !block.text &&
      !(block.blocks && block.blocks.length)
    )
      report.error(path, "callout precisa de `text` ou `blocks`");
    if (
      block.type === "mermaid" &&
      isString(block.code) &&
      !MERMAID_START.test(block.code)
    )
      report.warn(
        path + ".code",
        "não começa com um tipo de diagrama Mermaid conhecido (flowchart, sequenceDiagram…)",
      );
    if (block.type === "ai-diagram") {
      if (
        block.engine === "mermaid" &&
        isString(block.source) &&
        !MERMAID_START.test(block.source)
      )
        report.warn(path + ".source", "não parece código Mermaid válido");
      if (
        block.engine === "svg" &&
        isString(block.source) &&
        !/<svg[\s>]/i.test(block.source)
      )
        report.error(path + ".source", 'engine "svg" exige um elemento <svg>');
    }
    if (
      block.type === "svg" &&
      isString(block.svg) &&
      !/<svg[\s>]/i.test(block.svg)
    )
      report.error(path + ".svg", "não contém um elemento <svg>");
    if (block.type === "svg" && !block.alt)
      report.warn(path + ".alt", "descreva o SVG em `alt` (acessibilidade)");
    if (block.type === "image" && !block.alt)
      report.warn(path + ".alt", "imagem sem texto alternativo");
    if (block.type === "iframe") {
      if (!/^https:\/\//i.test(String(block.src || "")))
        report.error(path + ".src", "iframe deve usar uma URL https://");
      if (!block.title || !String(block.title).trim())
        report.error(path + ".title", "iframe precisa de título acessível");
    }
    if (block.type === "video" && !/^(?:data:video\/|https:\/\/|media\/|videos\/)/i.test(String(block.src || "")))
      report.error(path + ".src", "vídeo deve ser data:video, URL https:// ou caminho local media/ / videos/");
    if (block.type === "math" && invalidLatex(block.tex))
      report.error(
        path + ".tex",
        "LaTeX inválido: barra invertida seguida de dígito ou caractere invisível",
      );
    ["text", "caption", "shortBio", "insight"].forEach(function (key) {
      if (isString(block[key]) && invalidLatex(block[key]))
        report.error(
          path + "." + key,
          "LaTeX inline inválido: barra invertida seguida de dígito ou caractere invisível",
        );
    });
    if (isString(block.text)) collectLinks(block.text, path + ".text", ctx);
  }

  function collectLinks(text, path, ctx) {
    if (!ctx.links) return;
    var re = /\]\(#([^)\s]+)\)/g,
      m;
    while ((m = re.exec(text)) !== null)
      ctx.links.push({ id: m[1], path: path });
  }

  function claimId(id, path, report, ctx, alreadyChecked) {
    if (ctx.ids[id] && !alreadyChecked)
      report.error(
        path,
        'id duplicado no livro: "' + id + '" (também em ' + ctx.ids[id] + ")",
      );
    else if (!ctx.ids[id]) ctx.ids[id] = path;
  }

  function validateBlocks(blocks, path, report, ctx) {
    if (!Array.isArray(blocks)) {
      report.error(path, "deve ser uma lista de blocos");
      return;
    }
    blocks.forEach(function (block, i) {
      validateBlock(block, path + "[" + i + "]", report, ctx);
    });
  }

  function validateSection(section, path, report, ctx) {
    if (!isObj(section)) {
      report.error(path, "seção inválida");
      return;
    }
    if (section.schema !== S.SCHEMAS.section)
      report.error(path + ".schema", 'esperado "' + S.SCHEMAS.section + '"');
    if (section.kind !== "book-section")
      report.error(path + ".kind", 'esperado "book-section"');
    if (!isString(section.id) || !S.LIMITS.sectionId.test(section.id))
      report.error(
        path + ".id",
        "id inválido (use minúsculas, números e hífens)",
      );
    else claimId(section.id, path + ".id", report, ctx);
    if (!isString(section.title) || !section.title.trim())
      report.error(path + ".title", "título obrigatório");
    if (section.number != null && !isString(section.number))
      report.error(path + ".number", "deve ser texto");
    if (!Array.isArray(section.blocks))
      report.error(path + ".blocks", "seção precisa de uma lista `blocks`");
    else {
      if (!section.blocks.length)
        report.warn(path + ".blocks", "seção sem blocos");
      validateBlocks(section.blocks, path + ".blocks", report, ctx);
    }
  }

  function validateHeader(header, report) {
    if (!isObj(header)) {
      report.error("header", "header ausente");
      return;
    }
    if (header.schema !== S.SCHEMAS.header)
      report.error("header.schema", 'esperado "' + S.SCHEMAS.header + '"');
    [
      "kicker",
      "title",
      "subtitle",
      "guideTitle",
      "guideText",
      "footer",
    ].forEach(function (k) {
      if (header[k] != null && !isString(header[k]))
        report.error("header." + k, "deve ser texto");
    });
    if (header.cover) {
      if (!isString(header.cover.src) || !header.cover.src)
        report.error("header.cover.src", "capa sem `src`");
      if (["16:9", "9:16", "3:4", "1:1"].indexOf(header.cover.ratio) === -1)
        report.error(
          "header.cover.ratio",
          "proporção deve ser 16:9, 9:16, 3:4 ou 1:1",
        );
      if (!header.cover.alt)
        report.warn("header.cover.alt", "capa sem texto alternativo");
    }
    if (header.legend != null) {
      if (!Array.isArray(header.legend))
        report.error("header.legend", "deve ser uma lista");
      else
        header.legend.forEach(function (item, i) {
          if (!isObj(item) || !isString(item.label))
            report.error("header.legend[" + i + "]", "item precisa de `label`");
          else if (!S.accentCss(item.color))
            report.warn(
              "header.legend[" + i + "].color",
              'cor "' + item.color + '" desconhecida',
            );
        });
    }
  }

  function validatePackage(pkg) {
    var report = new Report();
    if (!isObj(pkg)) {
      report.error("", "pacote inválido");
      return report;
    }
    var m = pkg.manifest;
    if (!isObj(m)) report.error("manifest", "manifest ausente");
    else {
      if (m.schema !== S.SCHEMAS.package)
        report.error("manifest.schema", 'esperado "' + S.SCHEMAS.package + '"');
      if (m.kind !== "book-package")
        report.error("manifest.kind", 'esperado "book-package"');
      if (!isString(m.id) || !S.LIMITS.bookId.test(m.id))
        report.error(
          "manifest.id",
          "id inválido (minúsculas, números e hífens)",
        );
      if (!isString(m.title) || !m.title.trim())
        report.error("manifest.title", "título obrigatório");
      if (m.tags != null && !(Array.isArray(m.tags) && m.tags.every(isString)))
        report.error("manifest.tags", "deve ser uma lista de textos");
    }
    validateHeader(pkg.header, report);
    var ctx = { ids: {}, links: [] };
    if (!Array.isArray(pkg.sections) || !pkg.sections.length)
      report.error("sections", "o livro precisa de ao menos uma seção");
    else
      pkg.sections.forEach(function (s, i) {
        validateSection(s, "sections[" + i + "]", report, ctx);
      });
    ctx.links.forEach(function (l) {
      if (!ctx.ids[l.id])
        report.warn(l.path, 'link interno para "#' + l.id + '" não encontrado');
    });
    return report;
  }

  Books.validate = {
    Report: Report,
    package: validatePackage,
    block: function (block) {
      var r = new Report();
      validateBlock(block, "block", r, { ids: {}, links: [] });
      return r;
    },
    section: function (section) {
      var r = new Report();
      validateSection(section, "section", r, { ids: {}, links: [] });
      return r;
    },
    header: function (header) {
      var r = new Report();
      validateHeader(header, r);
      return r;
    },
  };
})();
