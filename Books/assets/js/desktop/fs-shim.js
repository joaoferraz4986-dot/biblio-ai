/* Camada de I/O do app desktop.
 * No Electron, implementa a mesma interface da File System Access API (showDirectoryPicker,
 * FileSystemDirectoryHandle/FileHandle) sobre o fs real do Node. Assim repository.js e o editor
 * gravam direto no disco — inclusive apagando capa/imagens antigas — sem cair no fluxo de ZIP.
 * No navegador comum este arquivo não faz nada. */
(function () {
  'use strict';
  var N = window.booksNative;
  if (!N || !N.isDesktop) return;

  function join(a, b) { return a ? a + '/' + b : b; }
  function notFound(name) { var e = new Error('Arquivo ou pasta não encontrado: ' + name); e.name = 'NotFoundError'; return e; }
  function mismatch(name) { var e = new Error('Tipo incompatível: ' + name); e.name = 'TypeMismatchError'; return e; }
  function checkName(name) { if (!name || /[\/\\]/.test(name) || name === '.' || name === '..') { var e = new TypeError('Nome inválido: ' + name); throw e; } }

  async function toBytes(data) {
    if (data == null) return new Uint8Array(0);
    if (typeof data === 'string') return new TextEncoder().encode(data);
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    if (data instanceof Blob) return new Uint8Array(await data.arrayBuffer());
    if (typeof data === 'object' && data.type === 'write') return toBytes(data.data);
    throw new TypeError('Tipo de dado não suportado para escrita');
  }
  function mime(name) {
    var ext = (name.split('.').pop() || '').toLowerCase();
    return ({ json: 'application/json', js: 'text/javascript', css: 'text/css', html: 'text/html', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf' })[ext] || 'application/octet-stream';
  }

  function Writable(path) { this._path = path; this._chunks = []; }
  Writable.prototype.write = async function (data) { this._chunks.push(await toBytes(data)); };
  Writable.prototype.truncate = async function () { this._chunks = []; };
  Writable.prototype.close = async function () {
    var total = this._chunks.reduce(function (n, c) { return n + c.byteLength; }, 0), out = new Uint8Array(total), off = 0;
    this._chunks.forEach(function (c) { out.set(c, off); off += c.byteLength; });
    await N.write(this._path, out);
  };
  Writable.prototype.abort = async function () { this._chunks = []; };

  function FileHandle(path, name) { this.kind = 'file'; this.name = name; this._path = path; }
  FileHandle.prototype.getFile = async function () { var b = await N.read(this._path); return new File([b], this.name, { type: mime(this.name) }); };
  FileHandle.prototype.createWritable = async function () { return new Writable(this._path); };
  FileHandle.prototype.queryPermission = async function () { return 'granted'; };
  FileHandle.prototype.requestPermission = async function () { return 'granted'; };
  FileHandle.prototype.isSameEntry = async function (o) { return !!o && o._path === this._path && o.kind === this.kind; };

  function DirHandle(path, name) { this.kind = 'directory'; this.name = name; this._path = path; }
  DirHandle.prototype.getDirectoryHandle = async function (name, opts) {
    checkName(name); var p = join(this._path, name), st = await N.stat(p);
    if (!st) { if (opts && opts.create) await N.mkdir(p); else throw notFound(name); }
    else if (st.kind !== 'directory') throw mismatch(name);
    return new DirHandle(p, name);
  };
  DirHandle.prototype.getFileHandle = async function (name, opts) {
    checkName(name); var p = join(this._path, name), st = await N.stat(p);
    if (!st) { if (opts && opts.create) await N.write(p, new Uint8Array(0)); else throw notFound(name); }
    else if (st.kind !== 'file') throw mismatch(name);
    return new FileHandle(p, name);
  };
  DirHandle.prototype.removeEntry = async function (name, opts) {
    checkName(name); var p = join(this._path, name);
    if (!(await N.stat(p))) throw notFound(name);
    await N.remove(p, !!(opts && opts.recursive));
  };
  DirHandle.prototype._items = async function () {
    var self = this, list = await N.list(this._path);
    return list.map(function (i) { var p = join(self._path, i.name); return [i.name, i.kind === 'directory' ? new DirHandle(p, i.name) : new FileHandle(p, i.name)]; });
  };
  DirHandle.prototype.entries = async function* () { var it = await this._items(); for (var i = 0; i < it.length; i++) yield it[i]; };
  DirHandle.prototype.values = async function* () { var it = await this._items(); for (var i = 0; i < it.length; i++) yield it[i][1]; };
  DirHandle.prototype.keys = async function* () { var it = await this._items(); for (var i = 0; i < it.length; i++) yield it[i][0]; };
  DirHandle.prototype[Symbol.asyncIterator] = DirHandle.prototype.entries;
  DirHandle.prototype.queryPermission = async function () { return 'granted'; };
  DirHandle.prototype.requestPermission = async function () { return 'granted'; };
  DirHandle.prototype.isSameEntry = FileHandle.prototype.isSameEntry;
  DirHandle.prototype.resolve = async function (o) { if (!o || o._path.indexOf(this._path) !== 0) return null; return o._path.slice(this._path.length).split('/').filter(Boolean); };

  // O "seletor de pasta" no app desktop devolve sempre a pasta do próprio projeto (sem diálogo):
  // salvar grava no lugar certo, sem risco de escolher a pasta errada.
  window.showDirectoryPicker = async function () { return new DirHandle('', 'Books'); };
  document.documentElement.classList.add('is-desktop');
  window.Books = window.Books || {};
  window.Books.desktop = { isDesktop: true, openDataDir: N.openDataDir, root: N.root };
})();
