const registry = {};

export default {
  ready() {
    window['ipc'].listen((res) => {
      try {
        registry[res.action](res.data);
      } catch (e) {
        console.log(res);
        console.log(e.message);
      }
    });
    this.reload();
  },
  register(action, handler) {
    registry[action] = handler;
  },
  registerMenu(cb) {
    window['ipc'].registerMenu(cb);
  },
  reload() {
    window['ipc'].load();
  },
  restart() {
    window['ipc'].restart();
  },
  returnInput(key, val) {
    window['ipc'].returnInput(key, val);
  },
};
