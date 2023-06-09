const { gzip } = require('compressing');
const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} = require('fs');
const { dirname, extname, join, resolve } = require('path');
const { tmpdir } = require('os');

const parseCSV = require('@/era/csv-utils');
const {
  getNumber,
  safeUndefinedCheck,
  toLowerCase,
} = require('@/renderer/utils/value-utils');

const nameMapping = require('@/era/name-mapping.json');

/**
 * @param {string} path game path
 * @param {function} connect callback
 * @param {function} listen callback
 * @param {function} cleanListener callback
 * @param {function} resizeWindow callback
 * @param {function} configPath callback
 * @param {{debug:function,error:function,info:function}} logger logger
 * @param {boolean} isDevelopment
 * @returns {{api: {}, cache: {}, images: {}, debug: boolean, data: {}, fieldNames: {}, global: {}, staticData: {},
 * config: {[system]: {_replace: boolean, saveCompressedData: boolean},
 * [window]: {autoMax: boolean, height: number, width: number}},
 * [restart]: function, [setPath]: function, [start]: function}}
 */
module.exports = (
  path,
  connect,
  listen,
  cleanListener,
  resizeWindow,
  configPath,
  logger,
  isDevelopment,
) => {
  function log(info, stack) {
    connect('log', { info, stack });
  }

  function error(message, stack) {
    logger.error(`${message}${stack ? `\n${stack}` : ''}`);
    connect('error', { message, stack });
  }

  let gamePath = resolve(path),
    oldPath = 'old-path',
    gameMain = () => {};
  let inputKey = undefined,
    totalLines = 0;

  const era = {
    api: {},
    cache: {},
    config: {},
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
        const altImages = n.split('\t');
        for (const img of altImages) {
          if (era.images[img]) {
            return {
              src: checkImageCache(era.images[img].path),
              x: era.images[img].x,
              y: era.images[img].y,
              width: era.images[img].width,
              height: era.images[img].height,
              posX: era.images[img].posX,
              posY: era.images[img].posY,
            };
          }
        }
      })
      .filter((x) => x);
  }

  function getWholeImageFromCache(name) {
    if (!name) {
      return '';
    }
    const altImages = name.split('\t');
    for (const img of altImages) {
      if (era.images[img]) {
        return checkImageCache(era.images[img]);
      }
    }
    return '';
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
      era.config.system['extendedCharaTables'] &&
        era.config.system['extendedCharaTables'].length &&
        era.config.system['extendedCharaTables'].forEach(
          (table) => (era.data[table.toLowerCase()][dst] = {}),
        );

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
    if (charaId.length) {
      charaId
        .filter((id) => !era.data.tequip[id])
        .forEach((id) => {
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
    if (!era.data.tequip) {
      era.data.tequip = {};
      era.data.tflag = {};
      era.data.tcvar = {};
      era.data.palam = {};
      era.data.gotjuel = {};
      era.data.stain = {};
      era.data.ex = {};
      era.data.nowex = {};

      Object.values(era.staticData.tflag).forEach(
        (v) => (era.data.tflag[v] = 0),
      );
    }
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
      case 1:
        tableName = keyArr[0];
        if (tableName === 'no') {
          return era.data.no;
        }
        break;
      case 2:
        tableName = keyArr[0];
        valueIndex = keyArr[1];
        switch (tableName) {
          case 'amour':
            if (val !== undefined) {
              if (isAdd) {
                era.data.amour[valueIndex] += val;
              } else {
                era.data.amour[valueIndex] = val;
              }
            }
            return era.data.amour[valueIndex];
          case 'global':
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
          case 'palamname':
            return era.fieldNames.juel[valueIndex];
          default:
            if (tableName.endsWith('name')) {
              tableName = tableName.substring(0, tableName.length - 4);
              if (era.fieldNames[tableName]) {
                return era.fieldNames[tableName][valueIndex];
              }
            } else if (tableName.startsWith('item')) {
              if (valueIndex === 'bought') {
                return safeUndefinedCheck(
                  era.staticData.item.name[era.data.item.bought],
                  era.data.item.bought,
                );
              }
              valueIndex = safeUndefinedCheck(
                era.staticData.item.name[valueIndex],
                valueIndex,
              );
              switch (tableName.substring(4)) {
                case 'price':
                  tableName = 'price';
                  break;
                case 'sales':
                  tableName = 'sales';
                  break;
                default:
                  tableName = 'hold';
              }
              if (val !== undefined) {
                if (isAdd) {
                  era.data.item[tableName][valueIndex] += val;
                } else {
                  era.data.item[tableName][valueIndex] = val;
                }
              }
              return era.data.item[tableName][valueIndex];
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
        }
        break;
      case 3:
        tableName = keyArr[0];
        charaIndex = keyArr[1];
        valueIndex = keyArr[2];
        switch (tableName) {
          case 'callname':
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
          case 'relation':
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
          case 'global':
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
          case 'base':
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
              if (era.data.maxbase[charaIndex][valueIndex]) {
                if (era.data.base[charaIndex][valueIndex] < 0) {
                  era.data.base[charaIndex][valueIndex] = 0;
                }
                if (
                  era.data.base[charaIndex][valueIndex] >
                  era.data.maxbase[charaIndex][valueIndex]
                ) {
                  era.data.base[charaIndex][valueIndex] =
                    era.data.maxbase[charaIndex][valueIndex];
                }
              }
            }
            return era.data.base[charaIndex][valueIndex];
          case 'maxbase':
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
          default:
            if (tableName.startsWith('static')) {
              tableName = tableName.substring(6);
              if (
                !era.staticData.chara[charaIndex] ||
                !era.staticData[tableName]
              ) {
                return undefined;
              }
              valueIndex = safeUndefinedCheck(
                era.staticData[tableName][valueIndex],
                valueIndex,
              );
              return era.staticData.chara[charaIndex][tableName][valueIndex];
            }
            if (!era.data[tableName] || !era.data[tableName][charaIndex]) {
              return undefined;
            }
            switch (tableName) {
              case 'palam':
              case 'gotjuel':
                valueIndex = safeUndefinedCheck(
                  era.staticData.juel[valueIndex],
                  valueIndex,
                );
                break;
              case 'nowex':
                valueIndex = safeUndefinedCheck(
                  era.staticData.ex[valueIndex],
                  valueIndex,
                );
                break;
              default:
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
        }
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

  era.api.getCharactersInTrain = () => {
    if (!era.data.tequip) {
      return [];
    }
    return Object.keys(era.data.tequip).map(Number);
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

  era.api.loadData = async (savId) => {
    const savPath = join(gamePath, `./sav/save${savId}.sav`);
    try {
      let tmp;
      if (era.config.system['saveCompressedData']) {
        const tmpPath = join(tmpdir(), `ere-${new Date().getTime()}`);
        await gzip.uncompress(savPath, tmpPath);
        tmp = JSON.parse(readFileSync(tmpPath, 'utf-8'));
        rmSync(tmpPath);
      } else {
        tmp = JSON.parse(readFileSync(savPath, 'utf-8'));
      }
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
        const tmp = JSON.parse(readFileSync(globalPath, 'utf-8'));
        if (
          !tmp.version ||
          tmp.version < era.staticData['gamebase']['lowestVersion']
        ) {
          error(`global.sav版本过低（${tmp.version}）！已重新生成`);
        } else {
          era.global = tmp;
          era.global.version = era.staticData['gamebase']['version'];
          Object.values(era.staticData.global).forEach(
            (k) => !era.global[k] && (era.global[k] = 0),
          );
          return era.api.saveGlobal();
        }
      } catch (_) {
        // eslint-disable-next-line no-empty
      }
    }
    return era.api.resetGlobal();
  };

  era.api.log = log;

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

  era.api.logger = {
    debug(info) {
      if (era.debug) {
        log(info, new Error().stack.split('\n')[2]);
      }
    },
    error,
    info: log,
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

  era.api.printInColRows = (...columnObjects) => {
    connect('printInColRows', {
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
                src: getWholeImageFromCache(y.src),
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
      src: getWholeImageFromCache(name),
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
      item: {
        bought: -1,
        hold: {},
        price: {},
        sales: {},
      },
      juel: {},
      mark: {},
      maxbase: {},
      newCharaIndex: 0,
      no: [],
      relation: {},
      talent: {},
      version: era.staticData['gamebase'].version,
    };
    Object.values(era.staticData.flag).forEach(
      (num) => (era.data.flag[num] = 0),
    );
    era.staticData.item &&
      Object.values(era.staticData.item.name).forEach((num) => {
        era.data.item.hold[num] = 0;
        era.data.item.sales[num] = 0;
        era.data.item.price[num] = era.staticData.item.price[num];
      });
    era.config.system['extendedCharaTables'] &&
      era.config.system['extendedCharaTables'].length &&
      era.config.system['extendedCharaTables'].forEach(
        (v) => (era.data[v.toLowerCase()] = {}),
      );
  };

  era.api.resetGlobal = () => {
    era.global = {
      saves: {},
      version: era.staticData['gamebase'].version,
    };
    Object.values(era.staticData.global).forEach((k) => (era.global[k] = 0));
    return era.api.saveGlobal();
  };

  era.api.rmData = (savId) => {
    try {
      rmSync(join(join(gamePath, `./sav/save${savId}.sav`)));
      delete era.global.saves[savId];
      era.api.saveGlobal();
    } catch (e) {
      error(e.message, e.stack);
      return false;
    }
    return true;
  };

  era.api.saveData = async (savId, comment) => {
    const savDirPath = join(gamePath, './sav');
    if (!existsSync(savDirPath)) {
      mkdirSync(savDirPath);
    }
    try {
      const data = JSON.stringify(era.data),
        dataPath = join(savDirPath, `./save${savId}.sav`);
      if (era.config.system['saveCompressedData']) {
        await gzip.compressFile(Buffer.from(data, 'utf-8'), dataPath);
      } else {
        writeFileSync(dataPath, data);
      }
      era.global.saves[savId] = comment;
      era.api.saveGlobal();
      return true;
    } catch (e) {
      error(e.message, e.stack);
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
      error(e.message, e.stack);
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
    configPath(dirname(oldPath));

    try {
      gameMain();
    } catch (e) {
      error(e.message, e.stack);
    }
  };

  era.setPath = (_path) => {
    gamePath = resolve(_path);
  };

  const module = require('module');
  const include = module.prototype.require;

  era.start = async () => {
    if (!existsSync(gamePath)) {
      era.api.print(`路径${gamePath}不正确！请选择待载入游戏文件夹！`);
      return;
    }

    // load config file
    if (!existsSync(join(gamePath, './ere.config.json'))) {
      if (existsSync(join(gamePath, './csv/_config.json'))) {
        try {
          JSON.parse(
            readFileSync(join(gamePath, './csv/_config.json'), 'utf-8'),
          );
          copyFileSync(
            join(gamePath, './csv/_config.json'),
            join(gamePath, './ere.config.json'),
          );
        } catch (_) {
          // eslint-disable-next-line no-empty
        }
      } else {
        writeFileSync(join(gamePath, './ere.config.json'), JSON.stringify({}));
      }
    }
    era.config = JSON.parse(
      readFileSync(join(gamePath, './ere.config.json'), 'utf-8'),
    );
    if (existsSync(join(gamePath, './csv/_fixed.json'))) {
      try {
        const tmp = JSON.parse(
          readFileSync(join(gamePath, './csv/_fixed.json'), 'utf-8'),
        );
        Object.entries(tmp).forEach(
          /** @param {[string, any]} kv */
          (kv) => {
            if (typeof kv[1] === 'object') {
              Object.entries(kv[1]).forEach((kv1) => {
                if (!era.config[kv[0]]) {
                  era.config[kv[0]] = {};
                }
                era.config[kv[0]][kv1[0]] = kv1[1];
              });
            } else {
              era.config[kv[0]] = kv[1];
            }
          },
        );
        writeFileSync(
          join(gamePath, './ere.config.json'),
          JSON.stringify(era.config),
        );
      } catch (e) {
        error(e.message, e.stack);
      }
    }
    resizeWindow();

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
      if (x.endsWith('_replace.csv') && era.config.system._replace) {
        const csv = parseCSV(readFileSync(x, 'utf-8'));
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
    if (
      era.staticData['_replace'] &&
      era.staticData['_replace']['briefInformationOnLoading']
    ) {
      era.api.print(era.staticData['_replace']['briefInformationOnLoading']);
      showInfo = false;
    }
    // load normal csv
    showInfo && era.api.print('loading csv files ...');

    function generateUniqueKey(table, originKey, tableName, strKey) {
      let key = originKey;
      while (table[key]) {
        key++;
      }
      if (originKey !== key) {
        log(
          `[WARNING (ENGINE)]\n\tduplicate key in ${tableName}.csv! index ${originKey} of ${strKey} has been allocated to ${table[originKey]}! reset to ${key}`,
        );
      }
      return key;
    }

    normalCSVList.forEach((p) => {
      const k = fileList[p].toLowerCase();
      if (
        !k.startsWith('variablesize') &&
        !k.startsWith('str') &&
        !k.startsWith('strname')
      ) {
        showInfo && era.api.print(`loading ${k}`);
        era.staticData[k] = {};
        let csv = parseCSV(readFileSync(p, 'utf-8'));
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
              numKey = generateUniqueKey(
                era.fieldNames.juel,
                numKey,
                k,
                strKey,
              );
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
              numKey = generateUniqueKey(era.fieldNames[k], numKey, k, strKey);
              era.staticData.item.name[strKey] = numKey;
              era.staticData.item.price[numKey] = val;
              era.fieldNames[k][numKey] = strKey;
            });
          } else {
            era.fieldNames[k] = {};
            csv.forEach((a) => {
              let numKey = a[0],
                strKey = a[1];
              numKey = generateUniqueKey(era.fieldNames[k], numKey, k, strKey);
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
      parseCSV(readFileSync(p, 'utf-8')).forEach((a) => {
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
      parseCSV(readFileSync(_path, 'utf-8')).forEach((a, i) => {
        if (a[0] && era.images[toLowerCase(a[0])]) {
          log(
            `[WARNING (ENGINE)]\n\tduplicate key ${toLowerCase(a[0])} of line ${
              i + 1
            } in ${_path}!`,
          );
        }
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
          .filter(x => x.startsWith('${oldPath}'))
          .forEach(x => {
            logger.debug('delete cache: ' + x)
            delete require.cache[x];
          });
        gameMain = require('#/main');
        eraModule = Object.values(require.cache).filter(m => m.exports.isEra)[0];
        oldPath = dirname(Object.keys(require.cache).filter(x => x.endsWith('ere/main.js') || x.endsWith('ere\\\\main.js'))[0])`);
      logger.info(`load game from ${oldPath}`);

      if (eraModule) {
        // inject era.api
        Object.keys(era.api).forEach(
          (k) => (eraModule.exports[k] = era.api[k]),
        );
      }
      await era.api.printAndWait('\n加载完成');
    } catch (e) {
      error(e.message, e.stack);
    }

    era.restart();
  };

  if (isDevelopment) {
    era.debug = true;
    logger.debug(Object.keys(era.api).sort());
  }

  return era;
};
