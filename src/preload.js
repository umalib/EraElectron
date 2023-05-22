const { contextBridge, ipcRenderer } = require('electron');
const { engineCommand } = require('@/renderer/utils/embedded');

contextBridge.exposeInMainWorld('ipc', {
  listen(cb) {
    ipcRenderer.on('connector', (_, msg) => cb(msg));
  },
  load() {
    ipcRenderer.send('engine', engineCommand.start);
  },
  registerMenu(cb) {
    ipcRenderer.on('engine', (_, msg) => cb(msg));
  },
  restart() {
    ipcRenderer.send('engine', engineCommand.restart);
  },
  returnInput(key, val) {
    ipcRenderer.send(key, val);
  },
  version: '1.0',
});
