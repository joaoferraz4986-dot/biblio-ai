#!/usr/bin/env python3
"""Audita uma árvore content/ de livros sem alterar seus arquivos."""
import json, sys, re, hashlib
from pathlib import Path

def main():
    if len(sys.argv) != 2: raise SystemExit('uso: audit-book-set.py <content/>')
    content=Path(sys.argv[1]); catalog=json.loads((content/'catalog.json').read_text())
    out=['# Auditoria do conjunto de livros','',f'Pacotes: {len(catalog.get("packages",[]))}','']
    for entry in catalog.get('packages',[]):
        mp=content/entry['manifest']; m=json.loads(mp.read_text()); pkg=mp.parent
        ids={}; duplicate_ids=[]; duplicate_paragraphs={}; exercise_count=0; formats={}; media=[]
        numbers=[]
        for rel in m.get('sections',[]):
            p=pkg/rel; s=json.loads(p.read_text()); numbers.append(s.get('number'))
            def walk(x, where):
                nonlocal exercise_count
                if isinstance(x,dict):
                    if x.get('id'):
                        if x['id'] in ids: duplicate_ids.append((x['id'],ids[x['id']],where))
                        ids[x['id']]=where
                    if x.get('type')=='exercise':
                        exercise_count+=1; f=x.get('format','discursiva'); formats[f]=formats.get(f,0)+1
                        if not x.get('solutionBlocks'): duplicate_paragraphs.setdefault('EXERCÍCIO SEM SOLUÇÃO',[]).append(where)
                    if x.get('type')=='paragraph' and len(x.get('text',''))>=160:
                        key=hashlib.sha1(re.sub(r'\W+',' ',x['text'].lower()).encode()).hexdigest(); duplicate_paragraphs.setdefault(key,[]).append(where)
                    if x.get('type')=='video': media.append((where,x.get('src','')))
                    for k,v in x.items(): walk(v,where+'.'+k)
                elif isinstance(x,list):
                    for i,v in enumerate(x): walk(v,f'{where}[{i}]')
            walk(s.get('blocks',[]),rel)
        exact_dupes=[locs for key,locs in duplicate_paragraphs.items() if key!='EXERCÍCIO SEM SOLUÇÃO' and len(locs)>1]
        # numbers are compared numerically; references are expected to be last.
        numeric=[float(str(n).replace(',','.')) for n in numbers if n is not None and re.fullmatch(r'\d+(?:[.,]\d+)?',str(n))]
        ordered=(numeric==sorted(numeric))
        out += [f'## {entry["id"]}',f'- seções: {len(m.get("sections",[]))}',f'- ordem numérica: {"OK" if ordered else "REVISAR"}',f'- IDs duplicados: {len(duplicate_ids)}',f'- parágrafos longos idênticos: {len(exact_dupes)}',f'- exercícios: {exercise_count} ({", ".join(f"{k}={v}" for k,v in sorted(formats.items()))})',f'- vídeos locais/externos encontrados: {len(media)}']
        for x in duplicate_ids[:5]: out.append(f'  - ID duplicado: {x[0]} ({x[1]} / {x[2]})')
        for locs in exact_dupes[:5]: out.append('  - Texto repetido: ' + ' / '.join(locs))
        out.append('')
    print('\n'.join(out))
if __name__=='__main__': main()
