const era = require('../era-electron');

module.exports = async () => {
  const filtCharacter = require('../system/sys_filter_chara');
  era.clear();
  require('./page_header')();

  era.print('要与哪个角色互动？');

  let list_team = filtCharacter('cflag', '招募状态', 1);

  let list_disp = [];
  let input_rule = '|998|999|'

  for (let p = 0; p < list_team.length; p++) {
    let ind = list_team[p];
    let block_chara = {
      content: `[${ind}] ${era.get(`callname:${ind}:-1`)}`,
      type: 'button',
      config: { width: 6 },
    }

    list_disp.push(block_chara);
    input_rule += `${ind}|`;
  }

  era.printMultiColumns(list_disp);
  input_rule = input_rule.slice(1, -1);

  era.drawLine();

  era.printMultiColumns(
    [
      {
        content: '[998]清空互动对象',
        type: 'button',
        accelerator: 998,
        config: { width: 6, align: 'right'},
      },
      {
        content: '[999]返回上一级',
        type: 'button',
        accelerator: 999,
        config: { width: 6, align: 'right'},
      },
    ],
    { horizontalAlign: 'end' },
  );

  let ret = await era.input( {rule: input_rule} );

  switch (Number(ret)) {
    case 998:
      era.set('flag:当前互动角色', 0);
      break;
    case 999:
      break;
    default:
      era.set('flag:当前互动角色', ret);
      break;
  }
};
