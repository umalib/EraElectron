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
    window['ipc'].ready();
  },
  register(action, handler) {
    registry[action] = handler;
  },
  reload() {
    window['ipc'].reload();
  },
  restart() {
    window['ipc'].restart();
  },
  returnInput(key, val) {
    window['ipc'].returnInput(key, val);
  },
};
