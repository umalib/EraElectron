const {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} = require('fs');
const { dirname, extname, join, resolve } = require('path');
const parseCSV = require('@/era/csv-utils');
const {
  getNumber,
  safeUndefinedCheck,
  toLowerCase,
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
  function log(info, stack) {
    connect('log', { info, stack });
  }

  function error(message) {
    logger.error(message);
    connect('error', message);
  }

  let gamePath = resolve(path);
  let gameMain = () => {};
  let inputKey = undefined;
  let totalLines = 0;

  const era = {
    api: {},
    cache: {},
    data: {},
    debug: false,
    fieldNames: {},
    global: {},
    images: {},
    staticData: {},
  };

  function checkImageCache(_path) {
    if (!_path) {
      return '';
    }
    if (typeof _path !== 'string' || _path.startsWith('http')) {
      return _path.toString() || '';
    }
    if (!era.cache[_path]) {
      try {
        const base64str = readFileSync(_path, 'base64');
        era.cache[_path] = `data:image/${extname(_path).substring(
          1,
        )};base64,${base64str}`;
      } catch (_) {
        // eslint-disable-next-line no-empty
      }
    }
    return era.cache[_path];
  }

  function getImageObject(names) {
    if (!names || !names.length) {
      return [];
    }
    return names
      .map((n) => {
        if (era.images[n]) {
          return {
            src: checkImageCache(era.images[n].path),
            x: era.images[n].x,
            y: era.images[n].y,
            width: era.images[n].width,
            height: era.images[n].height,
            posX: era.images[n].posX,
            posY: era.images[n].posY,
          };
        }
      })
      .filter((x) => x);
  }

  era.api.add = (key, val) => {
    if (!val) {
      return era.api.get(key);
    }
    return era.api.set(key, val, true);
  };

  era.api.addCharacter = era.api.resetCharacter = (...ids) => {
    const result = ids.map((charaId) => {
      let src = charaId,
        dst = charaId;
      if (charaId.length === 2) {
        dst = charaId[0];
        src = charaId[1];
      } else if (typeof src !== 'number') {
        return false;
      }
      if (!era.staticData.chara[src]) {
        return false;
      }
      era.data.no[era.data.newCharaIndex++] = dst;
      era.data.maxbase[dst] = {};
      era.data.base[dst] = {};
      era.data.abl[dst] = {};
      era.data.talent[dst] = {};
      era.data.cflag[dst] = {};
      era.data.cstr[dst] = {};
      era.data.equip[dst] = {};
      era.data.mark[dst] = {};
      era.data.exp[dst] = {};
      era.data.juel[dst] = {};
      era.data.callname[dst] = {};
      era.data.relation[dst] = {};

      // init
      Object.entries(era.staticData.chara[src])
        .filter((kv) => typeof kv[1] === 'object')
        .forEach(
          /** @param {[string, {}]} kv */
          (kv) =>
            Object.entries(kv[1]).forEach(
              (kv1) => (era.data[kv[0]][dst][kv1[0]] = kv1[1]),
            ),
        );
      Object.entries(era.staticData)
        .filter(
          (kv) =>
            kv[0] !== 'chara' &&
            kv[0] !== 'relationship' &&
            kv[0] !== 'cstr' &&
            typeof era.data[kv[0]] === 'object' &&
            typeof era.data[kv[0]][0] === 'object',
        )
        .forEach(
          /** @param {[string, object]} kv */
          (kv) =>
            Object.entries(kv[1])
              .filter((kv1) => typeof kv1[1] !== 'object')
              .forEach((kv1) => {
                if (era.data[kv[0]][dst][kv1[1]] === undefined) {
                  era.data[kv[0]][dst][kv1[1]] = 0;
                }
              }),
        );
      Object.values(era.staticData.cstr).forEach(
        (v) => era.data.cstr[dst][v] || (era.data.cstr[dst][v] = ''),
      );
      era.data.callname[dst][-2] = era.data.callname[dst][-1] =
        era.staticData.chara[src].name;
      Object.entries(era.staticData.relationship).forEach((kv) =>
        Object.entries(kv[1])
          .filter(
            (kv1) => kv1[0].startsWith(`${dst}|`) || kv1[0].endsWith(`|${dst}`),
          )
          .forEach((kv1) => {
            const idArr = kv1[0].split('|');
            if (era.data[kv[0]][idArr[0]]) {
              era.data[kv[0]][idArr[0]][idArr[1]] = kv1[1];
            }
          }),
      );
      era.data.amour[dst] = 0;
      Object.keys(era.data.base[dst]).forEach(
        (k) => (era.data.maxbase[dst][k] = era.data.base[dst][k]),
      );
      return true;
    });
    if (ids.length === 1) {
      return result[0];
    }
    return result;
  };

  era.api.addCharacterForTrain = (...charaId) => {
    if (charaId) {
      charaId.forEach((id) => {
        era.data.tequip[id] = {};
        era.data.tcvar[id] = {};
        era.data.palam[id] = {};
        era.data.gotjuel[id] = {};
        era.data.stain[id] = {};
        era.data.ex[id] = {};
        era.data.nowex[id] = {};
        Object.values(era.staticData.tcvar).forEach(
          (v) => (era.data.tcvar[id][v] = 0),
        );
        Object.values(era.staticData.juel).forEach(
          (v) => (era.data.palam[id][v] = era.data.gotjuel[id][v] = 0),
        );
        Object.values(era.staticData.stain).forEach(
          (v) => (era.data.stain[id][v] = 0),
        );
        Object.values(era.staticData.ex).forEach(
          (v) => (era.data.ex[id][v] = era.data.nowex[id][v] = 0),
        );
      });
    }
  };

  era.api.beginTrain = (...charaId) => {
    era.data.tequip = {};
    era.data.tflag = {};
    era.data.tcvar = {};
    era.data.palam = {};
    era.data.gotjuel = {};
    era.data.stain = {};
    era.data.ex = {};
    era.data.nowex = {};

    Object.values(era.staticData.tflag).forEach((v) => (era.data.tflag[v] = 0));

    era.api.addCharacterForTrain(...charaId);
  };

  era.api.clear = (lineCount) => {
    if (lineCount && !isNaN(Number(lineCount))) {
      totalLines -= lineCount;
      if (totalLines < 0) {
        totalLines = 0;
      }
    } else {
      totalLines = 0;
    }
    connect('clear', lineCount);
    return totalLines;
  };

  era.api.drawLine = (config) => {
    connect('drawLine', {
      config: config || {},
    });
    return totalLines++;
  };

  era.api.endTrain = () => {
    delete era.data.tequip;
    delete era.data.tflag;
    delete era.data.tcvar;
    delete era.data.palam;
    delete era.data.gotjuel;
    delete era.data.stain;
    delete era.data.ex;
    delete era.data.nowex;
  };

  era.api.get = era.api.set = (key, val, isAdd) => {
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
            if (isAdd) {
              era.data.amour[valueIndex] += val;
            } else {
              era.data.amour[valueIndex] = val;
            }
          }
          return era.data.amour[valueIndex];
        }
        if (tableName === 'global') {
          valueIndex = safeUndefinedCheck(
            era.staticData.global[valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            if (isAdd) {
              era.global[valueIndex] += val;
            } else {
              era.global[valueIndex] = val;
            }
          }
          return era.global[valueIndex];
        }
        if (tableName === 'palamname') {
          return era.fieldNames.juel[valueIndex];
        }
        if (tableName.endsWith('name')) {
          tableName = tableName.substring(0, tableName.length - 4);
          if (era.fieldNames[tableName]) {
            return era.fieldNames[tableName][valueIndex];
          }
        } else if (era.data[tableName]) {
          valueIndex = safeUndefinedCheck(
            era.staticData[tableName][valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            if (isAdd) {
              era.data[tableName][valueIndex] += val;
            } else {
              era.data[tableName][valueIndex] = val;
            }
          }
          return era.data[tableName][valueIndex];
        }
        break;
      case 3:
        tableName = keyArr[0];
        charaIndex = keyArr[1];
        valueIndex = keyArr[2];
        if (tableName === 'callname') {
          if (!era.data.callname[charaIndex]) {
            return '-';
          }
          if (val !== undefined) {
            era.data.callname[charaIndex][valueIndex] = val;
          }
          return safeUndefinedCheck(
            era.data.callname[charaIndex][valueIndex],
            era.staticData.chara[charaIndex]
              ? era.staticData.chara[charaIndex].callname
              : '-',
          );
        }
        if (tableName === 'relation') {
          if (!era.data.relation[charaIndex]) {
            return undefined;
          }
          if (val !== undefined) {
            if (isAdd) {
              era.data.relation[charaIndex][valueIndex] += val;
            } else {
              era.data.relation[charaIndex][valueIndex] = val;
            }
          }
          return era.data.relation[charaIndex][valueIndex];
        }
        if (tableName === 'global') {
          if (!era.global[charaIndex]) {
            return undefined;
          }
          if (val !== undefined) {
            if (isAdd) {
              era.global[charaIndex][valueIndex] += val;
            } else {
              era.global[charaIndex][valueIndex] = val;
            }
          }
          return era.global[charaIndex][valueIndex];
        }
        if (tableName === 'base') {
          if (!era.data.base[charaIndex]) {
            return undefined;
          }
          valueIndex = safeUndefinedCheck(
            era.staticData.base[valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            if (isAdd) {
              era.data.base[charaIndex][valueIndex] += val;
            } else {
              era.data.base[charaIndex][valueIndex] = val;
            }
            if (
              era.data.base[charaIndex][valueIndex] >
              era.data.maxbase[charaIndex][valueIndex]
            )
              era.data.base[charaIndex][valueIndex] =
                era.data.maxbase[charaIndex][valueIndex];
          }
          return era.data.base[charaIndex][valueIndex];
        }
        if (tableName === 'maxbase') {
          if (!era.data.maxbase[charaIndex]) {
            return undefined;
          }
          valueIndex = safeUndefinedCheck(
            era.staticData.base[valueIndex],
            valueIndex,
          );
          if (val !== undefined) {
            if (isAdd) {
              era.data.maxbase[charaIndex][valueIndex] += val;
            } else {
              era.data.maxbase[charaIndex][valueIndex] = val;
            }
          }
          return era.data.maxbase[charaIndex][valueIndex];
        }
        if (tableName === 'staticbase') {
          if (!era.staticData.chara[charaIndex]) {
            return undefined;
          }
          valueIndex = safeUndefinedCheck(
            era.staticData.base[valueIndex],
            valueIndex,
          );
          return era.staticData.chara[charaIndex].base[valueIndex];
        }
        if (!era.data[tableName] || !era.data[tableName][charaIndex]) {
          return undefined;
        }
        if (tableName === 'palam' || tableName === 'gotjuel') {
          valueIndex = safeUndefinedCheck(
            era.staticData.juel[valueIndex],
            valueIndex,
          );
        } else if (tableName === 'nowex') {
          valueIndex = safeUndefinedCheck(
            era.staticData.ex[valueIndex],
            valueIndex,
          );
        } else {
          valueIndex = safeUndefinedCheck(
            era.staticData[tableName][valueIndex],
            valueIndex,
          );
        }
        if (val !== undefined) {
          if (isAdd) {
            era.data[tableName][charaIndex][valueIndex] += val;
          } else {
            era.data[tableName][charaIndex][valueIndex] = val;
          }
        }
        return era.data[tableName][charaIndex][valueIndex];
      default:
        break;
    }
    return undefined;
  };

  era.api.getAllCharacters = () => {
    return Object.keys(era.staticData.chara).map(Number);
  };

  era.api.getAddedCharacters = () => {
    return Object.keys(era.data.base).map(Number);
  };

  era.api.input = async (config) => {
    inputKey = new Date().getTime().toString();
    connect('input', { config: config || {}, inputKey });
    return new Promise((resolve) => {
      listen(inputKey, (_, ret) => {
        cleanListener(inputKey);
        inputKey = undefined;
        resolve(getNumber(ret));
      });
    });
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
          Object.entries(tmp)
            .filter((kv) => kv[0] !== 'version')
            .forEach((kv) => (era.global[kv[0]] = kv[1]));
          return true;
        }
      } catch (_) {
        // eslint-disable-next-line no-empty
      }
    }
    return era.api.resetGlobal();
  };

  era.api.log = log;
  era.api.log.debug = (info) => {
    if (era.debug) {
      log(
        info,
        new Error().stack.replace(
          /^\s*Error\s*at era\.api\.log\s*\([^)]+\)\s*/,
          '',
        ),
      );
    }
  };
  era.api.log.error = error;
  era.api.log.info = log;

  era.api.logData = () => {
    log({ data: era.data, global: era.global });
  };

  era.api.logStatic = () => {
    log({
      static: era.staticData,
      names: era.fieldNames,
      images: era.images,
    });
  };

  era.api.print = (content, config) => {
    connect('print', { content, config: config || {} });
    return totalLines++;
  };

  era.api.printAndWait = async (content, config) => {
    era.api.print(content, config);
    await era.api.waitAnyKey();
    return totalLines;
  };

  era.api.printButton = (content, accelerator, config) => {
    connect('printButton', {
      content,
      accelerator,
      config: config || {},
    });
    return totalLines++;
  };

  era.api.printDynamicText = (content, config, style) => {
    connect('printDynamicText', {
      content,
      config: config || {},
      style: style || {},
    });
    return totalLines++;
  };

  era.api.printImage = (...names) => {
    connect('printImage', {
      images: getImageObject(names),
    });
    return totalLines++;
  };

  era.api.printMultiColumns = (columnObjects, config) => {
    connect('printMultiCols', {
      columns: columnObjects.map((x) => {
        if (x.type === 'image') {
          return {
            type: 'image',
            images: getImageObject(x.names),
          };
        } else if (x.type === 'image.whole') {
          return {
            type: 'image.whole',
            src: checkImageCache(era.images[x.src]),
            config: x.config || {},
          };
        }
        return x;
      }),
      config: config || {},
    });
    return totalLines++;
  };

  era.api.printMultiRows = (...columnObjects) => {
    connect('printMultiRows', {
      columns: columnObjects.map((x) => {
        return {
          columns: x.columns.map((y) => {
            if (y.type === 'image') {
              return {
                type: 'image',
                images: getImageObject(y.names),
              };
            } else if (y.type === 'image.whole') {
              return {
                type: 'image.whole',
                src: checkImageCache(era.images[y.src]),
                config: y.config || {},
              };
            }
            return y;
          }),
          config: x.config || {},
        };
      }),
    });
    return totalLines++;
  };

  era.api.printProgress = (percentage, inContent, outContent, config) => {
    connect('printProgress', {
      config: config || {},
      inContent,
      outContent,
      percentage,
    });
    return totalLines++;
  };

  era.api.printWholeImage = (name, config) => {
    connect('printWholeImage', {
      config: config || {},
      src: checkImageCache(era.images[name]),
    });
    return totalLines++;
  };

  era.api.println = () => {
    connect('println');
    return totalLines++;
  };

  era.api.resetAllExceptGlobal = () => {
    Object.keys(era.data).forEach((tableName) => (era.data[tableName] = {}));
    return true;
  };

  era.api.resetData = () => {
    era.data = {
      abl: {},
      amour: {},
      base: {},
      callname: {},
      cflag: {},
      cstr: {},
      equip: {},
      exp: {},
      flag: {},
      juel: {},
      mark: {},
      maxbase: {},
      newCharaIndex: 0,
      no: {},
      relation: {},
      talent: {},
      version: era.staticData['gamebase'].version,
    };
  };

  era.api.resetGlobal = () => {
    era.global = {
      version: era.staticData['gamebase'].version,
      saves: {},
    };
    Object.values(era.staticData.global).forEach((k) => (era.global[k] = 0));
  };

  era.api.rmData = (savId) => {
    try {
      rmSync(join(join(gamePath, `./sav/save${savId}.sav`)));
      delete era.global.saves[savId];
      era.api.saveGlobal();
    } catch (e) {
      error(e.message);
      return false;
    }
    return true;
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

  era.api.setAlign = (textAlign) => {
    connect('setAlign', textAlign);
  };

  era.api.setDynamicStyle = (lineNumber, style) => {
    connect('setDynamicStyle', { lineNumber, style });
  };

  era.api.setGameBase = (_gamebase) => {
    connect('setGameBase', _gamebase);
  };

  era.api.setOffset = (offset) => {
    connect('setOffset', offset);
  };

  era.api.setTitle = (title) => {
    connect('setTitle', title);
  };

  era.api.setWidth = (width) => {
    connect('setWidth', width);
  };

  era.api.toggleDebug = () => {
    era.debug = !era.debug;
    return era.debug;
  };

  era.api.waitAnyKey = async () => {
    await era.api.input({ any: true, useRule: false });
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

  era.start = async () => {
    if (!existsSync(gamePath)) {
      era.api.print(`路径${gamePath}不正确！请选择待载入游戏文件夹！`);
      return;
    }
    // load CSV
    let fileList = {};
    era.cache = {};
    era.fieldNames = {};
    era.images = {};
    era.staticData = {
      relationship: {
        callname: {},
        relation: {},
      },
    };

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
    const charaReg = /chara[^/]+.csv/;
    // load _replace.csv
    Object.keys(fileList).forEach((x) => {
      if (x.endsWith('_replace.csv')) {
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
    // load normal csv
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
        let csv = parseCSV(readFileSync(p).toString('utf-8'));
        if (k.startsWith('_rename') || k.startsWith('gamebase')) {
          csv.forEach(
            (a) =>
              (era.staticData[k][
                nameMapping[k] ? nameMapping.gamebase[a[0]] : a[0].toLowerCase()
              ] = a[1]),
          );
        } else {
          csv = csv.map((a) => {
            return a.map(toLowerCase);
          });
          if (k.startsWith('palam')) {
            era.staticData.juel = {};
            era.fieldNames.juel = {};
            csv.forEach((a) => {
              let numKey = a[0],
                strKey = a[1];
              while (era.fieldNames.juel[numKey]) {
                numKey++;
              }
              era.staticData.juel[strKey] = numKey;
              era.fieldNames.juel[numKey] = strKey;
            });
          } else if (k.startsWith('item')) {
            era.staticData.item = { name: {}, price: {} };
            era.fieldNames[k] = {};
            csv.forEach((a) => {
              let numKey = a[0],
                strKey = a[1],
                val = a[2];
              while (era.fieldNames[k][numKey]) {
                numKey++;
              }
              era.staticData.item.name[strKey] = numKey;
              era.staticData.item.price[numKey] = val;
              era.fieldNames[k][numKey] = strKey;
            });
          } else {
            era.fieldNames[k] = {};
            csv.forEach((a) => {
              let numKey = a[0],
                strKey = a[1];
              while (era.fieldNames[k][numKey]) {
                numKey++;
              }
              era.staticData[k][strKey] = numKey;
              era.fieldNames[k][numKey] = strKey;
            });
          }
        }
      }
    });
    era.api.setGameBase(era.staticData['gamebase']);

    showInfo && era.api.print('\nloading chara files ...');
    era.staticData.chara = {};
    // load chara csv
    charaCSVList.forEach((p) => {
      const k = fileList[p];
      showInfo && era.api.print(`loading ${k}`);
      const tmp = {};
      let tableName, valueIndex, value;
      parseCSV(readFileSync(p).toString('utf-8')).forEach((a) => {
        a = a.map(toLowerCase);
        switch (a.length) {
          case 2:
            tableName = safeUndefinedCheck(nameMapping.chara[a[0]], a[0]);
            value = a[1];
            tmp[tableName] = value;
            break;
          case 3:
            tableName = safeUndefinedCheck(nameMapping.chara[a[0]], a[0]);
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
      if (tmp['id'] !== undefined) {
        if (!era.staticData.chara[tmp['id']]) {
          era.staticData.chara[tmp['id']] = tmp;
        } else {
          const charaTable = era.staticData.chara[tmp['id']];
          Object.keys(tmp).forEach((k) => {
            if (typeof tmp[k] === 'object') {
              if (!charaTable[k]) {
                charaTable[k] = tmp[k];
              } else {
                Object.keys(tmp[k]).forEach((k2) => {
                  charaTable[k][k2] = tmp[k][k2];
                });
              }
            } else {
              charaTable[k] = tmp[k];
            }
          });
        }
      }
    });

    // load resource csv
    fileList = {};
    loadPath(join(gamePath, './resources'));
    Object.keys(fileList).forEach((_path) => {
      const parent = dirname(_path);
      parseCSV(readFileSync(_path).toString('utf-8')).forEach((a) => {
        switch (a.length) {
          case 2:
            era.images[toLowerCase(a[0])] = join(parent, a[1]);
            break;
          case 4:
            break;
          case 6:
            era.images[toLowerCase(a[0])] = {
              path: join(parent, a[1]),
              x: a[2] || 0,
              y: a[3] || 0,
              width: a[4],
              height: a[5],
              posX: 0,
              posY: 0,
            };
            break;
          case 8:
            era.images[toLowerCase(a[0])] = {
              path: join(parent, a[1]),
              x: a[2] || 0,
              y: a[3] || 0,
              width: a[4],
              height: a[5],
              posX: a[6],
              posY: a[7],
            };
            break;
          case 9:
            break;
        }
      });
    });

    if (isDevelopment) {
      era.api.logStatic();
    }

    // load ere
    let eraModule;
    try {
      showInfo && era.api.print(`\nloading game: ${gamePath} ...`);

      const module = require('module');
      const include = module.prototype.require;
      const erePath = join(gamePath, 'ere');
      module.prototype.require = function (path) {
        let dir = path;
        if (path[0] === '.') {
          return include.call(this, path);
        }
        if (path[0] === '#') {
          dir = `${erePath}${path.substring(1)}`;
        }
        return include.call(this, dir);
      };

      // clear cache, load game, and find era module
      eval(`Object.keys(require.cache)
        .filter(x => x.startsWith('${gamePath}'))
        .forEach(x => delete require.cache[x]);
      gameMain = require('#/main');
      eraModule = require.cache[Object.keys(require.cache)
        .filter(x => x.startsWith('${gamePath.replace(
          /\\/g,
          '\\\\',
        )}') && x.endsWith('era-electron.js'))];`);

      // inject era.api
      Object.keys(era.api).forEach((k) => (eraModule.exports[k] = era.api[k]));
      await era.api.printAndWait('\n加载完成');
    } catch (e) {
      error(e.message);
    }

    era.restart();
  };

  if (isDevelopment) {
    era.debug = true;
    logger.debug(Object.keys(era.api).sort());
  }

  return era;
};
