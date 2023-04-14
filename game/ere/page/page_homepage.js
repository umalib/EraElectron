const era = require('../era-electron');

module.exports = async () => {
  let flagHomepage = true;
  const printPageHeader = require('./page_header');
  const recruitRand = require('./page_recruit_rand');

  while (flagHomepage) {
    era.clear();

    printPageHeader();

    let chara_cur_inter = era.get('flag:当前互动角色');

    if (!chara_cur_inter) {
      era.println();
      era.printButton('[100] 当前无互动对象，点击从队伍列表中选择', 100);
      era.println();
    } else {
      era.print(
        `${era.get(`name:${era.get('flag:当前互动角色')}:-1`)} 的状态：`,
      );
      era.printButton('[100] 更换互动对象', 100);

      era.print('体力 ');
    }

    era.drawLine();
    era.printButton('[101] 招募新成员', 101);

    let ret = await era.input(); //TODO: add rule

    switch (Number(ret)) {
      case 101:
        await recruitRand();
        break;
    }

    await era.waitAnyKey();
  }
};
