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
      era.printButton('[100] 查看队伍列表', 100, { align: 'right' });
      era.print('未选择互动对象', { align: 'center' });
      era.println();
    } else {
      era.printMultiColumns([
        {
          content: `${era.get(`callname:${chara_cur_inter}:-1`)} :`,
          type: 'text',
          config: { width: 18 },
        },
        {
          content: '[100] 查看队伍列表',
          type: 'button',
          accelerator: 100,
          config: { width: 6, align: 'right' },
        },
      ]);
      era.print('体力 ');
    }

    era.drawLine();
    era.printButton('[101] 招募新成员', 101);
    era.printMultiColumns([
      {
        content: '[900] 保存进度',
        type: 'button',
        accelerator: 900,
        config: { width: 6 },
      },
      {
        content: '[901] 加载存档',
        type: 'button',
        accelerator: 901,
        config: { width: 6 },
      },
    ]);

    let ret = await era.input(); //TODO: add rule

    switch (Number(ret)) {
      case 100:
        await require('./page_select_target')();
        break;
      case 101:
        await recruitRand();
        break;
      case 900:
        await require('./page_savegame')();
        break;
      case 901:
        await require('./page_loadgame')();
        break;
    }
  }
};
