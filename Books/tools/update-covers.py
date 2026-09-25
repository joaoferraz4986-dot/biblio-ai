#!/usr/bin/env python3
"""Atualiza apenas referências de capas de livros para o formato horizontal 16:9."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
USE = {
    "arquitetura-memoria-cpp": "cover.jpg",
    "combinatoria-computacao": "cover.jpg",
    "programacao-competitiva-cpp": "cover.svg",
    "reinos-microscopicos": "cover.svg",
    "computacao-quantica": "cover.svg",
    "sistemas-embarcados-arduino": "cover.svg",
}

def load(p):
    return json.loads(p.read_text(encoding="utf-8"))

def save(p, value):
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

catalog_path = CONTENT / "catalog.json"
catalog = load(catalog_path)
for entry in catalog.get("packages", []):
    book_id = entry["id"]
    if book_id not in USE:
        continue
    pkg = CONTENT / "packages" / book_id
    header_path = pkg / "header.json"
    header = load(header_path)
    cover = header.setdefault("cover", {})
    cover["src"] = USE[book_id]
    cover["ratio"] = "16:9"
    if not cover.get("alt"):
        cover["alt"] = "Capa horizontal de " + header.get("title", book_id)
    save(header_path, header)
    entry["cover"] = {"src": f"packages/{book_id}/{cover['src']}", "alt": cover["alt"], "ratio": "16:9"}
save(catalog_path, catalog)
print("Capas atualizadas: " + ", ".join(sorted(USE)))
