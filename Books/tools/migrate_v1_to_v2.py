#!/usr/bin/env python3
"""
Migra um pacote de livro do formato v1 (seções com HTML cru, schema `memcpp.*.v1`)
para o formato v2 (seções com blocos tipados, schema `books.*.v2`).

Uso:
    python3 tools/migrate_v1_to_v2.py content/packages/<id> [--out content/packages/<id>]

O que a migração faz:
  * <p>, <h3>, <ul>, <table>, <pre class="code">, <svg>, mermaid-card, callouts,
    key-points, <details> e mem-section viram blocos (ver docs/FORMATO-DO-LIVRO.md);
  * HTML inline (<strong>, <em>, <code>, <a>) vira marcação inline (**negrito**, *itálico*,
    `código`, [texto](url));
  * qualquer trecho que a conversão não reconheça vira um bloco `html` (sem perda de dados)
    e é listado no relatório final.

Requer: beautifulsoup4 (pip install beautifulsoup4).
"""
import argparse
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ACCENT_LEGACY = {
    "text": "blue", "rodata": "teal", "data": "amber", "bss": "gray",
    "stack": "violet", "heap": "orange", "obj": "pink", "kernel": "slate",
}
SVG_ATTR_FIX = {
    "viewbox": "viewBox", "markerheight": "markerHeight", "markerwidth": "markerWidth",
    "refx": "refX", "refy": "refY", "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits", "patternunits": "patternUnits", "textlength": "textLength",
}
CALLOUT_VARIANT_BY_TITLE = [
    (r"confus", "warning"),
    (r"distin", "info"),
    (r"nota de precis", "info"),
    (r"detalhe", "tip"),
]

report = []


def warn(msg):
    report.append(msg)


# ───────────────────────────── inline ─────────────────────────────
def esc(text):
    text = text.replace("\\", "\\\\").replace("*", "\\*").replace("`", "\\`")
    text = text.replace("{", "\\{").replace("[", "\\[")
    text = text.replace("~~", "\\~\\~")
    return text


def wrap(mark_open, inner, mark_close=None):
    mark_close = mark_close or mark_open
    lead = inner[: len(inner) - len(inner.lstrip())]
    trail = inner[len(inner.rstrip()):]
    core = inner.strip()
    if not core:
        return inner
    return f"{lead}{mark_open}{core}{mark_close}{trail}"


def code_span(text):
    text = re.sub(r"\s+", " ", text)
    if "`" in text:
        return f"`` {text} ``"
    return f"`{text}`"


def inline(nodes):
    out = []
    for n in nodes:
        if isinstance(n, NavigableString):
            out.append(esc(re.sub(r"\s+", " ", str(n))))
            continue
        if not isinstance(n, Tag):
            continue
        name = n.name
        cls = n.get("class") or []
        if name in ("strong", "b"):
            out.append(wrap("**", inline(n.children)))
        elif name in ("em", "i"):
            out.append(wrap("*", inline(n.children)))
        elif name == "code":
            out.append(code_span(n.get_text()))
        elif name == "a":
            href = n.get("href", "")
            out.append(f"[{inline(n.children).strip()}]({href})")
        elif name == "br":
            out.append("\n")
        elif name == "span" and "ok" in cls:
            out.append(wrap("{ok|", inline(n.children), "}"))
        elif name == "span":
            warn(f"<span class={cls}> convertido em texto puro: {n.get_text()[:40]!r}")
            out.append(inline(n.children))
        else:
            warn(f"tag inline <{name}> convertida em texto puro")
            out.append(inline(n.children))
    return "".join(out)


def inline_str(tag):
    return re.sub(r"[ \t]+", " ", inline(tag.children)).strip()


# ───────────────────────────── helpers ─────────────────────────────
def accent_of(tag):
    style = tag.get("style", "") if isinstance(tag, Tag) else ""
    m = re.search(r"--accent\s*:\s*var\(--c-([a-z]+)\)", style)
    return ACCENT_LEGACY.get(m.group(1)) if m else None


def dedent(text):
    lines = text.strip("\n").split("\n")
    indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
    cut = min(indents) if indents else 0
    return "\n".join(l[cut:].rstrip() for l in lines).strip("\n")


def guess_language(code, hint=""):
    h = hint.lower()
    if "c++" in h or "código" in h and "asm" not in h:
        return "cpp"
    if "tradu" in h or "assembly" in h or "asm" in h:
        return "asm"
    if re.search(r"^\s*(\.section|\.text|\.data|\.globl|\.string|\.long|\.quad|\.zero)\b", code, re.M) or re.search(r"%[re]?[a-d]x|%[re]?[sb]p|%edi|%esi", code):
        return "asm"
    if re.search(r"^\s*(\$|cat |readelf|objdump|g\+\+|gcc|nm |ldd)", code, re.M):
        return "bash"
    return "cpp"


def split_title_number(h):
    """Devolve (numero, titulo) a partir de um <h2>."""
    num_span = h.find("span", class_="num")
    if num_span:
        number = num_span.get_text().strip().rstrip(".")
        num_span.extract()
        return number, inline_str(h)
    text = h.get_text().strip()
    m = re.match(r"^(\d+(?:\.\d+)*)\.?\s+", text)
    if m:
        first = h.contents[0] if h.contents else None
        if isinstance(first, NavigableString):
            first.replace_with(re.sub(r"^\s*\d+(?:\.\d+)*\.?\s+", "", str(first)))
        return m.group(1), inline_str(h)
    return "", inline_str(h)


def svg_to_string(svg):
    s = str(svg)
    for low, cam in SVG_ATTR_FIX.items():
        s = re.sub(rf"(\s){low}=", rf"\1{cam}=", s)
    s = s.replace("<lineargradient", "<linearGradient").replace("</lineargradient", "</linearGradient")
    return s


# ───────────────────────────── blocks ─────────────────────────────
def callout_from(tag, default_variant):
    title = ""
    kids = [c for c in tag.children]
    first = next((c for c in kids if not (isinstance(c, NavigableString) and not str(c).strip())), None)
    if isinstance(first, Tag) and first.name in ("strong", "b"):
        raw = inline_str(first)
        title = re.sub(r"[\s:.]+$", "", raw)
        first.extract()
    text = inline_str(tag)
    text = re.sub(r"^[\s:]+", "", text)
    if title and text and text[0].isalpha():
        text = text[0].upper() + text[1:]  # o título assume o "início" da frase
    variant = default_variant
    for pat, v in CALLOUT_VARIANT_BY_TITLE:
        if default_variant == "note" and re.search(pat, title, re.I):
            variant = v
    block = {"type": "callout", "variant": variant}
    if title:
        block["title"] = title
    block["text"] = text
    return block


def table_block(table):
    rows = table.find_all("tr")
    header, body = [], []
    for tr in rows:
        ths = tr.find_all("th")
        if ths and not header:
            header = [inline_str(th) for th in ths]
            continue
        cells = []
        for td in tr.find_all("td"):
            content = inline_str(td)
            if "ok" in (td.get("class") or []):
                content = "{ok|" + content + "}"
            cells.append(content)
        body.append(cells)
    return {"type": "table", "header": header, "rows": body}


def convert_children(parent, level_inside_subsection=False):
    blocks = []
    kids = [c for c in parent.children if isinstance(c, Tag)]
    i = 0
    while i < len(kids):
        tag = kids[i]
        cls = tag.get("class") or []
        name = tag.name

        # h3 seguido de pre.code "Código…"/"Tradução…": vira título do bloco de código
        if name == "h3" and i + 1 < len(kids) and kids[i + 1].name == "pre" and "code" in (kids[i + 1].get("class") or []):
            title = inline_str(tag)
            if re.match(r"(?i)^(c[óo]digo|tradu[çc][ãa]o)", title):
                pre = kids[i + 1]
                code = dedent(pre.get_text())
                blocks.append({"type": "code", "language": guess_language(code, title), "title": title, "code": code})
                i += 2
                continue

        if name == "div" and "callout" in cls:
            blocks.append(callout_from(tag, "note"))
        elif name == "p":
            if "callout" in cls:
                blocks.append(callout_from(tag, "note"))
            else:
                b = {"type": "paragraph", "text": inline_str(tag)}
                if "section-lead" in cls:
                    b["lead"] = True
                blocks.append(b)
        elif name == "h3":
            blocks.append({"type": "heading", "level": 4 if level_inside_subsection else 3, "text": inline_str(tag)})
        elif name == "h4":
            blocks.append({"type": "heading", "level": 4, "text": inline_str(tag)})
        elif name == "ul" or name == "ol":
            items = [inline_str(li) for li in tag.find_all("li", recursive=False)]
            blocks.append({"type": "list", "style": "number" if name == "ol" else "bullet", "items": items})
        elif name == "pre" and "code" in cls:
            code = dedent(tag.get_text())
            blocks.append({"type": "code", "language": guess_language(code), "code": code})
        elif name == "pre" and "mermaid" in cls:
            blocks.append({"type": "mermaid", "code": dedent(tag.get_text())})
        elif name == "div" and "mermaid-card" in cls:
            cap = tag.find("p", class_="cap")
            pre = tag.find("pre", class_="mermaid")
            b = {"type": "mermaid", "code": dedent(pre.get_text())}
            if cap:
                b["caption"] = inline_str(cap)
            acc = accent_of(tag)
            if acc:
                b["accent"] = acc
            blocks.append(b)
        elif name == "div" and "key-point" in cls:
            blocks.append(callout_from(tag, "key"))
        elif name == "div" and ("table-scroll" in cls or "glossary-wrap" in cls):
            table = tag.find("table")
            if table:
                blocks.append(table_block(table))
            else:
                blocks.append({"type": "html", "html": str(tag)})
                warn("bloco table-scroll sem <table> mantido como html")
        elif name == "table":
            blocks.append(table_block(tag))
        elif name == "div" and "svg-frame" in cls:
            svg = tag.find("svg")
            title = svg.find("title") if svg else None
            alt_text = title.get_text().strip() if title else (svg.get("aria-label", "").strip() if svg else "")
            b = {"type": "svg", "svg": svg_to_string(svg)}
            if alt_text:
                b["alt"] = alt_text
            blocks.append(b)
        elif name == "details":
            summary = tag.find("summary")
            label = inline_str(summary) if summary else "Detalhes"
            label = re.sub(r"^[▸▶►\s]+", "", label)
            if summary:
                summary.extract()
            blocks.append({"type": "details", "summary": label, "blocks": convert_children(tag, level_inside_subsection)})
        elif name in ("section", "div") and "mem-section" in cls:
            tag_span = tag.find("span", class_="section-tag")
            tag_text = tag_span.get_text().strip() if tag_span else ""
            if tag_span:
                tag_span.extract()
            h2 = tag.find("h2")
            number, title = split_title_number(h2) if h2 else ("", "")
            if h2:
                h2.extract()
            sub = {"type": "subsection", "id": tag.get("id", ""), "number": number, "title": title}
            if tag_text:
                sub["tag"] = tag_text
            acc = accent_of(tag)
            if acc:
                sub["accent"] = acc
            sub["blocks"] = convert_children(tag, True)
            blocks.append(sub)
        else:
            blocks.append({"type": "html", "html": str(tag)})
            warn(f"elemento <{name} class={cls}> mantido como bloco html")
        i += 1
    return blocks


def convert_section(v1, index):
    soup = BeautifulSoup(v1["html"], "html.parser")
    h2 = soup.find("h2", recursive=False)
    number, title = ("", v1.get("title", ""))
    if h2:
        number, title = split_title_number(h2)
        h2.extract()
    section = {
        "schema": "books.section.v2",
        "kind": "book-section",
        "id": v1["id"],
        "number": number,
        "title": title,
    }
    if v1.get("style"):
        acc = accent_of(BeautifulSoup(f'<i style="{v1["style"]}"></i>', "html.parser").i)
        if acc:
            section["accent"] = acc
    section["blocks"] = convert_children(soup)
    return section


def convert_header(v1):
    def inl(html):
        return inline_str(BeautifulSoup(f"<div>{html or ''}</div>", "html.parser").div)

    legend = []
    for item in v1.get("legend", []):
        m = re.search(r"var\(--c-([a-z]+)\)", item.get("color", ""))
        legend.append({"label": item.get("label", ""), "color": ACCENT_LEGACY.get(m.group(1), item.get("color")) if m else item.get("color", "gray")})
    cover = v1.get("cover")
    if cover and cover.get("src", "").startswith("packages/"):
        cover = {**cover, "src": cover["src"].split("/", 2)[2]}
    header = {
        "schema": "books.header.v2",
        "kind": "book-header",
        "id": v1.get("id", ""),
        "kicker": inl(v1.get("kicker")),
        "title": inl(v1.get("title")),
        "subtitle": inl(v1.get("subtitle")),
        "guideTitle": inl(v1.get("guideTitle")),
        "guideText": inl(v1.get("guideText")),
        "cover": cover,
        "legend": legend,
        "footer": "",
    }
    return header


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("package_dir")
    ap.add_argument("--out", default=None)
    ap.add_argument("--footer", default="")
    ap.add_argument("--tags", default="")
    args = ap.parse_args()
    src = Path(args.package_dir)
    out = Path(args.out) if args.out else src
    manifest = json.loads((src / "manifest.json").read_text(encoding="utf-8"))
    header = json.loads((src / manifest["header"]).read_text(encoding="utf-8"))
    if not str(manifest.get("schema", "")).startswith("memcpp."):
        sys.exit("Este pacote não parece estar no formato v1.")

    (out / "sections").mkdir(parents=True, exist_ok=True)
    section_paths = []
    for path in manifest["sections"]:
        v1 = json.loads((src / path).read_text(encoding="utf-8"))
        v2 = convert_section(v1, len(section_paths))
        target = out / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(v2, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        section_paths.append(path)

    header_v2 = convert_header(header)
    header_v2["footer"] = args.footer
    (out / manifest["header"]).write_text(json.dumps(header_v2, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    manifest_v2 = {
        "schema": "books.package.v2",
        "kind": "book-package",
        "id": manifest["id"],
        "title": manifest["title"],
        "description": header_v2["subtitle"],
        "language": "pt-BR",
        "tags": [t.strip() for t in args.tags.split(",") if t.strip()],
        "header": manifest["header"],
        "sections": section_paths,
    }
    (out / "manifest.json").write_text(json.dumps(manifest_v2, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {len(section_paths)} seções migradas para {out}")
    if report:
        print("\nAvisos:")
        for line in sorted(set(report)):
            print("  -", line)


if __name__ == "__main__":
    main()
