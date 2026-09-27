#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'reports' / 'diagrams'
OUT.mkdir(parents=True, exist_ok=True)
errors = []
rendered = 0
svgs = 0
catalog = json.loads((ROOT / 'content/catalog.json').read_text(encoding='utf-8'))

def walk(value, path):
    if isinstance(value, list):
        for i, item in enumerate(value):
            yield from walk(item, path + f'[{i}]')
    elif isinstance(value, dict):
        if value.get('type') == 'mermaid':
            yield ('mermaid', value.get('code', ''), path)
        if value.get('type') == 'ai-diagram' and value.get('engine') == 'mermaid':
            yield ('mermaid', value.get('source', ''), path)
        if value.get('type') == 'svg':
            yield ('svg', value.get('svg', ''), path)
        if value.get('type') == 'ai-diagram' and value.get('engine') == 'svg':
            yield ('svg', value.get('source', ''), path)
        for key, child in value.items():
            yield from walk(child, path + '.' + key)

for entry in catalog.get('packages', []):
    book = entry['id']
    pkg_dir = ROOT / 'content' / 'packages' / book
    manifest = json.loads((ROOT / 'content' / entry['manifest']).read_text(encoding='utf-8'))
    for section_ref in manifest.get('sections', []):
        section_path = ROOT / 'content' / entry['manifest']
        section = json.loads((pkg_dir / section_ref).read_text(encoding='utf-8'))
        for kind, source, location in walk(section, f'{book}.{section["id"]}'):
            stem = f'{book}-{section["id"]}-{location.replace(".", "-").replace("[", "-").replace("]", "")}'
            if kind == 'svg':
                svgs += 1
                try:
                    ET.fromstring(source)
                except Exception as exc:
                    errors.append({'kind': 'svg', 'location': location, 'message': str(exc)})
                continue
            mmd = OUT / (stem + '.mmd')
            png = OUT / (stem + '.png')
            source = str(source).replace('\\r\\n', '\n').replace('\\n', '\n')
            mmd.write_text(source, encoding='utf-8')
            result = subprocess.run(['manus-render-diagram', str(mmd), str(png)], cwd=ROOT, capture_output=True, text=True)
            if result.returncode:
                errors.append({'kind': 'mermaid', 'location': location, 'message': (result.stderr or result.stdout).strip()[:800]})
            else:
                rendered += 1

result = {'rendered_mermaid': rendered, 'validated_svg': svgs, 'errors': errors}
print(json.dumps(result, ensure_ascii=False, indent=2))
(ROOT / 'reports' / 'diagram-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
raise SystemExit(1 if errors else 0)
