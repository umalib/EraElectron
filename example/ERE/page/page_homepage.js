const era = require('../era-electron');

module.exports = async () => {
  let flagHomepage = true;

  while (flagHomepage){
    era.clear();

    require('./page_header')();

    let chara_cur_inter = era.get('flag:当前互动角色');

    if (!chara_cur_inter) {
      era.print('\n');
      era.printButton('[100]当前无互动对象，点击从队伍列表中选择', 100);
      era.print('\n');
    } else {
      era.print(era.get( 'name:'+ era.get('flag:当前互动角色') + ':-1') + ' 的状态：')
      era.printButton('[100]更换互动对象', 100);

      era.print('体力 ');

    }

    era.drawLine();
    era.printButton('[101]招募新成员',101);

    let ret = await era.input();

    switch (Number(ret)) {
      case 101:
        await require('./page_recruit_rand')();
        break;
    }


    await era.waitAnyKey();
  }
}