#!/usr/bin/env python3
import json
import re
from collections import Counter
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
PACKAGES = ROOT / 'content/packages'
KNOWN = {'title','heading','paragraph','list','quote','callout','steps','exercise','code','mermaid','ai-diagram','svg','image','history','math','iframe','video','table','divider','subsection','details','collapsible','columns','html'}
FORMULA_HINT = re.compile(r'(?:\\(?:frac|sqrt|sum|prod|int|binom|langle|rangle|left|right)|\$[^$]+\$|[A-Za-z]\s*[=≤≥]\s*[^.!?]{2,})')
all_types = Counter(); nonstandard = []; formula_outside = []; exercise_issues = []; media_issues = []; stats = Counter()

def strings(value):
    if isinstance(value, str): yield value
    elif isinstance(value, dict):
        for v in value.values(): yield from strings(v)
    elif isinstance(value, list):
        for v in value: yield from strings(v)

def walk(blocks, path, in_math=False):
    for i, block in enumerate(blocks or []):
        if not isinstance(block, dict): continue
        typ = block.get('type'); p = f'{path}.blocks[{i}]'
        all_types[typ] += 1; stats['blocks'] += 1
        if typ not in KNOWN: nonstandard.append((p, typ))
        if typ == 'math':
            stats['math'] += 1
            if not isinstance(block.get('tex'), str) or not block.get('tex').strip(): formula_outside.append((p, 'math sem tex'))
            if not isinstance(block.get('reading'), str) or len(block.get('reading','').strip()) < 20: formula_outside.append((p, 'math sem leitura explicativa'))
        elif typ == 'exercise':
            stats['exercises'] += 1
            required = [('id', str), ('prompt', str), ('hint', str), ('solutionBlocks', list)]
            for key, kind in required:
                if not isinstance(block.get(key), kind) or (isinstance(block.get(key), str) and not block[key].strip()) or (key == 'solutionBlocks' and not block[key]):
                    exercise_issues.append((p, key))
        elif typ in {'image','video'}:
            src = block.get('src','')
            if not isinstance(src, str) or not src: media_issues.append((p, 'src ausente'))
            if typ == 'video' and isinstance(src, str) and not (src.startswith(('data:video/','https://')) or re.search(r'(^|/)(media|videos)/[^/]+\.mp4$', src, re.I)):
                media_issues.append((p, 'vídeo não MP4/local/HTTPS'))
        if typ != 'math':
            for key, value in block.items():
                if key in {'type','id','title','caption','alt','reading'}: continue
                if isinstance(value, str) and FORMULA_HINT.search(value):
                    formula_outside.append((p + '.' + key, value[:100].replace('\n',' ')))
        if typ == 'subsection': walk(block.get('blocks'), p, False)
        if typ == 'columns':
            for c, col in enumerate(block.get('columns', [])): walk(col.get('blocks'), p + f'.columns[{c}]', False)
        if typ == 'collapsible': walk(block.get('blocks'), p + '.blocks', False)

for pkg in sorted(PACKAGES.iterdir()):
    if not pkg.is_dir(): continue
    for file in sorted((pkg / 'sections').glob('*.json')):
        doc = json.loads(file.read_text(encoding='utf-8'))
        walk(doc.get('blocks', []), str(file.relative_to(ROOT)))
        stats['sections'] += 1

out = ROOT / 'reports/content-audit.md'
lines = ['# Auditoria estrutural dos livros', '', 'A auditoria percorre todos os pacotes e compara blocos com o registro oficial, verificando exercícios, fórmulas em campos apropriados e referências de mídia. A renderização KaTeX/Mermaid/SVG foi validada separadamente em `reports/render-audit.json`.', '', '## Resultado', '', f"Foram percorridas **{stats['sections']} seções**, **{stats['blocks']} blocos**, **{stats['math']} fórmulas** e **{stats['exercises']} exercícios**. Tipos não registrados: **{len(nonstandard)}**. Exercícios incompletos: **{len(exercise_issues)}**. Problemas de mídia: **{len(media_issues)}**.", '', '## Distribuição de tipos', '', '| Tipo | Quantidade |', '| --- | ---: |']
for typ, count in sorted(all_types.items()): lines.append(f'| `{typ}` | {count} |')
lines += ['', '## Achados', '']
if nonstandard: lines += ['### Blocos não padronizados', ''] + [f'- `{p}`: `{t}`' for p,t in nonstandard]
else: lines += ['Não foram encontrados tipos de bloco fora do registro oficial.', '']
if exercise_issues: lines += ['### Exercícios incompletos', ''] + [f'- `{p}`: campo `{k}`' for p,k in exercise_issues]
else: lines += ['Todos os exercícios possuem identificador, enunciado, dica e solução em blocos.', '']
if media_issues: lines += ['### Mídia com referência suspeita', ''] + [f'- `{p}`: {issue}' for p,issue in media_issues]
else: lines += ['As referências de imagem e vídeo passaram as regras estruturais; a existência e renderização dos assets foi verificada no auditor de renderização.', '']
lines += ['### Fórmulas fora de bloco', '', 'O detector lexical abaixo é deliberadamente conservador: ele registra apenas ocorrências de LaTeX explícito ou expressões com sinal de igualdade em campos que não são `math`. Revisão manual é necessária para distinguir texto matemático legítimo de uma fórmula que deveria ser promovida a bloco.']
if formula_outside: lines += [f'- `{p}`: `{v}`' for p,v in formula_outside]
else: lines += ['Nenhuma ocorrência suspeita foi encontrada fora de blocos `math`.']
out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'written {out}')
