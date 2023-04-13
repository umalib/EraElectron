const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('test', {
  flag: 1,
});

contextBridge.exposeInMainWorld('ipc', {
  listen(cb) {
    ipcRenderer.on('connector', (_, res) => cb(res));
  },
  ready() {
    ipcRenderer.send('electron', 'ready');
  },
  reload() {
    ipcRenderer.send('electron', 'reload');
  },
  restart() {
    ipcRenderer.send('electron', 'restart');
  },
  returnInput(key, val) {
    ipcRenderer.send(key, val);
  },
});
