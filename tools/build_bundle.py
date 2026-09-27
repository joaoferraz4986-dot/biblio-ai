#!/usr/bin/env python3
"""
Gera assets/js/embedded-bundle.js a partir de content/*.json.

Por que existe: abrindo Livros.html com duplo clique (file://), o navegador bloqueia
`fetch()` de arquivos locais (CORS), então o site não consegue ler content/*.json
normalmente. Este script empacota todo o conteúdo (catálogo, progresso e cada
manifest/header/seção de cada livro) num único arquivo JS que define
`globalThis.__BOOKS_BUNDLE__`, carregado por uma tag <script> comum (que funciona
em file://). Imagens continuam como arquivos separados — só o JSON precisa disso.

Rode este script sempre que editar os arquivos em content/ fora do editor visual
(o editor, ao salvar numa pasta, já regenera o bundle sozinho).

Uso:
    python3 tools/build_bundle.py [pasta_do_projeto]
"""
import json
import sys
from pathlib import Path


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
    content = root / "content"
    catalog = load(content / "catalog.json")
    progress_path = content / "progress.json"
    progress = load(progress_path) if progress_path.exists() else {
        "schema": "books.progress.v2", "kind": "book-progress", "version": 2, "progress": {}
    }

    settings_path = content / "settings.json"
    settings_doc = load(settings_path) if settings_path.exists() else {"settings": {}}

    packages = {}
    for entry in catalog.get("packages", []):
        book_id = entry["id"]
        pkg_dir = content / Path(entry["manifest"]).parent
        manifest = load(content / entry["manifest"])
        header = load(pkg_dir / manifest["header"])
        sections = [load(pkg_dir / s) for s in manifest["sections"]]
        rights_path = pkg_dir / "image-rights.json"
        rights = load(rights_path) if rights_path.exists() else {"schema": "books.image-rights.v1", "kind": "image-rights", "files": {}}
        packages[book_id] = {"manifest": manifest, "header": header, "sections": sections, "imageRights": rights.get("files", {})}

    bundle = {"schema": "books.bundle.v2", "catalog": catalog, "progress": progress, "settings": settings_doc.get("settings", {}), "packages": packages}
    out = root / "assets" / "js" / "embedded-bundle.js"
    out.write_text(
        "/* Gerado automaticamente por tools/build_bundle.py — não edite à mão.\n"
        "   Permite abrir Livros.html com duplo clique (file://), sem servidor. */\n"
        "globalThis.__BOOKS_BUNDLE__ = " + json.dumps(bundle, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    sizes = ", ".join(f"{k} ({len(v['sections'])} seções)" for k, v in packages.items())
    print(f"OK: {out.relative_to(root)} gerado com {len(packages)} livro(s): {sizes}")


if __name__ == "__main__":
    main()
