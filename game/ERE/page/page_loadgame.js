const era = require('../era-electron');

module.exports = async () => {
  let flagLoadGame = true;
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
    era.print('要从哪个栏位读取？');

    for (let ind = 0; ind < 10; ind++) {
      let comm_disp = era.get(`global:saveComments:${ind}`);
      let slot_avail = true;

      if (!comm_disp) {
        comm_disp = '空存档栏位';
        slot_avail = false;
      }
      era.printButton(`[${ind}] ${comm_disp}`, ind); //TODO: add button config: disable
    }

    era.drawLine();
    era.printButton('[99]返回上一级', 99, { align:'right' });

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
        }
        break;
    }
  }
}