﻿const era = require('../era-electron');

module.exports = async () => {
  let flagSaveGame = true;
  let msgNotification = '';

  while (flagSaveGame) {
    era.clear();
    require('./page_header')();

    if (!msgNotification) {
      era.drawLine();
      era.print(msgNotification);
      era.drawLine();
    }

    era.drawLine();
    era.print('要保存至哪个栏位？');

    for (let ind = 0; ind < 10; ind++) {
      let comm_disp = era.get(`global:saveComments:${ind}`);
      if (!comm_disp) {
        comm_disp = '空存档栏位';
      }
      era.printButton(`[${ind}] ${comm_disp}`, ind);
    }

    era.drawLine();
    era.printButton('[99]返回上一级', 99, { align:'right' });

    let ret = await era.input({ rule: '[0-9]|99' });

    switch (ret) {
      case 99:
        flagSaveGame = false;
        break;
      default:
        let comment = `${era.get('callname:0:-1')} 于 ${new Date()} 保存的进度\n`;
        comment += `( ${era.get('flag:当前年')} 年, ${era.get('flag:当前月')} 月, 第 ${era.get('flag:当前周')} 周)`;
    
        if (era.saveData(ret, comment)) {
          msgNotification = `已成功保存至 ${ret} 号栏位`;
        }
        break;
    }
  }
}