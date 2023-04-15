const era = require('../era-electron');

module.exports = async () => {

  let flagDebug = true;
  let msg = '';
  while (flagDebug) {
    era.clear()
    if (msg) {
      era.print(msg);
    }
    let list_team = require('../system/sys_filter_chara')('cflag', '招募状态', 1);
    let list_acti = era.getAddedCharacters();
    era.drawLine();
    era.print(`当前队伍:${list_team}`);
    era.print('招募？');

    era.printButton('[999] 返回', 999);

    let ret = await era.input();

    switch (Number(ret)) {
      case 999:
        flagDebug = false;
        break;
      default:
        if (list_team.includes(ret)) {
          msg = `Error: ${ret} 号角色 ${era.get(`callname:${ret}:-1`)} 已在队伍中`;
        } else {
          if (!list_acti.includes(ret)) {
            era.addCharacter(ret);
          }
          era.set(`cflag:${ret}:招募状态`, 1);
          msg = `已招募 ${ret} 号角色 ${era.get(`callname:${ret}:-1`)}`
        }
        break;
    }
  }

  
}