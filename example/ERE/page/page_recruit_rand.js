const era = require('../era-electron');

module.exports = async () => {
  let flagRecruitRand = true;

  while (flagRecruitRand) {
    era.clear();
    require('./page_header')();

    era.drawLine();
    era.print('招募？');
    era.drawLine();

    for (let ind = 0; ind < 3; ind++) {
      let index = require('../system/sys_get_avail_chara')('RandomRecruit');

      if (index != -1) {
        era.printButton(`[${index}]${era.get(`callname:${index}:-1`)}`);
      }

    }



    await era.waitAnyKey();
  }
}