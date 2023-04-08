const era = require('./era-electron.js');

era.log('era init');

let titleFlag = true;

while (titleFlag) {
  era.clear();

  era.setAlign('center');
  era.drawLine();
  era.print('ERAUMA 测试');
  era.print('Takatoshi');
  era.drawLine();

  era.printButton('[0] 开始新游戏', 0, true);
  era.printButton('[1] 加载存档', 1);
  era.printButton('[2] 自建角色', 2);
  era.printButton('[3] 帮助说明', 3);
  era.drawLine();

  let ret = era.input('[0-3]');
  era.print(ret);
  ret = era.input();
}
