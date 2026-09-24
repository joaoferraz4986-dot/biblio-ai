/* Ponte opcional para recursos nativos do aplicativo Tauri. */
(function () {
  'use strict';
  var ROOT_KEY = 'books.native.project-root.v1';
  var projectRoot = Books.store.read(ROOT_KEY, '');
  var rootReady = Promise.resolve('');

  function tauri() {
    var value = globalThis.__TAURI__;
    return value && value.core && typeof value.core.invoke === 'function' ? value : null;
  }
  function isAvailable() { return !!tauri(); }
  function invoke(command, args) {
    var api = tauri();
    if (!api) return Promise.reject(new Error('O runtime nativo não está disponível.'));
    return api.core.invoke(command, args || {});
  }
  function ensureRoot() {
    if (!isAvailable() || !projectRoot) return Promise.resolve('');
    return rootReady;
  }
  function setProjectRoot(path) {
    projectRoot = String(path || '');
    if (projectRoot) Books.store.write(ROOT_KEY, projectRoot);
    else Books.store.remove(ROOT_KEY);
    rootReady = projectRoot ? invoke('set_project_root', { root: projectRoot }).catch(function (error) {
      Books.store.remove(ROOT_KEY);
      projectRoot = '';
      throw error;
    }) : Promise.resolve('');
    return rootReady;
  }
  function join(root, relative) {
    return String(root || '').replace(/[\\/]+$/, '') + '/' + String(relative || '').replace(/^[/\\]+/, '').replace(/\\/g, '/');
  }
  function assetUrl(relative) {
    var api = tauri();
    if (!api || !projectRoot) return '';
    return api.core.convertFileSrc(join(projectRoot, relative));
  }
  function chooseProjectDirectory() {
    return invoke('pick_project_directory').then(function (path) {
      return path ? setProjectRoot(path).then(function () { return path; }) : null;
    });
  }
  function saveBinary(name, bytes) {
    return invoke('save_binary_file', { name: name, data: Array.prototype.slice.call(bytes) });
  }
  function readText(relative) { return ensureRoot().then(function () { return invoke('read_project_file', { root: projectRoot, relativePath: relative }); }); }
  function readBinary(relative) { return ensureRoot().then(function () { return invoke('read_project_file_base64', { root: projectRoot, relativePath: relative }); }); }
  function listFiles(relative) { return ensureRoot().then(function () { return invoke('list_project_files', { root: projectRoot, relativePath: relative }); }); }
  function saveProject(files, remove) { return ensureRoot().then(function () { return invoke('save_project', { root: projectRoot, files: files || [], remove: remove || [] }); }); }

  Books.native = {
    isAvailable: isAvailable,
    invoke: invoke,
    projectRoot: function () { return projectRoot; },
    setProjectRoot: setProjectRoot,
    assetUrl: assetUrl,
    chooseProjectDirectory: chooseProjectDirectory,
    saveBinary: saveBinary,
    readText: readText,
    readBinary: readBinary,
    listFiles: listFiles,
    saveProject: saveProject
  };
  if (projectRoot && isAvailable()) setProjectRoot(projectRoot);
})();
