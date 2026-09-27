"use strict";
const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  shell,
  net,
  Menu,
} = require("electron");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const crypto = require("crypto");
const { pathToFileURL } = require("url");

const BUNDLED = path.resolve(__dirname, "..");
const APP_ICON = path.join(BUNDLED, "build", "icons", "biblio-ai.png");
const DATA_DIR = path.resolve(
  process.env.LIVROS_DIR || path.join(app.getPath("userData"), "Biblio Ai"),
);
const SKIP = new Set([
  "desktop",
  "node_modules",
  "electron-release",
  "dist",
  "flake.nix",
  "flake.lock",
  "package.json",
  "package-lock.json",
  ".git",
  "result",
]);

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

async function copyDir(src, dst) {
  await fsp.mkdir(dst, { recursive: true });
  for (const e of await fsp.readdir(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) && src === BUNDLED) continue;
    const s = path.join(src, e.name),
      d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else if (e.isFile()) {
      await fsp.copyFile(s, d);
      await fsp.chmod(d, 0o644);
    }
  }
}
async function copyFileIfDifferent(src, dst) {
  const source = await fsp.readFile(src);
  let target = null;
  try {
    target = await fsp.readFile(dst);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (!target || !target.equals(source)) {
    await fsp.mkdir(path.dirname(dst), { recursive: true });
    await fsp.writeFile(dst, source);
  }
}
async function syncDir(src, dst) {
  await fsp.mkdir(dst, { recursive: true });
  for (const entry of await fsp.readdir(src, { withFileTypes: true })) {
    const source = path.join(src, entry.name);
    const target = path.join(dst, entry.name);
    if (entry.isDirectory()) await syncDir(source, target);
    else if (entry.isFile()) await copyFileIfDifferent(source, target);
  }
}
async function sourceFingerprint() {
  const hash = crypto.createHash("sha256");
  for (const rel of [
    "content/catalog.json",
    "assets/js/embedded-bundle.js",
    "Livros.html",
  ]) {
    hash.update(await fsp.readFile(path.join(BUNDLED, rel)));
  }
  return hash.digest("hex");
}
async function fileFingerprint(filePath) {
  return crypto
    .createHash("sha256")
    .update(await fsp.readFile(filePath))
    .digest("hex");
}
async function mergeCatalog() {
  const sourcePath = path.join(BUNDLED, "content", "catalog.json");
  const targetPath = path.join(DATA_DIR, "content", "catalog.json");
  const source = JSON.parse(await fsp.readFile(sourcePath, "utf8"));
  let target = source;
  try {
    target = JSON.parse(await fsp.readFile(targetPath, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const byId = new Map((source.packages || []).map((item) => [item.id, item]));
  for (const item of target.packages || [])
    if (!byId.has(item.id)) byId.set(item.id, item);
  target.packages = [...byId.values()];
  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  await fsp.writeFile(targetPath, `${JSON.stringify(target, null, 2)}\n`);
}
async function syncManagedPackages() {
  const sourceRoot = path.join(BUNDLED, "content", "packages");
  const targetRoot = path.join(DATA_DIR, "content", "packages");
  const versionPath = path.join(DATA_DIR, ".books-source-files.json");
  let previous = {};
  try {
    previous = JSON.parse(await fsp.readFile(versionPath, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const current = {};
  async function syncTree(sourceDir, targetDir, prefix) {
    await fsp.mkdir(targetDir, { recursive: true });
    for (const entry of await fsp.readdir(sourceDir, { withFileTypes: true })) {
      const source = path.join(sourceDir, entry.name);
      const target = path.join(targetDir, entry.name);
      const relative = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) {
        await syncTree(source, target, relative);
        continue;
      }
      if (!entry.isFile()) continue;
      const sourceHash = await fileFingerprint(source);
      current[relative] = sourceHash;
      let targetHash = null;
      try {
        targetHash = await fileFingerprint(target);
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
      const hasPreviousMap = Object.keys(previous).length > 0;
      const isPackageMetadata =
        /\/((manifest|header|image-rights)\.json)$/.test(relative);
      const safeToUpdate =
        !targetHash ||
        isPackageMetadata ||
        (hasPreviousMap && targetHash === previous[relative]);
      if (safeToUpdate) await copyFileIfDifferent(source, target);
    }
  }
  await syncTree(sourceRoot, targetRoot, "content/packages");
  await fsp.writeFile(versionPath, `${JSON.stringify(current, null, 2)}\n`);
}
async function ensureDataDir() {
  if (path.resolve(BUNDLED) === DATA_DIR) return;
  if (!fs.existsSync(path.join(DATA_DIR, "Livros.html"))) {
    await copyDir(BUNDLED, DATA_DIR);
  } else {
    await copyFileIfDifferent(
      path.join(BUNDLED, "Livros.html"),
      path.join(DATA_DIR, "Livros.html"),
    );
    await syncDir(path.join(BUNDLED, "assets"), path.join(DATA_DIR, "assets"));
    await syncManagedPackages();
    await mergeCatalog();
  }
  await fsp.writeFile(
    path.join(DATA_DIR, ".books-source-version"),
    await sourceFingerprint(),
  );
}
function resolveSafe(rel) {
  const p = path.resolve(DATA_DIR, String(rel || "").replace(/^\/+/, ""));
  if (p !== DATA_DIR && !p.startsWith(DATA_DIR + path.sep))
    throw new Error("Caminho fora da pasta do projeto: " + rel);
  return p;
}

function registerIpc() {
  ipcMain.handle("fs:root", () => DATA_DIR);
  ipcMain.handle("fs:stat", async (_e, rel) => {
    try {
      const s = await fsp.stat(resolveSafe(rel));
      return {
        kind: s.isDirectory() ? "directory" : "file",
        size: s.size,
        mtime: s.mtimeMs,
      };
    } catch (e) {
      return null;
    }
  });
  ipcMain.handle("fs:list", async (_e, rel) => {
    const items = await fsp.readdir(resolveSafe(rel), { withFileTypes: true });
    return items
      .filter((i) => i.isFile() || i.isDirectory())
      .map((i) => ({
        name: i.name,
        kind: i.isDirectory() ? "directory" : "file",
      }));
  });
  ipcMain.handle("fs:mkdir", async (_e, rel) => {
    await fsp.mkdir(resolveSafe(rel), { recursive: true });
    return true;
  });
  ipcMain.handle("fs:read", async (_e, rel) => {
    const b = await fsp.readFile(resolveSafe(rel));
    return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  });
  ipcMain.handle("fs:write", async (_e, rel, bytes) => {
    const p = resolveSafe(rel),
      tmp = p + ".tmp-" + process.pid + "-" + Date.now();
    await fsp.mkdir(path.dirname(p), { recursive: true });
    await fsp.writeFile(tmp, Buffer.from(bytes));
    await fsp.rename(tmp, p);
    return true;
  });
  ipcMain.handle("fs:remove", async (_e, rel, recursive) => {
    await fsp.rm(resolveSafe(rel), { recursive: !!recursive, force: false });
    return true;
  });
  ipcMain.handle("app:openDataDir", () => shell.openPath(DATA_DIR));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: APP_ICON,
    minWidth: 360,
    minHeight: 480,
    title: "Biblio Ai",
    backgroundColor: "#0d1117",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("app://")) {
      e.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });
  win.loadURL("app://books/Livros.html");
}

app.whenReady().then(async () => {
  await ensureDataDir();
  protocol.handle("app", (req) => {
    const u = new URL(req.url);
    let file;
    try {
      file = resolveSafe(decodeURIComponent(u.pathname));
    } catch (e) {
      return new Response("forbidden", { status: 403 });
    }
    return net.fetch(pathToFileURL(file).toString());
  });
  registerIpc();
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Arquivo",
        submenu: [
          {
            label: "Abrir pasta dos livros",
            click: () => shell.openPath(DATA_DIR),
          },
          { type: "separator" },
          { role: "quit", label: "Sair" },
        ],
      },
      {
        label: "Exibir",
        submenu: [
          { role: "reload", label: "Recarregar" },
          { role: "toggleDevTools", label: "Ferramentas de desenvolvedor" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { role: "togglefullscreen", label: "Tela cheia" },
        ],
      },
    ]),
  );
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
