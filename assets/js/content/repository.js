(function () {
  "use strict";
  var S = Books.schema;
  var CONTENT = "content/";
  var cache = {};
  var assetVersion = Date.now();
  var OFFLINE_DB = "books-project-offline-v1";
  var OFFLINE_STORE_KEY = "books.project.snapshots.v1";
  var offlineDbPromise = null;

  function offlineDb() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (!offlineDbPromise)
      offlineDbPromise = new Promise(function (resolve) {
        var req = indexedDB.open(OFFLINE_DB, 1);
        req.onupgradeneeded = function () {
          req.result.createObjectStore("snapshots", { keyPath: "key" });
        };
        req.onsuccess = function () {
          resolve(req.result);
        };
        req.onerror = function () {
          resolve(null);
        };
      });
    return offlineDbPromise;
  }
  function offlineRead(key) {
    return offlineDb().then(function (db) {
      if (!db) {
        var fallback = Books.store.read(OFFLINE_STORE_KEY, {});
        return fallback[key] || null;
      }
      return new Promise(function (resolve) {
        var req = db.transaction("snapshots").objectStore("snapshots").get(key);
        req.onsuccess = function () {
          resolve(req.result && req.result.value);
        };
        req.onerror = function () {
          resolve(null);
        };
      });
    });
  }
  function offlineWrite(key, value) {
    return offlineDb().then(function (db) {
      if (!db) {
        var fallback = Books.store.read(OFFLINE_STORE_KEY, {});
        fallback[key] = value;
        return Books.store.write(OFFLINE_STORE_KEY, fallback);
      }
      return new Promise(function (resolve) {
        var tx = db.transaction("snapshots", "readwrite");
        tx.objectStore("snapshots").put({
          key: key,
          value: value,
          savedAt: Date.now(),
        });
        tx.oncomplete = function () {
          resolve(true);
        };
        tx.onerror = function () {
          resolve(false);
        };
      });
    });
  }
  function offlineDelete(key) {
    return offlineDb().then(function (db) {
      if (!db) {
        var fallback = Books.store.read(OFFLINE_STORE_KEY, {});
        delete fallback[key];
        return Books.store.write(OFFLINE_STORE_KEY, fallback);
      }
      return new Promise(function (resolve) {
        var tx = db.transaction("snapshots", "readwrite");
        tx.objectStore("snapshots").delete(key);
        tx.oncomplete = function () {
          resolve(true);
        };
        tx.onerror = function () {
          resolve(false);
        };
      });
    });
  }
  function fingerprint(value) {
    var text = JSON.stringify(value || {}),
      hash = 2166136261;
    for (var i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }
  function snapshotValue(saved, key) {
    if (!saved || saved.kind !== "offline-snapshot" || saved.key !== key)
      return null;
    return saved.value || null;
  }

  function isFile() {
    return location.protocol === "file:";
  }
  function embedded() {
    return globalThis.__BOOKS_BUNDLE__ || null;
  }
  function contentUrl(path) {
    return new URL(CONTENT + path, document.baseURI).href;
  }

  function assetUrl(bookId, src) {
    if (!src) return "";
    if (/^(data:|https?:|blob:|\/)/i.test(src)) return src;
    if (/^content\/packages\//i.test(src))
      return new URL(src, document.baseURI).href + "?v=" + assetVersion;
    if (/^packages\//.test(src)) return contentUrl(src) + "?v=" + assetVersion;
    return contentUrl("packages/" + bookId + "/" + src) + "?v=" + assetVersion;
  }

  function fetchJson(path) {
    return fetch(contentUrl(path), { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("Arquivo não encontrado: " + CONTENT + path);
      return r.json();
    });
  }

  function normalizeCatalog(raw) {
    var catalog = Books.util.clone(raw || {});
    catalog.schema = S.SCHEMAS.catalog;
    catalog.kind = "book-catalog";
    catalog.version = 2;
    catalog.packages = (catalog.packages || []).map(function (p) {
      var entry = Books.util.clone(p);
      if (!Array.isArray(entry.tags)) entry.tags = [];
      if (
        typeof entry.description === "string" &&
        /<[a-z]/i.test(entry.description)
      )
        entry.description = Books.inline.toPlain(
          entry.description.replace(/<[^>]+>/g, ""),
        );
      return entry;
    });
    return catalog;
  }
  function mergeCatalogs(base, saved) {
    var merged = normalizeCatalog(base);
    var byId = {};
    merged.packages.forEach(function (entry) {
      byId[entry.id] = entry;
    });
    normalizeCatalog(saved).packages.forEach(function (entry) {
      byId[entry.id] = Object.assign({}, byId[entry.id] || {}, entry);
    });
    merged.packages = Object.keys(byId).map(function (id) {
      return byId[id];
    });
    return merged;
  }

  function loadCatalog() {
    var bundle = embedded();
    var fromBundle = function () {
      if (!bundle)
        throw new Error(
          isFile()
            ? "Não foi possível carregar o catálogo. Rode `python3 tools/build_bundle.py` ou sirva a pasta por HTTP."
            : "content/catalog.json não encontrado.",
        );
      return normalizeCatalog(bundle.catalog);
    };
    var source = isFile()
      ? Promise.resolve().then(fromBundle)
      : fetchJson("catalog.json")
          .then(normalizeCatalog)
          .catch(function () {
            return fromBundle();
          });
    return source.then(function (catalog) {
      return offlineRead("catalog").then(function (saved) {
        var snapshot = snapshotValue(saved, "catalog");
        return snapshot && snapshot.baseFingerprint === fingerprint(catalog)
          ? mergeCatalogs(catalog, snapshot.value)
          : catalog;
      });
    });
  }

  function loadProgressFile() {
    var bundle = embedded();
    if (isFile()) return Promise.resolve((bundle && bundle.progress) || {});
    return fetchJson("progress.json").catch(function () {
      return (bundle && bundle.progress) || {};
    });
  }

  function loadSettingsFile() {
    var bundle = embedded();
    var source = isFile()
      ? Promise.resolve((bundle && bundle.settings) || {})
      : fetchJson("settings.json")
          .then(function (doc) {
            return (doc && doc.settings) || {};
          })
          .catch(function () {
            return {};
          });
    return source.then(function (settings) {
      return offlineRead("settings").then(function (saved) {
        var snapshot = snapshotValue(saved, "settings");
        return snapshot && snapshot.baseFingerprint === fingerprint(settings)
          ? snapshot.value
          : settings;
      });
    });
  }

  function loadPackage(meta, options) {
    options = options || {};
    if (!options.ignoreOffline && cache[meta.id])
      return Promise.resolve(Books.util.clone(cache[meta.id]));
    var bundle = embedded();
    var fromBundle = function () {
      var b = bundle && bundle.packages && bundle.packages[meta.id];
      if (!b) throw new Error('Pacote "' + meta.id + '" não encontrado.');
      return b;
    };
    var raw = isFile()
      ? Promise.resolve().then(fromBundle)
      : fetchJson(meta.manifest)
          .then(function (manifest) {
            var base = meta.manifest.slice(
              0,
              meta.manifest.lastIndexOf("/") + 1,
            );
            return Promise.all([
              fetchJson(base + manifest.header),
              Promise.all(
                manifest.sections.map(function (p) {
                  return fetchJson(base + p);
                }),
              ),
              fetchJson(base + "image-rights.json").catch(function () {
                return { files: {} };
              }),
            ]).then(function (r) {
              return {
                manifest: manifest,
                header: r[0],
                sections: r[1],
                imageRights: (r[2] && r[2].files) || {},
              };
            });
          })
          .catch(function (e) {
            try {
              return fromBundle();
            } catch (x) {
              throw e;
            }
          });
    return raw.then(function (pkg) {
      var normalized = Books.migrate.normalizePackage(pkg);
      return offlineRead("pkg:" + meta.id).then(function (saved) {
        var snapshot = snapshotValue(saved, "pkg:" + meta.id);
        var result =
          !options.ignoreOffline &&
          snapshot &&
          snapshot.baseFingerprint === fingerprint(normalized)
            ? snapshot.value
            : normalized;
        cache[meta.id] = Books.util.clone(result);
        return result;
      });
    });
  }
  function remember(pkg) {
    cache[pkg.manifest.id] = Books.util.clone(pkg);
  }
  function bumpAssetVersion() {
    assetVersion = Date.now();
  }
  function saveOffline(o) {
    var packages = (o.packages && o.packages.length ? o.packages : [o.pkg]).map(function (item) {
      return Books.util.clone(item);
    });
    var pkgCopy = packages.find(function (item) { return item.manifest.id === o.pkg.manifest.id; }) || packages[0];
    var catalogCopy = Books.util.clone(o.catalog);
    packages.forEach(function (item) {
      var entry = catalogEntry(item);
      var index = catalogCopy.packages.findIndex(function (candidate) { return candidate.id === entry.id; });
      if (index === -1) catalogCopy.packages.push(entry);
      else catalogCopy.packages[index] = entry;
    });
    var settingsCopy = Books.util.clone(o.settings || {});
    var packageWrites = packages.map(function (item) {
      return offlineWrite("pkg:" + item.manifest.id, {
        kind: "offline-snapshot",
        key: "pkg:" + item.manifest.id,
        savedAt: Date.now(),
        baseFingerprint: fingerprint(item),
        value: item,
      });
    });
    return Promise.all(packageWrites.concat([
      offlineWrite("catalog", {
        kind: "offline-snapshot",
        key: "catalog",
        savedAt: Date.now(),
        baseFingerprint: fingerprint(o.catalog),
        value: catalogCopy,
      }),
      offlineWrite("settings", {
        kind: "offline-snapshot",
        key: "settings",
        savedAt: Date.now(),
        baseFingerprint: fingerprint(o.settings || {}),
        value: settingsCopy,
      }),
    ])).then(function () {
      cache[pkgCopy.manifest.id] = Books.util.clone(pkgCopy);
      packages.forEach(function (item) { cache[item.manifest.id] = Books.util.clone(item); });
      return { catalog: catalogCopy, pkg: pkgCopy, packages: packages, offline: true };
    });
  }
  function forget(id) {
    delete cache[id];
  }
  function discardOfflinePackage(id) {
    forget(id);
    return offlineDelete("pkg:" + id);
  }

  function catalogEntry(pkg) {
    var id = pkg.manifest.id;
    var entry = {
      id: id,
      title: pkg.manifest.title,
      description: pkg.manifest.description || "",
      tags: pkg.manifest.tags || [],
      manifest: "packages/" + id + "/manifest.json",
    };
    var cover = pkg.header && pkg.header.cover;
    if (cover && cover.src)
      entry.cover = {
        src: /^(data:|https?:)/i.test(cover.src)
          ? cover.src
          : "packages/" + id + "/" + cover.src,
        alt: cover.alt || "",
        ratio: cover.ratio || "16:9",
      };
    return entry;
  }
  function packageFiles(pkg) {
    var files = {};
    var manifest = Books.util.clone(pkg.manifest);
    manifest.header = "header.json";
    manifest.sections = pkg.sections.map(function (s) {
      return "sections/" + s.id + ".json";
    });
    files["manifest.json"] = manifest;
    files["header.json"] = pkg.header;
    pkg.sections.forEach(function (s) {
      files["sections/" + s.id + ".json"] = s;
    });
    files["image-rights.json"] = {
      schema: "books.image-rights.v1",
      kind: "image-rights",
      files: pkg.imageRights || {},
    };
    return files;
  }
  function bundlePackage(pkg) {
    return {
      manifest: packageFiles(pkg)["manifest.json"],
      header: pkg.header,
      sections: pkg.sections,
      imageRights: pkg.imageRights || {},
    };
  }
  function bundleScript(catalog, progress, packages, settings) {
    var data = {
      schema: S.SCHEMAS.bundle,
      catalog: catalog,
      progress: progress,
      settings: settings || {},
      packages: packages,
    };
    return "\nglobalThis.__BOOKS_BUNDLE__ = " + JSON.stringify(data) + ";\n";
  }

  function dataUrlToBlob(url) {
    var m = /^data:([^;,]+)((?:;[^;,]+)*?)(;base64)?,(.*)$/s.exec(url);
    if (!m) return null;
    var mime = m[1],
      body = m[4];
    if (m[3]) {
      var bin = atob(body),
        bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { blob: new Blob([bytes], { type: mime }), mime: mime };
    }
    return {
      blob: new Blob([decodeURIComponent(body)], { type: mime }),
      mime: mime,
    };
  }
  var EXT = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif",
    "video/mp4": "mp4",
  };
  var IMAGES_DIR = "images"; // pasta separada para imagens de bloco; a capa fica solta na raiz do livro (cover.*)
  var MEDIA_DIR = "media"; // vídeos são mantidos separados das imagens e nunca viram capas
  function isSvgMime(mime) {
    return mime === "image/svg+xml";
  }
  function isSvgPath(path) {
    return /\.svg($|\?)/i.test(path || "");
  }
  function isVideoPath(path) {
    return /\.(?:mp4|m4v|webm|ogg)($|\?)/i.test(path || "");
  }
  function isExternal(url) {
    return /^https?:\/\//i.test(url || "");
  }
  function extFromContentType(ct) {
    return EXT[(ct || "").split(";")[0].trim()] || null;
  }
  function extFromUrl(url) {
    var m = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url || "");
    return m ? m[1].toLowerCase() : null;
  }

  async function localizeAssets(pkg) {
    var assets = [],
      n = 0;
    async function take(url, base, folder) {
      var parsed = dataUrlToBlob(url);
      if (parsed) {
        if (isSvgMime(parsed.mime)) return url; // SVG: mantém embutido, não vira arquivo
        var ext = EXT[parsed.mime] || "bin";
        var path =
          base === "cover"
            ? "cover." + ext
            : (folder || IMAGES_DIR) + "/" + base + "-" + ++n + "." + ext;
        assets.push({ path: path, blob: parsed.blob });
        return path;
      }
      if (isExternal(url)) {
        if (isSvgPath(url)) return url; // SVG externo: também não é baixado como arquivo
        try {
          var res = await fetch(url);
          if (!res.ok) throw new Error("HTTP " + res.status);
          var blob = await res.blob();
          if (isSvgMime(blob.type)) return url;
          var ext2 = extFromContentType(blob.type) || extFromUrl(url) || "bin";
          var path2 =
            base === "cover"
              ? "cover." + ext2
              : (folder || IMAGES_DIR) + "/" + base + "-" + ++n + "." + ext2;
          assets.push({ path: path2, blob: blob });
          return path2;
        } catch (e) {
          console.warn(
            "[repo] não foi possível baixar imagem externa, mantendo URL:",
            url,
            e,
          );
          return url; // sem rede/CORS: fica como está em vez de quebrar o salvamento
        }
      }
      return url;
    }
    if (pkg.header.cover && pkg.header.cover.src)
      pkg.header.cover.src = await take(pkg.header.cover.src, "cover");
    for (var i = 0; i < pkg.sections.length; i++) {
      var blocks = [];
      Books.blocks.walk(pkg.sections[i].blocks, function (b) {
        if ((b.type === "image" || b.type === "video") && b.src) blocks.push({ block: b, srcKey: "src" });
        if (b.type === "history" && b.image && b.image.src) blocks.push({ block: b.image, srcKey: "src" });
      });
      for (var j = 0; j < blocks.length; j++) {
        var isVideo = blocks[j].block.type === "video";
        blocks[j].block[blocks[j].srcKey] = await take(blocks[j].block[blocks[j].srcKey], isVideo ? "video" : "img", isVideo ? MEDIA_DIR : IMAGES_DIR);
      }
    }
    return assets;
  }
  function extractAssets(pkg) {
    var assets = [],
      n = 0;
    function take(url, base, folder) {
      var parsed = dataUrlToBlob(url);
      if (!parsed || isSvgMime(parsed.mime)) return url;
      var ext = EXT[parsed.mime] || "bin";
      var path =
        base === "cover"
          ? "cover." + ext
          : (folder || IMAGES_DIR) + "/" + base + "-" + ++n + "." + ext;
      assets.push({ path: path, blob: parsed.blob });
      return path;
    }
    if (pkg.header.cover && /^data:/i.test(pkg.header.cover.src || ""))
      pkg.header.cover.src = take(pkg.header.cover.src, "cover");
    pkg.sections.forEach(function (s) {
      Books.blocks.walk(s.blocks, function (b) {
        if ((b.type === "image" || b.type === "video") && /^data:/i.test(b.src || ""))
          b.src = take(b.src, b.type === "video" ? "video" : "img", b.type === "video" ? MEDIA_DIR : IMAGES_DIR);
        if (b.type === "history" && b.image && /^data:/i.test(b.image.src || ""))
          b.image.src = take(b.image.src, "img", IMAGES_DIR);
      });
    });
    return assets;
  }

  function referencedLocalImages(pkg) {
    var set = {};
    function mark(src) {
      if (/^(cover\.[a-z0-9]+|images\/|media\/|videos\/)/i.test(src || "")) set[src] = true;
    }
    if (pkg.header.cover) mark(pkg.header.cover.src);
    pkg.sections.forEach(function (s) {
      Books.blocks.walk(s.blocks, function (b) {
        if (b.type === "image" || b.type === "video") mark(b.src);
        if (b.type === "history" && b.image) mark(b.image.src);
      });
    });
    return set;
  }

  async function pruneOrphanImages(pkgDir, referenced) {
    for await (var entry of pkgDir.values()) {
      if (
        entry.kind === "file" &&
        /^cover\./i.test(entry.name) &&
        !referenced[entry.name]
      ) {
        try {
          await pkgDir.removeEntry(entry.name);
        } catch (e) {}
      }
    }
    for (var folder of [IMAGES_DIR, MEDIA_DIR, "videos"]) {
      var mediaDir = null;
      try { mediaDir = await pkgDir.getDirectoryHandle(folder); } catch (e) { continue; }
      for await (var media of mediaDir.values()) {
        if (media.kind === "file" && !referenced[folder + "/" + media.name]) {
          try { await mediaDir.removeEntry(media.name); } catch (e) {}
        }
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
    var parts = path.split("/").filter(Boolean);
    for (var i = 0; i < parts.length; i++)
      cur = await cur.getDirectoryHandle(parts[i], { create: true });
    return cur;
  }

  function dataUrlMime(url) {
    var parsed = dataUrlToBlob(url);
    return parsed ? parsed.mime : "";
  }
  function pathFromMime(mime) {
    return (
      EXT[mime] ||
      {
        "font/ttf": "ttf",
        "font/otf": "otf",
        "font/woff": "woff",
        "font/woff2": "woff2",
        "application/x-font-ttf": "ttf",
        "application/x-font-opentype": "otf",
      }[mime] ||
      "bin"
    );
  }

  async function collectLocalAssets(pkg, root) {
    var assets = [],
      refs = referencedLocalImages(pkg),
      base = "content/packages/" + pkg.manifest.id + "/";
    for (var path in refs) {
      try {
        var file;
        if (root) {
          var dir = await subdir(
            root,
            base + path.split("/").slice(0, -1).join("/"),
          );
          var name = path.split("/").pop();
          file = await (await dir.getFileHandle(name)).getFile();
        } else {
          var url = assetUrl(pkg.manifest.id, path);
          var response = await fetch(url);
          if (!response.ok) throw new Error("HTTP " + response.status);
          file = await response.blob();
        }
        assets.push({ path: path, blob: file });
      } catch (e) {
        console.warn(
          "[repo] asset local não encontrado, mantendo somente a referência:",
          path,
          e,
        );
      }
    }
    return assets;
  }

  async function localizeSettingsAssets(settings, root) {
    var out = Books.util.clone(settings || {}),
      assets = [],
      seen = {};
    function add(path, blob) {
      if (!seen[path]) {
        seen[path] = true;
        assets.push({ path: path, blob: blob });
      }
    }
    async function localize(list, folder, fallbackExt) {
      (list || []).forEach(function (item) {
        if (!item || !item.src) return;
        var parsed = dataUrlToBlob(item.src);
        if (parsed && !isSvgMime(parsed.mime)) {
          var path =
            folder +
            "/" +
            item.id +
            "." +
            pathFromMime(parsed.mime || fallbackExt);
          item.src = path;
          add(path, parsed.blob);
        }
      });
      var existing = await Promise.all(
        (list || [])
          .filter(function (item) {
            return item && item.src && !/^data:/i.test(item.src);
          })
          .map(async function (item) {
            if (/^(https?:|blob:)/i.test(item.src)) return null;
            try {
              var p = item.src.replace(/^content\//, "");
              var dirPath = p.split("/").slice(0, -1).join("/");
              var name = p.split("/").pop();
              var dir = root ? await subdir(root, "content/" + dirPath) : null;
              var file = root
                ? await (await dir.getFileHandle(name)).getFile()
                : await (await fetch(contentUrl(p))).blob();
              return { path: p, blob: file };
            } catch (e) {
              return null;
            }
          }),
      );
      existing.forEach(function (a) {
        if (a) add(a.path, a.blob);
      });
    }
    await localize(out.customBackgrounds, "backgrounds", "png");
    await localize(out.customFonts, "fonts", "ttf");
    return { settings: out, assets: assets };
  }

  async function pruneSettingsAssets(contentDir, settings) {
    var used = {};
    ["customBackgrounds", "customFonts"].forEach(function (key) {
      ((settings && settings[key]) || []).forEach(function (item) {
        if (item && item.src && !/^data:/i.test(item.src))
          used[item.src.replace(/^content\//, "")] = true;
      });
    });
    for (var i = 0; i < 2; i++) {
      var folder = i === 0 ? "backgrounds" : "fonts",
        dir;
      try {
        dir = await contentDir.getDirectoryHandle(folder);
      } catch (e) {
        continue;
      }
      for await (var entry of dir.values()) {
        if (entry.kind === "file" && !used[folder + "/" + entry.name]) {
          try {
            await dir.removeEntry(entry.name);
          } catch (e) {}
        }
      }
    }
  }

  async function saveToFolder(o) {
    var content = await o.root.getDirectoryHandle("content", { create: true });
    var pkgDir = await subdir(content, "packages/" + o.pkg.manifest.id);
    var assets = await localizeAssets(o.pkg);
    var localAssets = await collectLocalAssets(o.pkg, o.root);
    localAssets = localAssets.filter(function (asset) {
      return !assets.some(function (current) {
        return current.path === asset.path;
      });
    });
    var settingsResult = await localizeSettingsAssets(o.settings, o.root);
    await pruneSettingsAssets(content, settingsResult.settings);
    assets = assets.concat(localAssets);
    for (var a = 0; a < assets.length; a++) {
      var parts = assets[a].path.split("/"),
        name = parts.pop();
      await writeFile(
        parts.length ? await subdir(pkgDir, parts.join("/")) : pkgDir,
        name,
        assets[a].blob,
      );
    }
    await pruneOrphanImages(pkgDir, referencedLocalImages(o.pkg));
    var files = packageFiles(o.pkg);
    var sectionsDir = await subdir(pkgDir, "sections");
    var keep = {};
    for (var path in files) {
      var json = JSON.stringify(files[path], null, 2) + "\n";
      var segs = path.split("/"),
        fname = segs.pop();
      await writeFile(segs.length ? sectionsDir : pkgDir, fname, json);
      if (segs.length) keep[fname] = true;
    }
    for await (var entry of sectionsDir.values()) {
      if (
        entry.kind === "file" &&
        /\.json$/.test(entry.name) &&
        !keep[entry.name]
      )
        await sectionsDir.removeEntry(entry.name);
    }
    var catalog = Books.util.clone(o.catalog);
    var entryData = catalogEntry(o.pkg);
    var idx = catalog.packages.findIndex(function (p) {
      return p.id === entryData.id;
    });
    if (idx === -1) catalog.packages.push(entryData);
    else catalog.packages[idx] = entryData;
    await writeFile(
      content,
      "catalog.json",
      JSON.stringify(catalog, null, 2) + "\n",
    );
    var progressDoc = {
      schema: S.SCHEMAS.progress,
      kind: "book-progress",
      version: 2,
      progress: o.progress || {},
    };
    await writeFile(
      content,
      "progress.json",
      JSON.stringify(progressDoc, null, 2) + "\n",
    );
    for (var sa = 0; sa < settingsResult.assets.length; sa++) {
      var settingAsset = settingsResult.assets[sa];
      var settingParts = settingAsset.path.split("/"),
        settingName = settingParts.pop();
      await writeFile(
        settingParts.length
          ? await subdir(content, settingParts.join("/"))
          : content,
        settingName,
        settingAsset.blob,
      );
    }
    if (o.settings) {
      var settingsDoc = {
        schema: "books.settings.v1",
        kind: "book-settings",
        version: 1,
        settings: o.settings,
      };
      settingsDoc.settings = settingsResult.settings;
      await writeFile(
        content,
        "settings.json",
        JSON.stringify(settingsDoc, null, 2) + "\n",
      );
    }

    var packages = {};
    for (var i = 0; i < catalog.packages.length; i++) {
      var id = catalog.packages[i].id;
      var p = id === o.pkg.manifest.id ? o.pkg : await o.resolvePackage(id);
      if (p) packages[id] = bundlePackage(p);
    }
    var assetsJsDir = await subdir(o.root, "assets/js");
    await writeFile(
      assetsJsDir,
      "embedded-bundle.js",
      bundleScript(catalog, progressDoc, packages, settingsResult.settings),
    );
    await offlineDelete("pkg:" + o.pkg.manifest.id);
    remember(o.pkg);
    return { catalog: catalog, pkg: o.pkg, assets: assets.length };
  }

  async function saveCollectionToFolder(o) {
    var packages = (o.packages && o.packages.length ? o.packages : [o.pkg]).map(function (item) { return Books.util.clone(item); });
    var byId = {};
    packages.forEach(function (item) { byId[item.manifest.id] = item; });
    var catalog = Books.util.clone(o.catalog);
    var result = null;
    for (var i = 0; i < packages.length; i++) {
      var current = packages[i];
      result = await saveToFolder({
        root: o.root,
        pkg: current,
        catalog: catalog,
        progress: o.progress,
        settings: o.settings,
        resolvePackage: function (id) {
          if (byId[id]) return Promise.resolve(byId[id]);
          return o.resolvePackage ? o.resolvePackage(id) : Promise.resolve(null);
        }
      });
      catalog = result.catalog;
    }
    return { catalog: catalog, pkg: byId[o.pkg.manifest.id] || o.pkg, packages: packages, assets: result ? result.assets : 0 };
  }

  Books.repo = {
    isFile: isFile,
    assetUrl: assetUrl,
    bumpAssetVersion: bumpAssetVersion,
    loadCatalog: loadCatalog,
    loadPackage: loadPackage,
    loadProgressFile: loadProgressFile,
    loadSettingsFile: loadSettingsFile,
    normalizeCatalog: normalizeCatalog,
    catalogEntry: catalogEntry,
    packageFiles: packageFiles,
    bundleScript: bundleScript,
    bundlePackage: bundlePackage,
    saveToFolder: saveToFolder,
    saveCollectionToFolder: saveCollectionToFolder,
    saveOffline: saveOffline,
    discardOfflinePackage: discardOfflinePackage,
    remember: remember,
    forget: forget,
    localizeAssets: localizeAssets,
    collectLocalAssets: collectLocalAssets,
    localizeSettingsAssets: localizeSettingsAssets,
    extractAssets: extractAssets,
    referencedLocalImages: referencedLocalImages,
    IMAGES_DIR: IMAGES_DIR,
    MEDIA_DIR: MEDIA_DIR,
    assetUrl: assetUrl,
  };
})();
