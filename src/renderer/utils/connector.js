const registry = {};

export default {
  ready() {
    window['ipc'].listen((res) => {
      try {
        registry[res.action](res.data);
      } catch (e) {
        console.log(res);
      }
    });
    window['ipc'].ready();
  },
  register(action, handler) {
    registry[action] = handler;
  },
};
