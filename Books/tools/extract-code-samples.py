#!/usr/bin/env python3
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
for rel, out, language in [
    ('content/packages/reinos-microscopicos/sections/neuronios-e-biocomputacao.json', 'reports/evolution.cpp', 'cpp'),
]:
    doc = json.loads((root / rel).read_text(encoding='utf-8'))
    found = []
    def walk(value):
        if isinstance(value, dict):
            if value.get('type') == 'code' and value.get('language') == language:
                found.append(value['code'])
            for child in value.values(): walk(child)
        elif isinstance(value, list):
            for child in value: walk(child)
    walk(doc)
    if not found: raise SystemExit(f'no {language} sample found')
    (root / out).write_text(found[-1] + '\n', encoding='utf-8')
    print(f'extracted {out}')
