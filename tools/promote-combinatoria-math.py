#!/usr/bin/env python3
import json
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
FORMULA = re.compile(r'\$([^$]+)\$')
changed = 0

def transform_blocks(blocks):
    global changed
    out = []
    for block in blocks or []:
        if not isinstance(block, dict):
            out.append(block); continue
        copy = block
        if copy.get('type') == 'paragraph' and copy.get('text', '').count('$') == 2:
            match = FORMULA.search(copy['text'])
            if match:
                formula = match.group(1).strip()
                prose = copy['text']
                reading = FORMULA.sub('a relação matemática exibida neste bloco', prose, count=1)
                copy = dict(copy)
                copy['text'] = FORMULA.sub('a relação matemática a seguir', prose, count=1)
                out.append(copy)
                out.append({
                    'type': 'math',
                    'tex': formula,
                    'display': True,
                    'caption': 'Relação formal usada no argumento.',
                    'reading': 'Lê-se no contexto da subseção: ' + reading.replace('**', '')
                })
                changed += 1
                continue
        if copy.get('type') == 'subsection':
            copy = dict(copy)
            copy['blocks'] = transform_blocks(copy.get('blocks', []))
        elif copy.get('type') == 'details':
            copy = dict(copy)
            copy['blocks'] = transform_blocks(copy.get('blocks', []))
        elif copy.get('type') == 'columns':
            copy = dict(copy)
            copy['columns'] = [dict(col, blocks=transform_blocks(col.get('blocks', []))) for col in copy.get('columns', [])]
        out.append(copy)
    return out

for path in sorted((ROOT / 'content/packages/combinatoria-computacao/sections').glob('*.json')):
    doc = json.loads(path.read_text(encoding='utf-8'))
    before = changed
    doc['blocks'] = transform_blocks(doc.get('blocks', []))
    if changed != before:
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Fórmulas standalone promovidas a blocos math: {changed}')
