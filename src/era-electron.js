const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = (path, connect, listen, cleanListener) => {
  function clear() {
    connect({ action: 'clear' });
  }

  function drawLine() {
    connect({ action: 'drawLine' });
  }

  function error(message) {
    connect({ action: 'error', data: message });
  }

  let inputKey = undefined;
  async function input(rule) {
    inputKey = new Date().getTime().toString();
    connect({ action: 'input', data: { rule, inputKey } });
    return new Promise((resolve) => {
      listen(inputKey, (_, ret) => {
        cleanListener(inputKey);
        inputKey = undefined;
        resolve(ret);
      });
    });
  }

  function log(info) {
    connect({ action: 'log', data: info });
  }

  function print(str, isParagraph) {
    connect({ action: 'print', data: { content: str, isParagraph } });
  }

  function printButton(str, num, isButton) {
    connect({
      action: 'printButton',
      data: {
        str,
        num,
        isButton,
      },
    });
  }

  function println() {
    connect({ action: 'println' });
  }

  function setAlign(align) {
    connect({ action: 'setAlign', data: align });
  }

  return {
    api: {
      __unused() {},
      clear,
      drawLine,
      input,
      log,
      print,
      printButton,
      println,
      setAlign,
    },
    data: {},
    start() {
      const era = this.api;
      era.__unused();

      let code = readFileSync(join(path, './ERE/main.js')).toString('utf-8');
      code = code.replace(
        /(const|var|let)?\s+\S+\s*=\s*require\s*\(\s*['|"](.\/)?era-electron(\.js)?['|"];?\s*\)\s*;/g,
        '',
      );
      code = `async function task(){${code.replace(
        /era\.input\(/g,
        'await era.input(',
      )}}\ntask().then()`;
      try {
        eval(code);
      } catch (e) {
        error(e.message);
      }
    },
    restart() {
      if (!inputKey) {
        cleanListener(inputKey);
      }
      this.start();
    },
  };
};
