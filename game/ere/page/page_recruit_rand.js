const era = require('../era-electron');
const { recruitCommands } = require('../data/const.json');

module.exports = async () => {
  let flagRecruitRand = true;
  const getAvailableChara = require('../system/sys_get_avail_chara');
  const callRecruitEvent = require('../system/sys_call_recruit');
  const { recruitFlags } = require('../data/const.json');

  era.set('flag:本回合已行动', 1);

  while (flagRecruitRand) {
    era.clear();
    require('./page_header')();

    era.print('你在训练场内遇到了几位马娘，要试着招募谁呢？');
    era.drawLine();

    let today_list = [];
    let today_disp = [];
    let today_rule = [999];

    //进行五次抽选
    for (let p = 0; p < 5; p++) {
      let index = getAvailableChara(recruitCommands['RandomRecruit']);

      if (index !== -1) {
        today_list.push(index);
      }
    }

    //去重 再录进输入的合法性检测 以及按钮输出
    today_list = today_list.filter(
      (item, index, l) => l.indexOf(item) === index,
    );
    today_list.sort((a, b) => a - b);

    era.print(`DEBUG: 连抽去重结果 ${today_list}`);

    for (let item of today_list) {
      today_rule.push(item);
      today_disp.push({
        content: `[${item}] ${era.get(`callname:${item}:-1`)}`,
        type: 'button',
        accelerator: item,
        config: { width: 6 },
      });
    }

    era.printMultiColumns(today_disp);

    era.drawLine();
    era.printButton('[999] 直接离开', 999);

    let ret = await era.input({ rule: `(${today_rule.join('|')})` });

    switch (Number(ret)) {
      case 4:
        //直接招募姥爷则直接触发招募失败事件
        callRecruitEvent(4, recruitFlags['fail']);
        break;
      case 999:
        //场内刷出姥爷的时候选择直接离开才正常触发招募事件
        if (today_list.includes(4)) {
          callRecruitEvent(4);
        }
        break;
      default:
        //其余可在场内刷出的角色则按普通流程
        callRecruitEvent(ret);
        break;
    }

    flagRecruitRand = false;
  }
};
