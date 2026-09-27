(function () {
  'use strict';
  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) ^ (c >>> 1) : (c >>> 1);
      c = n;
      for (var j = 0; j < 8; j++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();
  var MAX_ENTRIES = 512, MAX_ENTRY_BYTES = 16 * 1024 * 1024, MAX_TOTAL_BYTES = 64 * 1024 * 1024;
  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function toBytes(data) { return data instanceof Uint8Array ? data : new TextEncoder().encode(String(data)); }
  function dosDateTime(date) {
    date = date || new Date();
    var time = ((date.getHours() & 0x1F) << 11) | ((date.getMinutes() & 0x3F) << 5) | ((date.getSeconds() >> 1) & 0x1F);
    var d = (((date.getFullYear() - 1980) & 0x7F) << 9) | (((date.getMonth() + 1) & 0xF) << 5) | (date.getDate() & 0x1F);
    return { time: time, date: d };
  }
  function u16(n) { return [n & 0xFF, (n >> 8) & 0xFF]; }
  function u32(n) { return [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >>> 24) & 0xFF]; }
  function read16(bytes, offset) { return bytes[offset] | (bytes[offset + 1] << 8); }
  function read32(bytes, offset) { return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0; }
  function text(bytes) { return new TextDecoder('utf-8').decode(bytes); }
  function safeName(name) { return name && name.length <= 255 && name.indexOf('\u0000') === -1 && name.indexOf('\\') === -1 && name.split('/').indexOf('..') === -1 && name.charAt(0) !== '/' && !/^[A-Za-z]:/.test(name); }

  function build(files) {
    if (!Array.isArray(files) || files.length > MAX_ENTRIES) throw new Error('ZIP excede o limite de ' + MAX_ENTRIES + ' entradas.');
    var chunks = [], central = [], offset = 0;
    var dt = dosDateTime();
    var total = 0, names = {};
    files.forEach(function (f) {
      if (!safeName(f.name) || names[f.name]) throw new Error('Nome de arquivo ZIP inválido ou duplicado: ' + f.name);
      names[f.name] = true;
      var nameBytes = new TextEncoder().encode(f.name);
      var data = toBytes(f.data);
      if (data.length > MAX_ENTRY_BYTES || total + data.length > MAX_TOTAL_BYTES) throw new Error('ZIP excede o limite de tamanho permitido.');
      total += data.length;
      var crc = crc32(data);
      var local = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
        u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0));
      var localHeader = new Uint8Array(local);
      chunks.push(localHeader, nameBytes, data);
      var centralHeader = new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
        u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset)));
      central.push(centralHeader, nameBytes);
      offset += localHeader.length + nameBytes.length + data.length;
    });
    var centralSize = central.reduce(function (s, c) { return s + c.length; }, 0);
    var centralStart = offset;
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralSize), u32(centralStart), u16(0)));
    return new Blob(chunks.concat(central, [end]), { type: 'application/zip' });
  }

  function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') {
      return Promise.reject(new Error('Este navegador não consegue descompactar ZIPs deflate. Abra o projeto em uma versão recente do Chrome, Edge ou Firefox.'));
    }
    try {
      var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Response(stream).arrayBuffer().then(function (buffer) { return new Uint8Array(buffer); });
    } catch (e) {
      return Promise.reject(new Error('Não foi possível descompactar o arquivo ZIP: ' + e.message));
    }
  }

  function read(blob) {
    return blob.arrayBuffer().then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      if (bytes.length > MAX_TOTAL_BYTES * 2) throw new Error('ZIP muito grande para ser processado com segurança.');
      var eocd = -1;
      for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
        if (read32(bytes, i) === 0x06054b50) { eocd = i; break; }
      }
      if (eocd < 0) throw new Error('O arquivo não parece ser um ZIP válido.');
      var count = read16(bytes, eocd + 10);
      if (count > MAX_ENTRIES) throw new Error('ZIP excede o limite de ' + MAX_ENTRIES + ' entradas.');
      var centralOffset = read32(bytes, eocd + 16);
      var centralSize = read32(bytes, eocd + 12);
      if (centralOffset + centralSize > bytes.length) throw new Error('Índice central do ZIP está fora dos limites.');
      var centralPos = centralOffset;
      var entries = [];
      var names = {}, totalUncompressed = 0;
      for (var n = 0; n < count; n++) {
        if (read32(bytes, centralPos) !== 0x02014b50) throw new Error('Índice central do ZIP inválido.');
        var flags = read16(bytes, centralPos + 8);
        var method = read16(bytes, centralPos + 10);
        var compressedSize = read32(bytes, centralPos + 20);
        var uncompressedSize = read32(bytes, centralPos + 24);
        var nameSize = read16(bytes, centralPos + 28);
        var extraSize = read16(bytes, centralPos + 30);
        var commentSize = read16(bytes, centralPos + 32);
        var localOffset = read32(bytes, centralPos + 42);
        var name = text(bytes.subarray(centralPos + 46, centralPos + 46 + nameSize));
        if (!safeName(name)) throw new Error('O ZIP contém um caminho de arquivo inseguro: ' + name);
        if (names[name]) throw new Error('O ZIP contém entradas duplicadas: ' + name);
        if (flags & 1) throw new Error('ZIP criptografado não é suportado: ' + name);
        if (uncompressedSize > MAX_ENTRY_BYTES || totalUncompressed + uncompressedSize > MAX_TOTAL_BYTES) throw new Error('ZIP excede o limite de descompressão permitido.');
        names[name] = true; totalUncompressed += uncompressedSize;
        entries.push({ name: name, flags: flags, method: method, compressedSize: compressedSize, uncompressedSize: uncompressedSize, crc: read32(bytes, centralPos + 16), localOffset: localOffset });
        centralPos += 46 + nameSize + extraSize + commentSize;
      }
      return Promise.all(entries.filter(function (entry) { return !/\/$/.test(entry.name); }).map(function (entry) {
        var local = entry.localOffset;
        if (local + 30 > bytes.length) throw new Error('Entrada ZIP fora dos limites: ' + entry.name);
        if (read32(bytes, local) !== 0x04034b50) throw new Error('Entrada ZIP inválida: ' + entry.name);
        var localNameSize = read16(bytes, local + 26);
        var localExtraSize = read16(bytes, local + 28);
        var start = local + 30 + localNameSize + localExtraSize;
        if (start < local || start + entry.compressedSize > bytes.length) throw new Error('Dados ZIP fora dos limites: ' + entry.name);
        var compressed = bytes.subarray(start, start + entry.compressedSize);
        var decoded = entry.method === 0 ? Promise.resolve(new Uint8Array(compressed)) : entry.method === 8 ? inflateRaw(compressed) : Promise.reject(new Error('Método de compressão ZIP não suportado para "' + entry.name + '".'));
        return decoded.then(function (data) {
          if (data.length !== entry.uncompressedSize) throw new Error('Tamanho inesperado na entrada ZIP: ' + entry.name);
          if (crc32(data) !== entry.crc) throw new Error('CRC inválido na entrada ZIP: ' + entry.name);
          return {
            name: entry.name,
            data: data,
            text: function () { return text(data); }
          };
        });
      }));
    });
  }

  Books.zip = { build: build, read: read };
})();
