#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
out = []
for file in sorted((ROOT / 'content' / 'packages').glob('*/sections/*.json')):
    doc = json.loads(file.read_text(encoding='utf-8'))
    def walk(value, path):
        if isinstance(value, list):
            for i, item in enumerate(value): walk(item, path + f'[{i}]')
        elif isinstance(value, dict):
            if value.get('type') == 'math':
                out.append(f"## {file.relative_to(ROOT)} · {path}\n\n- TeX: `{value.get('tex','')}`\n- Leitura: {value.get('reading','')}\n- Legenda: {value.get('caption','')}\n")
            for k, v in value.items(): walk(v, path + '.' + k)
    walk(doc, doc.get('id', file.stem))
(ROOT / 'reports' / 'math-inventory.md').write_text('\n'.join(out), encoding='utf-8')
print(f'{len(out)} fórmulas listadas')
