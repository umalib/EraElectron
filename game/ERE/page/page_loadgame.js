const era = require('../era-electron');

/**
 * load game
 * @return {Promise<boolean>} if true, tell main.js to call homepage
 */
module.exports = async () => {
  let flagLoadGame = true;
  let msgNotification = '';

  while (flagLoadGame) {
    era.clear();
    require('./page_header')();

    if (!msgNotification) {
      era.drawLine();
      era.print(msgNotification);
      era.drawLine();
    }

    era.drawLine();
    era.print('要从哪个栏位读取？');

    for (let ind = 0; ind < 11; ind++) {
      let comm_disp = era.get(`global:saves:${ind}`);
      let slot_unavail = false;

      if (!comm_disp) {
        comm_disp = '空存档栏位';
        slot_unavail = true;
      }
      era.printButton(`[${ind}] ${comm_disp}`, ind, { disabled: slot_unavail });
    }

    era.drawLine();
    era.printButton('[99] 返回上一级', 99, { align: 'right' });

    let ret = await era.input({ rule: '[0-9]|99' });

    switch (ret) {
      case 99:
        flagLoadGame = false;
        break;
      default:
        if (!era.loadData(ret)) {
          msgNotification = `未能成功读取 ${ret} 号栏位的存档`;
        } else {
          flagLoadGame = false;
          era.loadGlobal();
          return true;
        }
        break;
    }
  }
};
