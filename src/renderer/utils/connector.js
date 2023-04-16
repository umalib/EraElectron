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
    window['ipc'].load();
  },
  register(action, handler) {
    registry[action] = handler;
  },
  registerMenu(cb) {
    window['ipc'].registerMenu(cb);
  },
  restart() {
    window['ipc'].restart();
  },
  returnInput(key, val) {
    window['ipc'].returnInput(key, val);
  },
};
