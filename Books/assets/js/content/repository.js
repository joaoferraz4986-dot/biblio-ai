/*
 * Repositório de conteúdo: carrega catálogo/pacotes (fetch via HTTP, ou o bundle embutido em file://)
 * e persiste na pasta do projeto pela File System Access API, incluindo assets locais e configurações.
 */
(function () {
  'use strict';
  var S = Books.schema;
  var CONTENT = 'content/';
  var cache = {};
  var assetVersion = Date.now();
  var OFFLINE_DB = 'books-project-offline-v1';
  var OFFLINE_STORE_KEY = 'books.project.snapshots.v1';
  var offlineDbPromise = null;

  function offlineDb() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    if (!offlineDbPromise) offlineDbPromise = new Promise(function (resolve) {
      var req = indexedDB.open(OFFLINE_DB, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('snapshots', { keyPath: 'key' }); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
    });
    return offlineDbPromise;
  }
  function offlineRead(key) {
    return offlineDb().then(function (db) {
      if (!db) { var fallback = Books.store.read(OFFLINE_STORE_KEY, {}); return fallback[key] || null; }
      return new Promise(function (resolve) { var req = db.transaction('snapshots').objectStore('snapshots').get(key); req.onsuccess = function () { resolve(req.result && req.result.value); }; req.onerror = function () { resolve(null); }; });
    });
  }
  function offlineWrite(key, value) {
    return offlineDb().then(function (db) {
      if (!db) { var fallback = Books.store.read(OFFLINE_STORE_KEY, {}); fallback[key] = value; return Books.store.write(OFFLINE_STORE_KEY, fallback); }
      return new Promise(function (resolve) { var tx = db.transaction('snapshots', 'readwrite'); tx.objectStore('snapshots').put({ key: key, value: value, savedAt: Date.now() }); tx.oncomplete = function () { resolve(true); }; tx.onerror = function () { resolve(false); }; });
    });
  }

  function isFile() { return location.protocol === 'file:'; }
  function nativeRoot() { return Books.native && Books.native.isAvailable() ? Books.native.projectRoot() : ''; }
  function embedded() { return globalThis.__BOOKS_BUNDLE__ || null; }
  function contentUrl(path) { return new URL(CONTENT + path, document.baseURI).href; }

  function assetUrl(bookId, src) {
    if (!src) return '';
    if (/^(data:|https?:|blob:|\/)/i.test(src)) return src;
    if (/^packages\//.test(src)) return nativeRoot() ? Books.native.assetUrl('content/' + src) : contentUrl(src) + '?v=' + assetVersion;
    if (nativeRoot()) return Books.native.assetUrl('content/packages/' + bookId + '/' + src);
    return contentUrl('packages/' + bookId + '/' + src) + '?v=' + assetVersion;
  }

  function fetchJson(path) {
    return fetch(contentUrl(path), { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Arquivo não encontrado: ' + CONTENT + path);
      return r.json();
    });
  }

  function normalizeCatalog(raw) {
    var catalog = Books.util.clone(raw || {});
    catalog.schema = S.SCHEMAS.catalog; catalog.kind = 'book-catalog'; catalog.version = 2;
    catalog.packages = (catalog.packages || []).map(function (p) {
      var entry = Books.util.clone(p);
      if (!Array.isArray(entry.tags)) entry.tags = [];
      if (typeof entry.description === 'string' && /<[a-z]/i.test(entry.description)) entry.description = Books.inline.toPlain(entry.description.replace(/<[^>]+>/g, ''));
      return entry;
    });
    return catalog;
  }
  function mergeCatalogs(base, saved) {
    var merged = normalizeCatalog(base);
    var byId = {};
    merged.packages.forEach(function (entry) { byId[entry.id] = entry; });
    normalizeCatalog(saved).packages.forEach(function (entry) {
      byId[entry.id] = Object.assign({}, byId[entry.id] || {}, entry);
    });
    merged.packages = Object.keys(byId).map(function (id) { return byId[id]; });
    return merged;
  }

  function loadCatalog() {
    var bundle = embedded();
    var fromBundle = function () {
      if (!bundle) throw new Error(isFile()
        ? 'Não foi possível carregar o catálogo. Rode `python3 tools/build_bundle.py` ou sirva a pasta por HTTP.'
        : 'content/catalog.json não encontrado.');
      return normalizeCatalog(bundle.catalog);
    };
    var source = nativeRoot()
      ? Books.native.readText('content/catalog.json').then(JSON.parse).then(normalizeCatalog).catch(function () { return fromBundle(); })
      : (isFile() ? Promise.resolve().then(fromBundle) : fetchJson('catalog.json').then(normalizeCatalog).catch(function () { return fromBundle(); }));
    return source.then(function (catalog) { return offlineRead('catalog').then(function (saved) { return saved ? mergeCatalogs(catalog, saved) : catalog; }); });
  }

  function loadProgressFile() {
    var bundle = embedded();
    if (nativeRoot()) return Books.native.readText('content/progress.json').then(JSON.parse).catch(function () { return (bundle && bundle.progress) || {}; });
    if (isFile()) return Promise.resolve((bundle && bundle.progress) || {});
    return fetchJson('progress.json').catch(function () { return (bundle && bundle.progress) || {}; });
  }

  /** Escolhas de personalização (tema/fundo/fonte) salvas na pasta do projeto — ver core/personalization.js. */
  function loadSettingsFile() {
    var bundle = embedded();
    var source = nativeRoot()
      ? Books.native.readText('content/settings.json').then(JSON.parse).then(function (doc) { return (doc && doc.settings) || {}; }).catch(function () { return {}; })
      : (isFile() ? Promise.resolve((bundle && bundle.settings) || {}) : fetchJson('settings.json').then(function (doc) { return (doc && doc.settings) || {}; }).catch(function () { return {}; }));
    return source.then(function (settings) { return offlineRead('settings').then(function (saved) { return saved || settings; }); });
  }

  function loadPackage(meta) {
    if (cache[meta.id]) return Promise.resolve(Books.util.clone(cache[meta.id]));
    var bundle = embedded();
    var fromBundle = function () {
      var b = bundle && bundle.packages && bundle.packages[meta.id];
      if (!b) throw new Error('Pacote "' + meta.id + '" não encontrado.');
      return b;
    };
    var raw = nativeRoot()
      ? Books.native.readText('content/' + meta.manifest).then(JSON.parse).then(function (manifest) {
          var base = meta.manifest.slice(0, meta.manifest.lastIndexOf('/') + 1);
          return Promise.all([Books.native.readText('content/' + base + manifest.header).then(JSON.parse), Promise.all(manifest.sections.map(function (p) { return Books.native.readText('content/' + base + p).then(JSON.parse); })), Books.native.readText('content/' + base + 'image-rights.json').then(JSON.parse).catch(function () { return { files: {} }; })])
            .then(function (r) { return { manifest: manifest, header: r[0], sections: r[1], imageRights: (r[2] && r[2].files) || {} }; });
        }).catch(function (e) { try { return fromBundle(); } catch (x) { throw e; } })
      : isFile()
      ? Promise.resolve().then(fromBundle)
      : fetchJson(meta.manifest).then(function (manifest) {
          var base = meta.manifest.slice(0, meta.manifest.lastIndexOf('/') + 1);
          return Promise.all([fetchJson(base + manifest.header), Promise.all(manifest.sections.map(function (p) { return fetchJson(base + p); })), fetchJson(base + 'image-rights.json').catch(function () { return { files: {} }; })])
            .then(function (r) { return { manifest: manifest, header: r[0], sections: r[1], imageRights: (r[2] && r[2].files) || {} }; });
        }).catch(function (e) { try { return fromBundle(); } catch (x) { throw e; } });
    return raw.then(function (pkg) {
      var normalized = Books.migrate.normalizePackage(pkg);
      return offlineRead('pkg:' + meta.id).then(function (saved) {
        var result = saved || normalized;
        cache[meta.id] = Books.util.clone(result);
        return result;
      });
    });
  }
  function remember(pkg) { cache[pkg.manifest.id] = Books.util.clone(pkg); }
  function bumpAssetVersion() { assetVersion = Date.now(); }
  function saveOffline(o) {
    var pkgCopy = Books.util.clone(o.pkg);
    var catalogCopy = Books.util.clone(o.catalog);
    var entry = catalogEntry(pkgCopy);
    var index = catalogCopy.packages.findIndex(function (item) { return item.id === entry.id; });
    if (index === -1) catalogCopy.packages.push(entry); else catalogCopy.packages[index] = entry;
    var settingsCopy = Books.util.clone(o.settings || {});
    return Promise.all([offlineWrite('pkg:' + pkgCopy.manifest.id, pkgCopy), offlineWrite('catalog', catalogCopy), offlineWrite('settings', settingsCopy)]).then(function () {
      cache[pkgCopy.manifest.id] = Books.util.clone(pkgCopy);
      return { catalog: catalogCopy, pkg: pkgCopy, offline: true };
    });
  }
  function forget(id) { delete cache[id]; }

  /* ───────────── serialização ───────────── */
  function catalogEntry(pkg) {
    var id = pkg.manifest.id;
    var entry = { id: id, title: pkg.manifest.title, description: pkg.manifest.description || '', tags: pkg.manifest.tags || [], manifest: 'packages/' + id + '/manifest.json' };
    var cover = pkg.header && pkg.header.cover;
    if (cover && cover.src) entry.cover = { src: /^(data:|https?:)/i.test(cover.src) ? cover.src : 'packages/' + id + '/' + cover.src, alt: cover.alt || '', ratio: cover.ratio || '16:9' };
    return entry;
  }
  function packageFiles(pkg) {
    var files = {};
    var manifest = Books.util.clone(pkg.manifest);
    manifest.header = 'header.json';
    manifest.sections = pkg.sections.map(function (s) { return 'sections/' + s.id + '.json'; });
    files['manifest.json'] = manifest;
    files['header.json'] = pkg.header;
    pkg.sections.forEach(function (s) { files['sections/' + s.id + '.json'] = s; });
    files['image-rights.json'] = { schema: 'books.image-rights.v1', kind: 'image-rights', files: pkg.imageRights || {} };
    return files;
  }
  function bundlePackage(pkg) { return { manifest: packageFiles(pkg)['manifest.json'], header: pkg.header, sections: pkg.sections, imageRights: pkg.imageRights || {} }; }
  function bundleScript(catalog, progress, packages, settings) {
    var data = { schema: S.SCHEMAS.bundle, catalog: catalog, progress: progress, settings: settings || {}, packages: packages };
    return '/* Gerado automaticamente pelo editor (ao salvar na pasta) ou por tools/build_bundle.py.\n   Não edite à mão. Permite abrir Livros.html com duplo clique (file://), sem servidor. */\nglobalThis.__BOOKS_BUNDLE__ = ' + JSON.stringify(data) + ';\n';
  }

  /* ───────────── persistência em pasta ───────────── */
  function dataUrlToBlob(url) {
    var m = /^data:([^;,]+)((?:;[^;,]+)*?)(;base64)?,(.*)$/s.exec(url);
    if (!m) return null;
    var mime = m[1], body = m[4];
    if (m[3]) {
      var bin = atob(body), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { blob: new Blob([bytes], { type: mime }), mime: mime };
    }
    return { blob: new Blob([decodeURIComponent(body)], { type: mime }), mime: mime };
  }
  function base64ToBlob(encoded, mime) {
    var binary = atob(encoded), bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime || 'application/octet-stream' });
  }
  function mimeFromPath(path) {
    var ext = String(path || '').split('.').pop().toLowerCase();
    return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2', ttc: 'font/ttf' })[ext] || 'application/octet-stream';
  }
  var EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/avif': 'avif' };
  var IMAGES_DIR = 'images'; // pasta separada para imagens de bloco; a capa fica solta na raiz do livro (cover.*)
  function isSvgMime(mime) { return mime === 'image/svg+xml'; }
  function isSvgPath(path) { return /\.svg($|\?)/i.test(path || ''); }
  function isExternal(url) { return /^https?:\/\//i.test(url || ''); }
  function extFromContentType(ct) { return EXT[(ct || '').split(';')[0].trim()] || null; }
  function extFromUrl(url) { var m = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url || ''); return m ? m[1].toLowerCase() : null; }

  /**
   * Normaliza as imagens de um pacote (capa + blocos `image`) para arquivos locais na pasta do
   * livro, ANTES de gravar: Data URLs viram arquivo (exceto SVG, que fica embutido — é vetorial e
   * o bloco dedicado `svg` já cobre esse caso) e URLs http(s) são baixadas e localizadas (o leitor
   * nunca depende de um arquivo fora do projeto). Devolve [{path, blob}] e altera `pkg` in-place.
   */
  async function localizeAssets(pkg) {
    var assets = [], n = 0;
    async function take(url, base) {
      var parsed = dataUrlToBlob(url);
      if (parsed) {
        if (isSvgMime(parsed.mime)) return url; // SVG: mantém embutido, não vira arquivo
        var ext = EXT[parsed.mime] || 'bin';
        var path = base === 'cover' ? 'cover.' + ext : IMAGES_DIR + '/' + base + '-' + (++n) + '.' + ext;
        assets.push({ path: path, blob: parsed.blob });
        return path;
      }
      if (isExternal(url)) {
        if (isSvgPath(url)) return url; // SVG externo: também não é baixado como arquivo
        try {
          var res = await fetch(url);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          var blob = await res.blob();
          if (isSvgMime(blob.type)) return url;
          var ext2 = extFromContentType(blob.type) || extFromUrl(url) || 'bin';
          var path2 = base === 'cover' ? 'cover.' + ext2 : IMAGES_DIR + '/' + base + '-' + (++n) + '.' + ext2;
          assets.push({ path: path2, blob: blob });
          return path2;
        } catch (e) {
          console.warn('[repo] não foi possível baixar imagem externa, mantendo URL:', url, e);
          return url; // sem rede/CORS: fica como está em vez de quebrar o salvamento
        }
      }
      return url;
    }
    if (pkg.header.cover && pkg.header.cover.src) pkg.header.cover.src = await take(pkg.header.cover.src, 'cover');
    for (var i = 0; i < pkg.sections.length; i++) {
      var blocks = [];
      Books.blocks.walk(pkg.sections[i].blocks, function (b) { if (b.type === 'image' && b.src) blocks.push(b); });
      for (var j = 0; j < blocks.length; j++) blocks[j].src = await take(blocks[j].src, 'img');
    }
    return assets;
  }
  // mantido por compatibilidade (uso síncrono, só Data URLs — sem download de URLs externas)
  function extractAssets(pkg) {
    var assets = [], n = 0;
    function take(url, base) {
      var parsed = dataUrlToBlob(url);
      if (!parsed || isSvgMime(parsed.mime)) return url;
      var ext = EXT[parsed.mime] || 'bin';
      var path = base === 'cover' ? 'cover.' + ext : IMAGES_DIR + '/' + base + '-' + (++n) + '.' + ext;
      assets.push({ path: path, blob: parsed.blob });
      return path;
    }
    if (pkg.header.cover && /^data:/i.test(pkg.header.cover.src || '')) pkg.header.cover.src = take(pkg.header.cover.src, 'cover');
    pkg.sections.forEach(function (s) {
      Books.blocks.walk(s.blocks, function (b) { if (b.type === 'image' && /^data:/i.test(b.src || '')) b.src = take(b.src, 'img'); });
    });
    return assets;
  }

  /** Referências de imagem local (cover.* / images/*) que o pacote, já normalizado, ainda usa. */
  function referencedLocalImages(pkg) {
    var set = {};
    function mark(src) { if (/^(cover\.[a-z0-9]+|images\/)/i.test(src || '')) set[src] = true; }
    if (pkg.header.cover) mark(pkg.header.cover.src);
    pkg.sections.forEach(function (s) { Books.blocks.walk(s.blocks, function (b) { if (b.type === 'image') mark(b.src); }); });
    return set;
  }
  /** Apaga da pasta do livro qualquer cover.* / images/* que não esteja mais referenciado —
   * cobre remover um bloco de imagem, trocar a capa (extensão diferente) e remover a imagem de um bloco. */
  async function pruneOrphanImages(pkgDir, referenced) {
    for await (var entry of pkgDir.values()) {
      if (entry.kind === 'file' && /^cover\./i.test(entry.name) && !referenced[entry.name]) {
        try { await pkgDir.removeEntry(entry.name); } catch (e) { /* ignora */ }
      }
    }
    var imagesDir = null;
    try { imagesDir = await pkgDir.getDirectoryHandle(IMAGES_DIR); } catch (e) { return; }
    for await (var img of imagesDir.values()) {
      if (img.kind === 'file' && !referenced[IMAGES_DIR + '/' + img.name]) {
        try { await imagesDir.removeEntry(img.name); } catch (e) { /* ignora */ }
      }
    }
  }

  async function writeFile(dir, name, data) {
    var fh = await dir.getFileHandle(name, { create: true });
    var w = await fh.createWritable();
    await w.write(data);
    await w.close();
  }
  async function subdir(dir, path) {
    var cur = dir;
    var parts = path.split('/').filter(Boolean);
    for (var i = 0; i < parts.length; i++) cur = await cur.getDirectoryHandle(parts[i], { create: true });
    return cur;
  }

  function dataUrlMime(url) {
    var parsed = dataUrlToBlob(url);
    return parsed ? parsed.mime : '';
  }
  function pathFromMime(mime) { return EXT[mime] || ({ 'font/ttf': 'ttf', 'font/otf': 'otf', 'font/woff': 'woff', 'font/woff2': 'woff2', 'application/x-font-ttf': 'ttf', 'application/x-font-opentype': 'otf' }[mime] || 'bin'); }

  /** Lê assets locais já existentes no diretório escolhido, para que exportar/salvar nunca perca uma capa. */
  async function collectLocalAssets(pkg, root) {
    var assets = [], refs = referencedLocalImages(pkg), base = 'content/packages/' + pkg.manifest.id + '/';
    for (var path in refs) {
      try {
        var file;
        if (root) {
          var dir = await subdir(root, base + path.split('/').slice(0, -1).join('/'));
          var name = path.split('/').pop();
          file = await (await dir.getFileHandle(name)).getFile();
        } else if (nativeRoot()) {
          try {
            file = base64ToBlob(await Books.native.readBinary(base + path), mimeFromPath(path));
          } catch (nativeError) {
            file = await (await fetch(contentUrl('packages/' + pkg.manifest.id + '/' + path))).blob();
          }
        } else {
          var url = assetUrl(pkg.manifest.id, path);
          var response = await fetch(url);
          if (!response.ok) throw new Error('HTTP ' + response.status);
          file = await response.blob();
        }
        assets.push({ path: path, blob: file });
      } catch (e) {
        console.warn('[repo] asset local não encontrado, mantendo somente a referência:', path, e);
      }
    }
    return assets;
  }

  /** Converte customizações de fundo/fonte em arquivos dentro de content/ antes de gravar settings.json. */
  async function localizeSettingsAssets(settings, root) {
    var out = Books.util.clone(settings || {}), assets = [], seen = {};
    function add(path, blob) {
      if (!seen[path]) { seen[path] = true; assets.push({ path: path, blob: blob }); }
    }
    async function localize(list, folder, fallbackExt) {
      (list || []).forEach(function (item) {
        if (!item || !item.src) return;
        var parsed = dataUrlToBlob(item.src);
        if (parsed && !isSvgMime(parsed.mime)) {
          var path = folder + '/' + item.id + '.' + pathFromMime(parsed.mime || fallbackExt);
          item.src = path;
          add(path, parsed.blob);
        }
      });
      var existing = await Promise.all((list || []).filter(function (item) { return item && item.src && !/^data:/i.test(item.src); }).map(async function (item) {
        if (/^(https?:|blob:)/i.test(item.src)) return null;
        try {
          var p = item.src.replace(/^content\//, '');
          var dirPath = p.split('/').slice(0, -1).join('/');
          var name = p.split('/').pop();
          var dir = root ? await subdir(root, 'content/' + dirPath) : null;
          var file = root ? await (await dir.getFileHandle(name)).getFile() : nativeRoot()
            ? base64ToBlob(await Books.native.readBinary('content/' + p), mimeFromPath(p))
            : await (await fetch(contentUrl(p))).blob();
          return { path: p, blob: file };
        } catch (e) { return null; }
      }));
      existing.forEach(function (a) { if (a) add(a.path, a.blob); });
    }
    await localize(out.customBackgrounds, 'backgrounds', 'png');
    await localize(out.customFonts, 'fonts', 'ttf');
    return { settings: out, assets: assets };
  }

  async function pruneSettingsAssets(contentDir, settings) {
    var used = {};
    ['customBackgrounds', 'customFonts'].forEach(function (key) {
      (settings && settings[key] || []).forEach(function (item) {
        if (item && item.src && !/^data:/i.test(item.src)) used[item.src.replace(/^content\//, '')] = true;
      });
    });
    for (var i = 0; i < 2; i++) {
      var folder = i === 0 ? 'backgrounds' : 'fonts', dir;
      try { dir = await contentDir.getDirectoryHandle(folder); } catch (e) { continue; }
      for await (var entry of dir.values()) {
        if (entry.kind === 'file' && !used[folder + '/' + entry.name]) {
          try { await dir.removeEntry(entry.name); } catch (e) { /* arquivo pode estar em uso */ }
        }
      }
    }
  }

  /**
   * Grava o pacote, o catálogo, o progresso e o bundle na pasta escolhida.
   * options: { root, pkg, catalog, progress, resolvePackage(id) }
   */
  async function saveToFolder(o) {
    var content = await o.root.getDirectoryHandle('content', { create: true });
    var pkgDir = await subdir(content, 'packages/' + o.pkg.manifest.id);
    var assets = await localizeAssets(o.pkg);
    var localAssets = await collectLocalAssets(o.pkg, o.root);
    localAssets = localAssets.filter(function (asset) { return !assets.some(function (current) { return current.path === asset.path; }); });
    var settingsResult = await localizeSettingsAssets(o.settings, o.root);
    await pruneSettingsAssets(content, settingsResult.settings);
    assets = assets.concat(localAssets);
    // apaga primeiro os arquivos órfãos (bloco removido, capa trocada/removida, imagem removida de um
    // bloco) para nunca deixar lixo acumulando na pasta do livro entre salvamentos.
    await pruneOrphanImages(pkgDir, referencedLocalImages(o.pkg));
    for (var a = 0; a < assets.length; a++) {
      var parts = assets[a].path.split('/'), name = parts.pop();
      await writeFile(parts.length ? await subdir(pkgDir, parts.join('/')) : pkgDir, name, assets[a].blob);
    }
    var files = packageFiles(o.pkg);
    var sectionsDir = await subdir(pkgDir, 'sections');
    var keep = {};
    for (var path in files) {
      var json = JSON.stringify(files[path], null, 2) + '\n';
      var segs = path.split('/'), fname = segs.pop();
      await writeFile(segs.length ? sectionsDir : pkgDir, fname, json);
      if (segs.length) keep[fname] = true;
    }
    // remove arquivos de seção que não fazem mais parte do livro
    for await (var entry of sectionsDir.values()) {
      if (entry.kind === 'file' && /\.json$/.test(entry.name) && !keep[entry.name]) await sectionsDir.removeEntry(entry.name);
    }
    var catalog = Books.util.clone(o.catalog);
    var entryData = catalogEntry(o.pkg);
    var idx = catalog.packages.findIndex(function (p) { return p.id === entryData.id; });
    if (idx === -1) catalog.packages.push(entryData); else catalog.packages[idx] = entryData;
    await writeFile(content, 'catalog.json', JSON.stringify(catalog, null, 2) + '\n');
    var progressDoc = { schema: S.SCHEMAS.progress, kind: 'book-progress', version: 2, progress: o.progress || {} };
    await writeFile(content, 'progress.json', JSON.stringify(progressDoc, null, 2) + '\n');
    for (var sa = 0; sa < settingsResult.assets.length; sa++) {
      var settingAsset = settingsResult.assets[sa];
      var settingParts = settingAsset.path.split('/'), settingName = settingParts.pop();
      await writeFile(settingParts.length ? await subdir(content, settingParts.join('/')) : content, settingName, settingAsset.blob);
    }
    if (o.settings) {
      var settingsDoc = { schema: 'books.settings.v1', kind: 'book-settings', version: 1, settings: o.settings };
      settingsDoc.settings = settingsResult.settings;
      await writeFile(content, 'settings.json', JSON.stringify(settingsDoc, null, 2) + '\n');
    }

    var packages = {};
    for (var i = 0; i < catalog.packages.length; i++) {
      var id = catalog.packages[i].id;
      var p = id === o.pkg.manifest.id ? o.pkg : await o.resolvePackage(id);
      if (p) packages[id] = bundlePackage(p);
    }
    // Regrava o MESMO arquivo que Livros.html carrega por <script> (assets/js/embedded-bundle.js,
    // gerado também por tools/build_bundle.py) — nunca content/library.bundle.js, que nenhuma tag
    // <script> referencia. Sem isto, quem abre o projeto por duplo clique (file://) continua vendo
    // a versão antiga do livro depois de salvar, porque o bundle embutido é a única fonte que o
    // navegador consegue ler nesse modo (fetch() de content/*.json é bloqueado em file://).
    var assetsJsDir = await subdir(o.root, 'assets/js');
    await writeFile(assetsJsDir, 'embedded-bundle.js', bundleScript(catalog, progressDoc, packages, settingsResult.settings));
    remember(o.pkg);
    return { catalog: catalog, pkg: o.pkg, assets: assets.length };
  }

  async function saveNative(o) {
    var assets = await localizeAssets(o.pkg);
    var localAssets = await collectLocalAssets(o.pkg, null);
    localAssets = localAssets.filter(function (asset) { return !assets.some(function (current) { return current.path === asset.path; }); });
    var settingsResult = await localizeSettingsAssets(o.settings, null);
    assets = assets.concat(localAssets);
    var catalog = Books.util.clone(o.catalog);
    var entryData = catalogEntry(o.pkg);
    var index = catalog.packages.findIndex(function (item) { return item.id === entryData.id; });
    if (index === -1) catalog.packages.push(entryData); else catalog.packages[index] = entryData;
    var records = [{ pkg: o.pkg, assets: assets }];
    for (var r = 0; r < catalog.packages.length; r++) {
      var packageId = catalog.packages[r].id;
      if (packageId === o.pkg.manifest.id) continue;
      var packageValue = await o.resolvePackage(packageId);
      if (!packageValue) continue;
      var packageAssets = await localizeAssets(packageValue);
      var packageLocalAssets = await collectLocalAssets(packageValue, null);
      packageLocalAssets = packageLocalAssets.filter(function (asset) { return !packageAssets.some(function (current) { return current.path === asset.path; }); });
      records.push({ pkg: packageValue, assets: packageAssets.concat(packageLocalAssets) });
    }
    var files = [], keep = {}, packageRoots = [];
    function addText(path, value) {
      var bytes = new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
      files.push({ path: path, data: Array.prototype.slice.call(bytes) }); keep[path] = true;
    }
    function addBinary(path, blob) {
      return blob.arrayBuffer().then(function (buffer) { files.push({ path: path, data: Array.prototype.slice.call(new Uint8Array(buffer)) }); keep[path] = true; });
    }
    for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
      var record = records[recordIndex], packageRoot = 'content/packages/' + record.pkg.manifest.id + '/';
      packageRoots.push(packageRoot);
      var packageJson = packageFiles(record.pkg);
      Object.keys(packageJson).forEach(function (path) { addText(packageRoot + path, packageJson[path]); });
      for (var a = 0; a < record.assets.length; a++) await addBinary(packageRoot + record.assets[a].path, record.assets[a].blob);
    }
    for (var sa = 0; sa < settingsResult.assets.length; sa++) await addBinary('content/' + settingsResult.assets[sa].path, settingsResult.assets[sa].blob);
    addText('content/catalog.json', catalog);
    addText('content/progress.json', { schema: S.SCHEMAS.progress, kind: 'book-progress', version: 2, progress: o.progress || {} });
    if (settingsResult.settings) addText('content/settings.json', { schema: 'books.settings.v1', kind: 'book-settings', version: 1, settings: settingsResult.settings });
    var packages = {};
    for (var i = 0; i < records.length; i++) packages[records[i].pkg.manifest.id] = bundlePackage(records[i].pkg);
    addText('assets/js/embedded-bundle.js', bundleScript(catalog, { schema: S.SCHEMAS.progress, kind: 'book-progress', version: 2, progress: o.progress || {} }, packages, settingsResult.settings));
    var existing = await Books.native.listFiles('');
    var remove = existing.filter(function (path) {
      if (packageRoots.some(function (root) { return path.indexOf(root) === 0; }) || path === 'content/settings.json' || path.indexOf('content/fonts/') === 0 || path.indexOf('content/backgrounds/') === 0) return !keep[path];
      return false;
    });
    await Books.native.saveProject(files, remove);
    remember(o.pkg);
    return { catalog: catalog, pkg: o.pkg, assets: assets.length };
  }

  Books.repo = { isFile: isFile, assetUrl: assetUrl, bumpAssetVersion: bumpAssetVersion, loadCatalog: loadCatalog, loadPackage: loadPackage, loadProgressFile: loadProgressFile, loadSettingsFile: loadSettingsFile,
    normalizeCatalog: normalizeCatalog, catalogEntry: catalogEntry, packageFiles: packageFiles, bundleScript: bundleScript, bundlePackage: bundlePackage,
    saveToFolder: saveToFolder, saveNative: saveNative, saveOffline: saveOffline, remember: remember, forget: forget,
    localizeAssets: localizeAssets, collectLocalAssets: collectLocalAssets, localizeSettingsAssets: localizeSettingsAssets,
    extractAssets: extractAssets, referencedLocalImages: referencedLocalImages, IMAGES_DIR: IMAGES_DIR, assetUrl: assetUrl };
})();
