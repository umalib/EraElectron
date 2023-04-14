const era = require('../era-electron');
const { recruitCommands } = require('../data/const.json');

module.exports = async () => {
  let flagRecruitRand = true;
  const getAvailableChara = require('../system/sys_get_avail_chara');
  const callRecruitEvent = require('../system/sys_call_recruit');
  
  era.set('flag:本回合已行动', 1);

  while (flagRecruitRand) {
    era.clear();
    require('./page_header')();

    era.drawLine();
    era.print('你在训练场内遇到了几位马娘，要试着招募谁呢？');
    era.drawLine();

    let today_list = [];
    let today_rule = '|999|';

    for (let ind = 0; ind < 3; ind++) {
      let index = getAvailableChara(recruitCommands['RandomRecruit']);

      if (index !== -1) {
        era.printButton(`[${index}] ${era.get(`callname:${index}:-1`)}`, index);
        today_list.push(index);
        today_rule += `${index}|`;
      }
    }

    era.drawLine();
    era.printButton('[999]直接离开');

    today_rule = today_rule.slice(1,-1);

    let ret = await era.input({ rule: today_rule });

    switch (Number(ret)) {
      case 4:
        //直接招募姥爷则直接触发招募失败事件
        callRecruitEvent(4, 'fail');
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

    await era.waitAnyKey();
  }
};
