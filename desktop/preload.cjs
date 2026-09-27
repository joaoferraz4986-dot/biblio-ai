'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('booksNative', {
  isDesktop: true,
  root: () => ipcRenderer.invoke('fs:root'),
  stat: (p) => ipcRenderer.invoke('fs:stat', p),
  list: (p) => ipcRenderer.invoke('fs:list', p),
  mkdir: (p) => ipcRenderer.invoke('fs:mkdir', p),
  read: (p) => ipcRenderer.invoke('fs:read', p),
  write: (p, bytes) => ipcRenderer.invoke('fs:write', p, bytes),
  remove: (p, recursive) => ipcRenderer.invoke('fs:remove', p, recursive),
  openDataDir: () => ipcRenderer.invoke('app:openDataDir'),
});
