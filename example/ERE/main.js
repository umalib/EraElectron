const era = require('./era-electron.js');

era.log('era init');

era.clear();

era.setAlign('center');
era.drawLine();
era.print('ERAUMA 测试');
era.drawLine();

era.button('[0] 开始新游戏', 0);
era.button('[1] 加载存档', 1);
era.button('[2] 自建角色', 2);
era.button('[3] 帮助说明', 3);
era.drawLine();
