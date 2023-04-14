const era = require('./era-electron');

module.exports = async () => {
  let flagTitle = true;

  while (flagTitle) {
    era.clear();

    era.setAlign('center');
    era.drawLine();
    era.print('ERAUMA 测试');
    era.print('Takatoshi');
    era.drawLine();

    era.printButton('[0] 开始新游戏', 0);
    era.printButton('[1] 加载存档', 1);
    era.printButton('[2] 自建角色', 2);
    era.printButton('[3] 帮助说明', 3);
    era.drawLine();

    era.setAlign('left');

    let ret = await era.input({ rule: '[0-3]' });
    switch (Number(ret)) {
      case 0:
        await require('./page/page_newgame')();
        break;
      case 1:
        await require('./page/page_loadgame')();
        break;
      case 2:
        break;
      case 3:
      default:
        break;
    }
  }
};
