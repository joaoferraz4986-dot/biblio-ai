#!/usr/bin/env python3
"""Valida projetos didáticos Arduino/Wokwi fora do catálogo de livros."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
EXAMPLES = ROOT / "examples" / "arduino"
ALLOWED = {"wokwi-arduino-uno", "wokwi-breadboard-mini", "wokwi-pushbutton", "wokwi-led", "wokwi-resistor"}

def fail(msg):
    raise SystemExit(f"ERRO: {msg}")

def main():
    catalog = json.loads((ROOT / "content/catalog.json").read_text())
    if catalog.get("packages"):
        fail("o catálogo não está vazio; este repositório deve distribuir zero livros")
    tracked_books = [p for p in (ROOT / "content/packages").iterdir() if p.name != ".gitkeep"]
    if tracked_books:
        fail("há pacote(s) de livro em content/packages: " + ", ".join(p.name for p in tracked_books))
    projects = sorted(p for p in EXAMPLES.iterdir() if p.is_dir())
    if not projects:
        fail("nenhum projeto Arduino encontrado")
    for project in projects:
        if project.name == "01-led-button":
            diagram = json.loads((project / "diagram.json").read_text())
            ids = [part.get("id") for part in diagram.get("parts", [])]
            if len(ids) != len(set(ids)) or any(not i for i in ids):
                fail(f"IDs inválidos em {project}")
            known = set(ids)
            for conn in diagram.get("connections", []):
                if len(conn) != 4:
                    fail(f"conexão inválida em {project}: {conn}")
                for endpoint in conn[:2]:
                    if ":" not in endpoint or endpoint.split(":", 1)[0] not in known:
                        fail(f"endpoint desconhecido em {project}: {endpoint}")
            unknown = [p["type"] for p in diagram["parts"] if p.get("type") not in ALLOWED]
            if unknown:
                fail(f"tipo Wokwi não reconhecido em {project}: {unknown}")
            for required in ("sketch.ino", "wokwi.toml", "README.md"):
                if not (project / required).is_file():
                    fail(f"arquivo ausente em {project}: {required}")
        if project.name == "02-protoboard-power":
            for svg in project.glob("*.svg"):
                text = svg.read_text()
                if "<svg" not in text or "viewBox" not in text:
                    fail(f"SVG sem viewBox em {svg}")
        if project.name == "03-rc-analysis" and not (project / "rc-step.cir").is_file():
            fail("netlist RC ausente")
    print(f"OK: catálogo vazio; {len(projects)} projeto(s) Arduino validados")

if __name__ == "__main__":
    main()
