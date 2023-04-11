const {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} = require('fs');
const { join } = require('path');
const parseCSV = require('@/era/csv-utils');
const { safeUndefinedCheck } = require('@/era/value-utils');

const baseNameMap = require('@/era/base-name.json');

module.exports = (path, connect, listen, cleanListener, logger) => {
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

  async function input(config) {
    inputKey = new Date().getTime().toString();
    connect({ action: 'input', data: { config, inputKey } });
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

  function print(str, config) {
    connect({ action: 'print', data: { content: str, config: config || {} } });
  }

  function printButton(str, num, config) {
    connect({
      action: 'printButton',
      data: {
        str,
        num,
        config,
      },
    });
  }

  function println() {
    connect({ action: 'println' });
  }

  function setAlign(align) {
    connect({ action: 'setAlign', data: align });
  }

  function setOffset(offset) {
    connect({ action: 'setOffset', data: offset });
  }

  function setTitle(title) {
    connect({ action: 'setTitle', data: title });
  }

  function setWidth(width) {
    connect({ action: 'setWidth', data: width });
  }

  async function waitAnyKey() {
    print('按确定键继续……', {
      align: 'left',
    });
    await input({ any: true });
  }

  let gameMain = () => {};
  const era = {
    api: {
      clear,
      drawLine,
      input,
      log,
      print,
      printButton,
      println,
      setAlign,
      setOffset,
      setTitle,
      setWidth,
      waitAnyKey,
    },
    data: {
      abl: {},
      base: {},
      cflag: {},
      cstr: {},
      equip: {},
      exp: {},
      juel: {},
      mark: {},
      talent: {},
    },
    global: {},
    names: {},
    reload() {
      if (!inputKey) {
        cleanListener(inputKey);
      }
      this.start().then();
    },
    restart() {
      if (!inputKey) {
        cleanListener(inputKey);
      }
      gameMain();
    },
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

      this.api.clear();
      this.api.print('loading csv files ...');
      loadPath(join(path, './csv'));
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
              csv.forEach(
                (a) => (this.staticData[k][a[0].toLowerCase()] = a[1]),
              );
            } else if (k.startsWith('item')) {
              this.staticData.item = { name: {}, price: {} };
              this.names = {};
              csv.forEach((a) => {
                this.staticData.item.name[a[1]] = a[0];
                this.staticData.item.price[a[0]] = a[2];
                this.names[a[0]] = a[1];
              });
            } else {
              this.names[k] = {};
              csv.forEach((a) => {
                this.staticData[k][a[1]] = a[0];
                this.names[k][a[0]] = a[1];
              });
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
          let tableName, valueIndex, value;
          parseCSV(readFileSync(p).toString('utf-8')).forEach((a) => {
            switch (a.length) {
              case 2:
                tableName = a[0];
                value = a[1];
                tmp[tableName] = value;
                break;
              case 3:
                tableName = safeUndefinedCheck(
                  baseNameMap[a[0]],
                  a[0].toLowerCase(),
                );
                valueIndex = safeUndefinedCheck(
                  this.staticData[tableName][a[1]],
                  a[1],
                );
                value = a[2];
                if (!tmp[tableName]) {
                  tmp[tableName] = {};
                }
                tmp[tableName][valueIndex] = value;
                break;
              default:
                break;
            }
          });
          this.staticData.chara[tmp['番号']] = tmp;
        });

      this.api.setTitle(this.staticData['gamebase']['タイトル']);

      // load global
      const globalPath = join(path, './sav/global.sav');
      if (existsSync(globalPath)) {
        try {
          this.global = JSON.parse(readFileSync(globalPath).toString('utf-8'));
        } catch (_) {
          // eslint-disable-next-line no-empty
        }
      }

      this.api.log({
        static: this.staticData,
        names: this.names,
        data: this.data,
        global: this.global,
      });

      // load ERE
      let eraModule;
      try {
        const gameMainPath = join(path, './ERE/main.js').replace(/\\/g, '\\\\');
        print(`\nloading game: ${path} ...`);

        // clear cache, load game, and inject era
        eval(`Object.keys(require.cache)
                    .filter(x => x.startsWith('${path}'))
                    .forEach(x => delete require.cache[x]);
                gameMain = require('${gameMainPath}');
                eraModule = require.cache[Object.keys(require.cache)
                    .filter(x => x.startsWith('${path.replace(
                      /\\/g,
                      '\\\\',
                    )}') && x.endsWith('era-electron.js'))]`);

        Object.keys(this.api).forEach(
          (k) => (eraModule.exports[k] = this.api[k]),
        );
        await this.api.waitAnyKey();
        gameMain();
      } catch (e) {
        logger.error(e.message);
        error(e.message);
      }
    },
    staticData: {},
  };

  era.api.set = (key, val) => {
    const keyArr = key.split(':').map((x) => x.toLocaleLowerCase());
    let tableName, charaIndex, valueIndex;
    switch (keyArr.length) {
      case 2:
        tableName = keyArr[0];
        valueIndex = keyArr[1];
        if (tableName.endsWith('name')) {
          tableName = tableName.substring(0, tableName.length - 4);
          if (era.names[tableName]) {
            return era.names[tableName][valueIndex];
          }
        } else if (tableName === 'global') {
          if (val !== undefined) {
            era.global[valueIndex] = val;
          }
          return era.global[valueIndex];
        }
        break;
      case 3:
        tableName = keyArr[0];
        charaIndex = keyArr[1];
        valueIndex = keyArr[2];
        if (
          tableName.startsWith('maxbase') ||
          era.staticData.chara[charaIndex]
        ) {
          return era.staticData.chara[charaIndex]['base'][
            safeUndefinedCheck(era.staticData['base'][valueIndex], valueIndex)
          ];
        }
        if (era.data[tableName] && era.data[tableName][charaIndex]) {
          valueIndex = safeUndefinedCheck(
            era.staticData[tableName][valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            era.data[tableName][charaIndex][valueIndex] = val;
          }
          return era.data[tableName][charaIndex][valueIndex];
        }
        break;
      default:
        break;
    }
    return undefined;
  };

  era.api.get = (key) => {
    return era.api.set(key);
  };

  era.api.save = (savId) => {
    const savDirPath = join(path, './sav');
    if (!existsSync(savDirPath)) {
      mkdirSync(savDirPath);
    }
    try {
      writeFileSync(
        join(savDirPath, `./save${savId}.sav`),
        JSON.stringify(era.data),
      );
      writeFileSync(
        join(savDirPath, './global.sav'),
        JSON.stringify(era.global),
      );
      return true;
    } catch (e) {
      error(e.message);
      return false;
    }
  };

  era.api.load = (savId) => {
    const savPath = join(path, `./sav/save${savId}.sav`);
    try {
      era.data = JSON.parse(readFileSync(savPath).toString('utf-8'));
      return true;
    } catch (e) {
      error(e.message);
      return false;
    }
  };

  return era;
};
