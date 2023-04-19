const {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} = require('fs');
const { join, resolve } = require('path');
const parseCSV = require('@/era/csv-utils');
const {
  getNumber,
  safeUndefinedCheck,
} = require('@/renderer/utils/value-utils');

const nameMapping = require('@/era/nameMapping.json');

module.exports = (
  path,
  connect,
  listen,
  cleanListener,
  logger,
  isDevelopment,
) => {
  let gamePath = resolve(path);

  function clear() {
    connect({ action: 'clear' });
  }

  function drawLine(config) {
    connect({
      action: 'drawLine',
      data: {
        config: config || {},
      },
    });
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
        resolve(getNumber(ret));
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
        if (tableName === 'callname') {
          if (val !== undefined) {
            era.data[tableName][charaIndex][valueIndex] = val;
          }
          return safeUndefinedCheck(
            era.data.callname[charaIndex][valueIndex],
            era.staticData.chara[charaIndex].callname,
          );
        }
        if (tableName === 'relation') {
          if (val !== undefined) {
            era.data.relation[charaIndex][valueIndex] = val;
          }
          return era.data.relation[charaIndex][valueIndex];
        }
        if (tableName === 'global') {
          if (!era[tableName][charaIndex]) {
            return undefined;
          }
          if (val !== undefined) {
            era[tableName][charaIndex][valueIndex] = val;
          }
          return era[tableName][charaIndex][valueIndex];
        }
        if (tableName === 'maxbase') {
          valueIndex = safeUndefinedCheck(
            era.staticData.base[valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            era.data[tableName][charaIndex][valueIndex] = val;
          }
          return era.data[tableName][charaIndex][valueIndex];
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
    const savDirPath = join(gamePath, './sav');
    if (!existsSync(savDirPath)) {
      mkdirSync(savDirPath);
    }
    try {
      writeFileSync(
        join(savDirPath, `./save${savId}.sav`),
        JSON.stringify(era.data),
      );
      era.global.saves[savId] = comment;
      era.api.saveGlobal();
      return true;
    } catch (e) {
      error(e.message);
      return false;
    }
  };

  era.api.loadData = (savId) => {
    const savPath = join(gamePath, `./sav/save${savId}.sav`);
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

  era.api.resetData = () => {
    era.data = {
      version: era.staticData['gamebase'].version,
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
  };

  era.api.saveGlobal = () => {
    const savDirPath = join(gamePath, './sav');
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
    const globalPath = join(gamePath, './sav/global.sav');
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
    era.global = {
      version: era.staticData['gamebase'].version,
      saves: {},
    };
    Object.values(era.staticData.global).forEach((k) => (era.global[k] = 0));
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
    return Object.keys(era.staticData.chara).map(Number);
  };

  era.api.getAddedCharacters = () => {
    return Object.keys(era.data.base).map(Number);
  };

  era.restart = () => {
    if (!gameMain) {
      era.api.print(`路径${gamePath}不正确！请选择待载入游戏文件夹！`);
      return;
    }
    if (!inputKey) {
      cleanListener(inputKey);
    }
    era.api.resetData();
    era.api.loadGlobal();

    try {
      gameMain();
    } catch (e) {
      error(e.message);
    }
  };

  era.setPath = (_path) => {
    gamePath = resolve(_path);
  };

  const charaReg = /chara[^/]+.csv/;
  era.start = async () => {
    if (!existsSync(gamePath)) {
      era.api.print(`路径${gamePath}不正确！请选择待载入游戏文件夹！`);
      return;
    }
    // load CSV
    const fileList = {};

    function loadPath(_path) {
      const l = readdirSync(_path);
      l.forEach((f) => {
        const filePath = join(_path, `./${f}`).toLowerCase();
        if (statSync(filePath).isDirectory()) {
          loadPath(filePath);
        } else if (filePath.endsWith('.csv')) {
          fileList[filePath] = f.replace(/\..*$/, '');
        }
      });
    }

    era.api.clear();

    const csvPath = join(gamePath, './csv');
    existsSync(csvPath) && statSync(csvPath).isDirectory() && loadPath(csvPath);
    if (Object.keys(fileList).length === 0) {
      era.api.print(`文件夹${csvPath}不存在！游戏数据载入失败！`);
      return;
    }
    const normalCSVList = [],
      charaCSVList = [];
    Object.keys(fileList).forEach((x) => {
      if (x.indexOf('_replace.csv') !== -1) {
        const csv = parseCSV(readFileSync(x).toString('utf-8'));
        era.staticData['_replace'] = {};
        csv.forEach(
          (a) =>
            (era.staticData['_replace'][
              nameMapping['_replace'][a[0]]
                ? nameMapping['_replace'][a[0]]
                : a[0]
            ] = a[1]),
        );
      } else if (charaReg.test(x)) {
        charaCSVList.push(x);
      } else {
        normalCSVList.push(x);
      }
    });
    let showInfo = true;
    if (era.staticData['_replace']['briefInformationOnLoading']) {
      era.api.print(era.staticData['_replace']['briefInformationOnLoading']);
      showInfo = false;
    }
    showInfo && era.api.print('loading csv files ...');
    normalCSVList.forEach((p) => {
      const k = fileList[p].toLowerCase();
      if (
        !k.startsWith('variablesize') &&
        !k.startsWith('str') &&
        !k.startsWith('strname')
      ) {
        showInfo && era.api.print(`loading ${k}`);
        era.staticData[k] = {};
        const csv = parseCSV(readFileSync(p).toString('utf-8'));
        if (k.startsWith('_rename') || k.startsWith('gamebase')) {
          csv.forEach(
            (a) =>
              (era.staticData[k][
                nameMapping[k] ? nameMapping.gamebase[a[0]] : a[0].toLowerCase()
              ] = a[1]),
          );
        } else if (k.startsWith('item')) {
          era.staticData.item = { name: {}, price: {} };
          era.fieldNames = {};
          csv.forEach((a) => {
            era.staticData.item.name[a[1]] = a[0];
            era.staticData.item.price[a[0]] = a[2];
            era.fieldNames[a[0]] = a[1];
          });
        } else {
          era.fieldNames[k] = {};
          csv.forEach((a) => {
            era.staticData[k][a[1]] = a[0];
            era.fieldNames[k][a[0]] = a[1];
          });
        }
      }
    });
    setGameBase(era.staticData['gamebase']);

    showInfo && era.api.print('\nloading chara files ...');
    era.staticData.chara = {};
    charaCSVList.forEach((p) => {
      const k = fileList[p];
      showInfo && era.api.print(`loading ${k}`);
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
              era.staticData.relationship[tableName][
                `${tmp['id']}|${valueIndex}`
              ] = value;
            } else {
              valueIndex = safeUndefinedCheck(
                era.staticData[tableName][valueIndex],
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
      era.staticData.chara[tmp['id']] = tmp;
    });

    log({
      static: era.staticData,
      names: era.fieldNames,
    });

    // load ere
    let eraModule;
    try {
      const gameMainPath = join(gamePath, './ere/main.js').replace(
        /\\/g,
        '\\\\',
      );
      showInfo && era.api.print(`\nloading game: ${gamePath} ...`);

      // clear cache, load game, and find era module
      eval(`Object.keys(require.cache)
        .filter(x => x.startsWith('${gamePath}'))
        .forEach(x => delete require.cache[x]);
      gameMain = require('${gameMainPath}');
      eraModule = require.cache[Object.keys(require.cache)
        .filter(x => x.startsWith('${gamePath.replace(
          /\\/g,
          '\\\\',
        )}') && x.endsWith('era-electron.js'))]`);

      // inject era.api
      Object.keys(era.api).forEach((k) => (eraModule.exports[k] = era.api[k]));
      await era.api.printAndWait('\n加载完成');
    } catch (e) {
      error(e.message);
    }

    era.restart();
  };

  if (isDevelopment) {
    era.api.logData = () => {
      log({ data: era.data, global: era.global });
    };
    era.api.log = (msg) => {
      log(msg);
    };
  }

  logger.debug(Object.keys(era.api));

  return era;
};
