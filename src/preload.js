const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('test', {
  flag: 1,
});

contextBridge.exposeInMainWorld('ipc', {
  listen(cb) {
    ipcRenderer.on('connector', (_, msg) => cb(msg));
  },
  registerMenu(cb) {
    ipcRenderer.on('engine', (_, msg) => cb(msg));
  },
  load() {
    ipcRenderer.send('engine', 'load');
  },
  restart() {
    ipcRenderer.send('engine', 'restart');
  },
  returnInput(key, val) {
    ipcRenderer.send(key, val);
  },
});
