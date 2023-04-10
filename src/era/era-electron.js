const { readdirSync, readFileSync, statSync } = require('fs');
const { join } = require('path');
const parseCSV = require('@/era/csv-utils');

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
    print('输入任意键继续……', {
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
      inputAny,
      log,
      print,
      printButton,
      println,
      setAlign,
    },
    staticData: {},
    data: {},
    async start() {
      const _this = this;

      // load CSV
      function loadFile(_path, fileName, obj) {
        if (statSync(_path).isDirectory()) {
          obj[fileName] = {};
          readdirSync(_path).forEach((f) =>
            loadFile(join(_path, `./${f}`), f, obj[fileName]),
          );
        } else if (_path.endsWith('.csv') || _path.endsWith('.CSV')) {
          print(`loading ${fileName} ...`);
          const content = readFileSync(_path).toString('utf-8');
          obj[fileName.substring(0, fileName.length - 4)] = parseCSV(content);
        }
      }

      this.api.clear();
      const csvPath = join(path, './CSV');
      const fileList = readdirSync(csvPath);
      fileList.forEach((f) =>
        loadFile(join(csvPath, `./${f}`), f, _this.staticData),
      );

      // load ERE
      let gameMain;
      let eraModule;
      try {
        const gameMainPath = join(path, './ERE/main.js');
        print(`loading game from ${gameMainPath} ...`);
        // clear cache, load game, and inject era
        eval(`Object.keys(require.cache)
          .filter(x => x.startsWith('${path}'))
          .forEach(x => delete require.cache[x]);
        gameMain = require('${gameMainPath}');
        eraModule = require.cache[Object.keys(require.cache)
          .filter(x=>x.startsWith('${path}') && x.endsWith('era-electron.js'))]`);

        Object.keys(this.api).forEach(
          (k) => (eraModule.exports[k] = _this.api[k]),
        );
        await this.api.inputAny();
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
