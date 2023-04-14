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
const { safeUndefinedCheck } = require('@/renderer/utils/value-utils');

const nameMapping = require('@/era/nameMapping.json');

module.exports = (
  path,
  connect,
  listen,
  cleanListener,
  logger,
  isDevelopment,
) => {
  function clear() {
    connect({ action: 'clear' });
  }

  function drawLine() {
    connect({ action: 'drawLine' });
  }

  function error(message) {
    logger.error(message);
    connect({ action: 'error', data: message });
  }

  let inputKey = undefined;

  async function input(config) {
    inputKey = new Date().getTime().toString();
    connect({ action: 'input', data: { config: config || {}, inputKey } });
    return new Promise((resolve) => {
      listen(inputKey, (_, ret) => {
        cleanListener(inputKey);
        inputKey = undefined;
        resolve(ret);
      });
    });
  }

  function log(info) {
    if (isDevelopment) {
      connect({ action: 'log', data: info });
    } else {
      logger.info(info);
    }
  }

  function print(content, config) {
    connect({ action: 'print', data: { content, config: config || {} } });
  }

  async function printAndWait(content, config) {
    print(content, config);
    await waitAnyKey();
  }

  function printButton(content, accelerator, config) {
    connect({
      action: 'printButton',
      data: {
        content,
        accelerator,
        config: config || {},
      },
    });
  }

  function printMultiColumns(columnObjects, config) {
    connect({
      action: 'printMultiCols',
      data: {
        columns: columnObjects,
        config: config || {},
      },
    });
  }

  function printProgress(percentage, inContent, outContent, config) {
    connect({
      action: 'printProgress',
      data: {
        config: config || {},
        inContent,
        outContent,
        percentage,
      },
    });
  }

  function println() {
    connect({ action: 'println' });
  }

  function setAlign(textAlign) {
    connect({ action: 'setAlign', data: textAlign });
  }

  function setGameBase(_gamebase) {
    connect({ action: 'setGameBase', data: _gamebase });
  }

  // function setMaxHeight(height) {
  //   connect({ action: 'setMaxHeight', data: height });
  // }

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
      printAndWait,
      printButton,
      printMultiColumns,
      printProgress,
      println,
      setAlign,
      // setMaxHeight,
      setOffset,
      setTitle,
      setWidth,
      waitAnyKey,
    },
    data: {},
    fieldNames: {},
    global: {},
    resetData() {
      this.data = {
        version: this.staticData['gamebase'].version,
        abl: {},
        amour: {},
        base: {},
        maxbase: {},
        callname: {},
        cflag: {},
        cstr: {},
        equip: {},
        exp: {},
        flag: {},
        juel: {},
        mark: {},
        newCharaIndex: 0,
        no: {},
        relation: {},
        talent: {},
      };
    },
    restart() {
      if (!gameMain) {
        this.api.print(`路径${path}不正确！请选择待载入游戏文件夹！`);
        return;
      }
      if (!inputKey) {
        cleanListener(inputKey);
      }
      this.resetData();
      this.api.loadGlobal();

      try {
        gameMain();
      } catch (e) {
        error(e.message);
      }
    },
    async start() {
      if (!existsSync(path)) {
        this.api.print(`路径${path}不正确！请选择待载入游戏文件夹！`);
        return;
      }
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
      const csvPath = join(path, './csv');
      existsSync(csvPath) &&
        statSync(csvPath).isDirectory() &&
        loadPath(csvPath);
      if (Object.keys(fileList).length === 0) {
        this.api.print(`文件夹${csvPath}不存在！游戏数据载入失败！`);
        return;
      }
      Object.keys(fileList)
        .filter((x) => x.toLocaleLowerCase().indexOf('chara') === -1)
        .forEach((p) => {
          const k = fileList[p].toLowerCase();
          if (
            !k.startsWith('variablesize') &&
            !k.startsWith('str') &&
            !k.startsWith('strname')
          ) {
            this.api.print(`loading ${k}`);
            this.staticData[k] = {};
            const csv = parseCSV(readFileSync(p).toString('utf-8'));
            if (
              k.startsWith('_rename') ||
              k.startsWith('_replace') ||
              k.startsWith('gamebase')
            ) {
              csv.forEach(
                (a) =>
                  (this.staticData[k][
                    nameMapping[k]
                      ? nameMapping.gamebase[a[0]]
                      : a[0].toLowerCase()
                  ] = a[1]),
              );
            } else if (k.startsWith('item')) {
              this.staticData.item = { name: {}, price: {} };
              this.fieldNames = {};
              csv.forEach((a) => {
                this.staticData.item.name[a[1]] = a[0];
                this.staticData.item.price[a[0]] = a[2];
                this.fieldNames[a[0]] = a[1];
              });
            } else {
              this.fieldNames[k] = {};
              csv.forEach((a) => {
                this.staticData[k][a[1]] = a[0];
                this.fieldNames[k][a[0]] = a[1];
              });
            }
          }
        });
      setGameBase(this.staticData['gamebase']);

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
                tableName = safeUndefinedCheck(nameMapping.chara[a[0]], a[0]);
                value = a[1];
                tmp[tableName] = value;
                break;
              case 3:
                tableName = safeUndefinedCheck(
                  nameMapping.chara[a[0]],
                  a[0].toLowerCase(),
                );
                valueIndex = a[1];
                value = a[2];
                if (tableName === 'relation' || tableName === 'callname') {
                  this.staticData.relationship[tableName][
                    `${tmp['id']}|${valueIndex}`
                  ] = value;
                } else {
                  valueIndex = safeUndefinedCheck(
                    this.staticData[tableName][valueIndex],
                    a[1],
                  );
                  if (!tmp[tableName]) {
                    tmp[tableName] = {};
                  }
                  tmp[tableName][valueIndex] = value;
                }
                break;
              default:
                break;
            }
          });
          this.staticData.chara[tmp['id']] = tmp;
        });

      log({
        static: this.staticData,
        names: this.fieldNames,
      });

      // load ere
      let eraModule;
      try {
        const gameMainPath = join(path, './ere/main.js').replace(/\\/g, '\\\\');
        print(`\nloading game: ${path} ...`);

        // clear cache, load game, and find era module
        eval(`Object.keys(require.cache)
          .filter(x => x.startsWith('${path}'))
          .forEach(x => delete require.cache[x]);
        gameMain = require('${gameMainPath}');
        eraModule = require.cache[Object.keys(require.cache)
          .filter(x => x.startsWith('${path.replace(
            /\\/g,
            '\\\\',
          )}') && x.endsWith('era-electron.js'))]`);

        // inject era.api
        Object.keys(this.api).forEach(
          (k) => (eraModule.exports[k] = this.api[k]),
        );
        await this.api.waitAnyKey();
      } catch (e) {
        error(e.message);
      }
      this.restart();
    },
    staticData: {
      relationship: {
        callname: {},
        relation: {},
      },
    },
  };

  era.api.set = (key, val) => {
    if (!key) {
      return undefined;
    }
    const keyArr = key.split(':').map((x) => x.toLocaleLowerCase());
    let tableName, charaIndex, valueIndex;
    switch (keyArr.length) {
      case 2:
        tableName = keyArr[0];
        valueIndex = keyArr[1];
        if (tableName === 'amour') {
          if (val !== undefined) {
            era.data[tableName][valueIndex] = val;
          }
          return era.data[tableName][valueIndex];
        }
        if (tableName === 'global') {
          valueIndex = safeUndefinedCheck(
            era.staticData.global[valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            era.global[valueIndex] = val;
          }
          return era.global[valueIndex];
        }
        if (tableName.endsWith('name')) {
          tableName = tableName.substring(0, tableName.length - 4);
          if (era.fieldNames[tableName]) {
            return era.fieldNames[tableName][valueIndex];
          }
        } else {
          valueIndex = safeUndefinedCheck(
            era.staticData[tableName][valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            era.data[tableName][valueIndex] = val;
          }
          return era.data[tableName][valueIndex];
        }
        break;
      case 3:
        tableName = keyArr[0];
        charaIndex = keyArr[1];
        valueIndex = keyArr[2];
        if (tableName === 'callname' || tableName === 'relation') {
          if (val !== undefined) {
            era.data[tableName][charaIndex][valueIndex] = val;
          }
          return safeUndefinedCheck(
            era.data[tableName][charaIndex][valueIndex],
            era.staticData.chara[charaIndex][tableName],
          );
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

  era.api.saveData = (savId, comment) => {
    const savDirPath = join(path, './sav');
    if (!existsSync(savDirPath)) {
      mkdirSync(savDirPath);
    }
    try {
      writeFileSync(
        join(savDirPath, `./save${savId}.sav`),
        JSON.stringify(era.data),
      );
      if (!era.global.saveComments) {
        era.global.saveComments = {};
      }
      era.global.saveComments[savId] = comment;
      era.api.saveGlobal();
      return true;
    } catch (e) {
      error(e.message);
      return false;
    }
  };

  era.api.loadData = (savId) => {
    const savPath = join(path, `./sav/save${savId}.sav`);
    try {
      const tmp = JSON.parse(readFileSync(savPath).toString('utf-8'));
      if (
        !tmp.version ||
        tmp.version < era.staticData['gamebase']['lowestVersion']
      ) {
        error(`save${savId}.sav版本过低（${tmp.version}）！`);
      } else {
        era.data = tmp;
        return true;
      }
    } catch (e) {
      error(e.message);
    }
    return false;
  };

  era.api.saveGlobal = () => {
    const savDirPath = join(path, './sav');
    if (!existsSync(savDirPath)) {
      mkdirSync(savDirPath);
    }
    try {
      writeFileSync(
        join(savDirPath, './global.sav'),
        JSON.stringify(era.global),
      );
      return true;
    } catch (e) {
      error(e.message);
    }
    return false;
  };

  era.api.loadGlobal = () => {
    const globalPath = join(path, './sav/global.sav');
    if (existsSync(globalPath)) {
      try {
        const tmp = JSON.parse(readFileSync(globalPath).toString('utf-8'));
        if (
          !tmp.version ||
          tmp.version < era.staticData['gamebase']['lowestVersion']
        ) {
          error(`global.sav版本过低（${tmp.version}）！已重新生成`);
        } else {
          era.global = tmp;
          return true;
        }
      } catch (_) {
        // eslint-disable-next-line no-empty
      }
    }
    return era.api.resetGlobal();
  };

  era.api.resetGlobal = () => {
    era.global = { version: era.staticData['gamebase'].version };
    Object.values(era.staticData.global).forEach((k) => (era.global[k] = 0));
    return true;
  };

  era.api.resetAllExceptGlobal = () => {
    Object.keys(era.data).forEach((tableName) => (era.data[tableName] = {}));
    return true;
  };

  era.api.addCharacter = era.api.resetCharacter = (charaId) => {
    if (!era.staticData.chara[charaId]) {
      return;
    }
    era.data.no[era.data.newCharaIndex] = charaId;
    era.data.newCharaIndex++;
    era.data.maxbase[charaId] = {};
    era.data.base[charaId] = {};
    era.data.abl[charaId] = {};
    era.data.talent[charaId] = {};
    era.data.cflag[charaId] = {};
    era.data.cstr[charaId] = {};
    era.data.equip[charaId] = {};
    era.data.mark[charaId] = {};
    era.data.exp[charaId] = {};
    era.data.juel[charaId] = {};
    era.data.callname[charaId] = {};
    era.data.relation[charaId] = {};

    // init
    Object.keys(era.staticData.chara[charaId])
      .filter(
        (table) => typeof era.staticData.chara[charaId][table] === 'object',
      )
      .forEach((table) =>
        Object.keys(era.staticData.chara[charaId][table]).forEach(
          (k) =>
            (era.data[table][charaId][k] =
              era.staticData.chara[charaId][table][k]),
        ),
      );
    Object.keys(era.data.base[charaId]).forEach(
      (k) => (era.data.maxbase[charaId][k] = era.data.base[charaId][k]),
    );
    era.data.callname[charaId][-2] = era.data.callname[charaId][-1] =
      era.staticData.chara[charaId].name;
    ['relation', 'callname'].forEach((tableName) =>
      Object.keys(era.staticData.relationship[tableName])
        .filter((x) => x.startsWith(`${charaId}|`) || x.endsWith(`|${charaId}`))
        .forEach((ids) => {
          const idArr = ids.split('|');
          if (era.data[tableName][idArr[0]]) {
            era.data[tableName][idArr[0]][idArr[1]] =
              era.staticData.relationship[tableName][ids];
          }
        }),
    );
  };

  era.api.getAllCharacters = () => {
    return Object.keys(era.staticData.chara);
  };

  era.api.getAddedCharacters = () => {
    return Object.keys(era.data.base);
  };

  if (isDevelopment) {
    era.api.logData = () => {
      log(era.data);
    };
  }

  logger.debug(Object.keys(era.api));

  return era;
};
