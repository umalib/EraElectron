const era = require('../era-electron');
const { recruitCommands } = require('../data/const.json');

module.exports = async () => {
  let flagRecruitRand = true;
  const getAvailableChara = require('../system/sys_get_avail_chara');

  while (flagRecruitRand) {
    era.clear();
    require('./page_header')();

    era.drawLine();
    era.print('招募？');
    era.drawLine();

    for (let ind = 0; ind < 3; ind++) {
      let index = getAvailableChara(recruitCommands['RandomRecruit']);

      if (index !== -1) {
        era.printButton(`[${index}] ${era.get(`callname:${index}:-1`)}`, index);
      }
    }

    await era.waitAnyKey();
  }
};
