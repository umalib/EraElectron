const era = require('../era-electron');

module.exports = async () => {
  let flagRecruitRand = true;

  while (flagRecruitRand) {
    era.clear();
    require('./page_header')();

    era.drawLine();
    era.print('招募？\n')
    era.drawLine();

    for (ind = 0; ind < 1; ind++) {
      let ind = require('../system/sys_get_avail_chara')();

      era.printButton('[' + ind + ']' + era.get('name:'+ind+':-1'));
    }



    await era.waitAnyKey();
  }
}