module.exports = (connect) => {
  return {
    __unused() {},
    button(str, num, isButton) {
      connect({
        action: 'button',
        data: {
          str,
          num,
          isButton,
        },
      });
    },
    clear() {
      connect({ action: 'clear' });
    },
    drawLine() {
      connect({ action: 'drawLine' });
    },
    log(info) {
      connect({ action: 'log', data: info });
    },
    print(str, isParagraph) {
      connect({ action: 'print', data: { content: str, isParagraph } });
    },
    println() {
      connect({ action: 'println' });
    },
    setAlign(align) {
      connect({ action: 'setAlign', data: align });
    },
  };
};
