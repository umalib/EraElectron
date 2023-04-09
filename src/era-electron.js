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

  async function inputAny() {
    print('按任意键继续……', {
      p: false,
      align: 'left',
    });
    await input();
  }

  function log(info) {
    connect({ action: 'log', data: info });
  }

  function print(str, config) {
    connect({ action: 'print', data: { content: str, config: config || {} } });
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
      // const files = readdirSync(join(path, './ERE'));
      // if (files.filter((x) => x === 'main.js').length === 0) {
      //   error('找不到入口脚本！');
      //   return;
      // }
      // const inputMatch = /era.input\(/;
      // files
      //   .filter((x) => x !== 'main.js' && x !== 'era-electron.js')
      //   .forEach((script) => {
      //     let code = readFileSync(join(path, `./ERE/${script}`)).toString(
      //       'utf-8',
      //     );
      //     code = code.replace(
      //       /(const|var|let)?\s+\S+\s*=\s*require\s*\(\s*['|"](.\/)?era-electron(\.js)?['|"];?\s*\)\s*;/g,
      //       '',
      //     );
      //     if (inputMatch.exec(code) !== null) {
      //       code = code.replace(/era\.input\(/g, 'await era.input(');
      //     }
      //   });

      try {
        let gameMain;
        let eraModule;

        // clear cache, load game main and find era
        eval(`Object.keys(require.cache)
          .filter(x => x.startsWith('${path}'))
          .forEach(x => delete require.cache[x]);
        gameMain = require('${join(path, './ERE/main.js')}');
        eraModule = require.cache[Object.keys(require.cache)
          .filter(x=>x.startsWith('${path}') && x.endsWith('era-electron.js'))]`);
        Object.keys(this.api).forEach(
          (k) => (eraModule.exports[k] = this.api[k]),
        );
        gameMain();
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
