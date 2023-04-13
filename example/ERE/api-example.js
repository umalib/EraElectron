const era = require('./era-electron');

module.exports = async function () {
  era.addCharacter(1);
  era.clear();
  era.clear(5);
  era.drawLine();
  let ret = 0;
  ret = era.get('maxbase:1:体力');
  ret = era.getAddedCharacters();
  ret = era.getAllCharacters();
  ret = await era.input('[0-3]');
  ret = era.load(1);
  era.loadGlobal();
  era.print('Hello world', {
    align: 'center',
    isParagraph: true,
    offset: 6,
    p: true,
    width: 12,
  });
  era.printButton('[0] 新的游戏', 0, {
    isButton: false,
    type: 'success',
    offset: 7,
    width: 10,
    align: 'right',
  });
  era.printProgress(50, '50/100', '100/100', {
    align: 'right',
    barRatio: 0.8,
    color: 'rgb(0,255,255)',
    fontColor: '#ff00ff',
    height: 20,
    offset: 8,
    width: 8,
  });
  era.resetAllExceptGlobal();
  era.resetCharacter(1);
  era.resetGlobal();
  era.save(1);
  era.saveGlobal();
  era.set('callname:2:1', '斯佩酱');
  era.setAlign('center');
  era.setOffset(5);
  era.setWidth(14);
  await era.waitAnyKey();

  console.log(ret);
};
