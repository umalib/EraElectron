const era = require('../era-electron');

module.exports = () => {
  era.setAlign('center');
  era.drawLine();

  let cur_year = era.get('flag:当前年');

  if (!cur_year) {
    era.print('\n当前未加载存档');
  } else {
    era.setAlign('left');
    let cur_month = era.get('flag:当前月');
    let cur_week = era.get('flag:当前周');

    let player_name = era.get('callname:0:-1');
    let cur_fame = era.get('flag:当前声望');
    let cur_coin = era.get('flag:当前金币');

    era.printMultiColumns(
      [
        { 
          content: `${cur_year} 年`,
          type: 'text',
          config: { 
            width: 6,
            align: 'right',
          },
        },
        {
          content: `${player_name}`,
          type: 'text',
          config: {
            width: 18,
            align: 'right',
          },
        },
      ],
      { align: 'center' },
    );
    era.printMultiColumns(
      [
        { 
          content: `${cur_month} 月`,
          type: 'text',
          config: { 
            width: 6,
            align: 'right',
          },
        },
        {
          content: `${cur_fame} 声望`,
          type: 'text',
          config: {
            width: 18,
            align: 'right',
          },
        },
      ],
      { align: 'center' },
    );
    era.printMultiColumns(
      [
        { 
          content: `第 ${cur_month} 周`,
          type: 'text',
          config: { 
            width: 6,
            align: 'right',
          },
        },
        {
          content: `${cur_coin} 金币`,
          type: 'text',
          config: {
            width: 18,
            align: 'right',
          },
        },
      ],
      { align: 'center' },
    );
  }
  era.drawLine();
  era.setAlign('left');
};
