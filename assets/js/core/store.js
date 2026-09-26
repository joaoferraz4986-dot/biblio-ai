(function () {
  'use strict';
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function remove(key) { try { localStorage.removeItem(key); } catch (e) { } }
  Books.store = { read: read, write: write, remove: remove,
    keys: { progress: 'books.progress.v2', legacyProgress: 'memcpp-progress-v1', focus: 'books.focus', lastBook: 'books.last', draft: function (id) { return 'books.draft.' + id; } } };
})();
