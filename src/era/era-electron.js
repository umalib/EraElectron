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

  function setTitle(title) {
    connect({ action: 'setTitle', data: title });
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
      setTitle,
    },
    staticData: {},
    data: {},
    async start() {
      // load CSV
      const fileList = {};
      function loadPath(_path) {
        const l = readdirSync(_path);
        l.forEach((f) => {
          const filePath = join(_path, `./${f}`);
          if (statSync(filePath).isDirectory()) {
            loadPath(filePath);
          } else if (filePath.toLocaleLowerCase().endsWith('.csv')) {
            fileList[filePath] = f.replace(/\..*$/, '');
          }
        });
      }
      loadPath(join(path, './csv'));

      this.api.clear();
      this.api.print('loading csv files ...');
      Object.keys(fileList)
        .filter((x) => x.toLocaleLowerCase().indexOf('chara') === -1)
        .forEach((p) => {
          const k = fileList[p].toLowerCase();
          if (!k.startsWith('variablesize')) {
            this.api.print(`loading ${k}`);
            this.staticData[k] = {};
            const csv = parseCSV(readFileSync(p).toString('utf-8'));
            if (
              k.startsWith('_rename') ||
              k.startsWith('_replace') ||
              k.startsWith('gamebase')
            ) {
              csv.forEach((a) => (this.staticData[k][a[0]] = a[1]));
            } else {
              csv.forEach((a) => (this.staticData[k][a[1]] = a[0]));
            }
          }
        });

      this.api.print('\nloading chara files ...');
      this.staticData.chara = {};
      Object.keys(fileList)
        .filter((x) => x.toLocaleLowerCase().indexOf('chara') !== -1)
        .forEach((p) => {
          const k = fileList[p];
          this.api.print(`loading ${k}`);
          const tmp = {};
          parseCSV(readFileSync(p).toString('utf-8')).forEach((a) => {
            switch (a.length) {
              case 2:
                tmp[a[0]] = a[1];
                break;
              case 3:
                if (!tmp[a[0]]) {
                  tmp[a[0]] = {};
                }
                tmp[a[0]][a[1]] = a[2];
                break;
              default:
                break;
            }
          });
          this.staticData.chara[tmp['番号']] = tmp;
        });
      this.api.setTitle(this.staticData['gamebase']['タイトル']);
      this.api.log(this.staticData);

      // load ERE
      let gameMain;
      let eraModule;
      try {
        const gameMainPath = join(path, './ERE/main.js');
        print(`\nloading game from ${gameMainPath} ...`);
        // clear cache, load game, and inject era
        eval(`Object.keys(require.cache)
          .filter(x => x.startsWith('${path}'))
          .forEach(x => delete require.cache[x]);
        gameMain = require('${gameMainPath}');
        eraModule = require.cache[Object.keys(require.cache)
          .filter(x => x.startsWith('${path}') && x.endsWith('era-electron.js'))]`);

        Object.keys(this.api).forEach(
          (k) => (eraModule.exports[k] = this.api[k]),
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
      this.start().then();
    },
  };
};
