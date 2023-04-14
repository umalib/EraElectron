const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
  listen(cb) {
    ipcRenderer.on('connector', (_, msg) => cb(msg));
  },
  load() {
    ipcRenderer.send('engine', 'load');
  },
  registerMenu(cb) {
    ipcRenderer.on('engine', (_, msg) => cb(msg));
  },
  restart() {
    ipcRenderer.send('engine', 'restart');
  },
  returnInput(key, val) {
    ipcRenderer.send(key, val);
  },
  version: '1.0',
});
