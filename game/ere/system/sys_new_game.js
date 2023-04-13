const era = require('../era-electron');

module.exports = (player_name, player_gender) => {
  era.loadGlobal();
  //era.resetAllExceptGlobal();

  era.addCharacter(0);
  era.set('callname:0:-1', player_name);
  era.set('callname:0:-2', '你');

  switch (player_gender) {
    case 0:
      era.set('cflag:0:阴茎尺寸', 0);
      break;
    case 1:
      era.set('cflag:0:罩杯尺寸', -1);
      break;
    default:
      player_gender = 10;
      break;
  }
  era.set('cflag:0:性别', player_gender);

  era.set('flag:当前回合数', 1);
  era.set('flag:当前年', 2000);
  era.set('flag:当前月', 1);
  era.set('flag:当前周', 1);

  era.set('flag:当前声望', era.get('global:初始声望增加量') + 100);
  era.set('flag:当前金币', era.get('global:初始金钱增加量') + 10000);
}