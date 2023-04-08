const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('test', {
  flag: 1,
});

contextBridge.exposeInMainWorld('ipc', {
  listen(cb) {
    ipcRenderer.on('connector', (_, res) => cb(res));
  },
  ready() {
    ipcRenderer.send('electron', false);
  },
  reload() {
    ipcRenderer.send('electron', true);
  },
  returnInput(key, val) {
    ipcRenderer.send(key, val);
  },
});
