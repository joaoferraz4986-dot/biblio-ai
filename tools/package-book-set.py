#!/usr/bin/env python3
"""Empacota content/ no formato canônico de importação do Biblio Ai.

Uso: python3 tools/package-book-set.py /caminho/para/content saida.zip
O script não altera a fonte. Valida referências locais, informa mídias grandes
como avisos e preserva qualquer formato de vídeo suportado pelo navegador.
"""
from __future__ import annotations
import json, sys, zipfile
from pathlib import Path

ADVISORY_MEDIA = 64 * 1024 * 1024
ADVISORY_TOTAL = 512 * 1024 * 1024
VIDEO_EXTS = {'.mp4', '.m4v', '.webm', '.ogv', '.ogg', '.mov'}

def fail(msg):
    print(f"ERRO: {msg}", file=sys.stderr)
    raise SystemExit(2)

def main():
    if len(sys.argv) not in (2, 3):
        fail('uso: package-book-set.py <content/> [saida.zip]')
    content = Path(sys.argv[1]).resolve()
    if not content.is_dir(): fail(f'content não encontrado: {content}')
    out = Path(sys.argv[2]).resolve() if len(sys.argv) == 3 else Path.cwd() / 'livros-conjunto.zip'
    catalog_path = content / 'catalog.json'
    if not catalog_path.is_file(): fail('content/catalog.json não encontrado')
    try: catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    except Exception as e: fail(f'catalog.json inválido: {e}')
    packages = catalog.get('packages') or []
    if not packages: fail('catalog.json não contém livros')
    files = [p for p in content.rglob('*') if p.is_file() and p.resolve() != out]
    names = []
    for p in files:
        rel = p.relative_to(content.parent).as_posix()  # content/...
        if rel.startswith('../') or '\\' in rel: fail(f'caminho inseguro: {rel}')
        names.append(rel)
    required = {'content/catalog.json'}
    missing = sorted(required - set(names))
    if missing: fail('arquivos obrigatórios ausentes: ' + ', '.join(missing))
    warnings = []
    total = 0
    for p in files:
        size = p.stat().st_size; total += size
        if p.suffix.lower() in VIDEO_EXTS and size > ADVISORY_MEDIA:
            warnings.append(f'{p.relative_to(content.parent)}: vídeo {size/1024/1024:.1f} MiB (aviso acima de 64 MiB)')
    if total > ADVISORY_TOTAL:
        warnings.append(f'conjunto total: {total/1024/1024:.1f} MiB (aviso acima de 512 MiB)')
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for p, name in sorted(zip(files, names), key=lambda x: x[1]):
            z.write(p, name)
    print(f'OK: {len(files)} arquivos, {total/1024/1024:.1f} MiB descompactados')
    print(f'ZIP: {out}')
    if warnings:
        print('AVISOS DE MÍDIA:')
        for w in warnings: print('  - ' + w)
    else: print('AVISOS DE MÍDIA: nenhum')

if __name__ == '__main__': main()
