# Distribuição desktop

O projeto agora usa `electron-builder` para gerar uma imagem executável Linux e um instalador Windows. A distribuição começa sem Biblio Ai: o usuário importa ou adiciona os próprios pacotes em `content/packages/`.

## Teste local no Linux

```bash
npm ci
npm run validate:all
npm run dist:linux
```

O resultado é `dist/Biblio Ai-1.1.0-linux-x86_64.AppImage`. O arquivo inclui o leitor, o editor, o bundle vazio e as ferramentas de projeto Arduino. Os dados editáveis continuam sendo mantidos na pasta de usuário durante a execução.

## Windows

O instalador NSIS é produzido no GitHub Actions em um runner Windows. O build local deve ser executado em Windows com:

```powershell
npm ci
npm run dist:windows
```

O resultado é um instalador `Biblio Ai-1.1.0-win-x64.exe`, com atalho no menu Iniciar, atalho opcional na área de trabalho e escolha do diretório de instalação.

## Releases

Uma tag semântica inicia automaticamente os builds para Linux e Windows:

```bash
git tag v1.1.0
git push origin v1.1.0
```

O workflow `.github/workflows/release.yml` valida o catálogo, reconstrói o bundle, gera os dois artefatos e publica uma GitHub Release com notas automáticas. O workflow manual também pode ser acionado para produzir artefatos de teste, sem publicar uma release.

A assinatura de código ainda não está configurada. Para distribuição pública do Windows, recomenda-se adicionar um certificado de assinatura e os segredos correspondentes ao GitHub Actions antes de anunciar o instalador.
