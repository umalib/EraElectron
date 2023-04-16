const era = require('../era-electron');

/*
  command：
    'RandomRecruit'：返回一个可被随机招募的角色
*/
module.exports = (command) => {
  const { recruitCommands } = require('../data/const.json');

  let flagRecruitList, aimFunc, list_avail;
  switch (command) {
    case recruitCommands['RandomRecruit']:
      flagRecruitList = true;
      aimFunc = require('./sys_filter_chara');
      while (flagRecruitList) {
        let list_all = era.getAllCharacters();
        let list_cur = era.getAddedCharacters();

        let list_filter_recr = aimFunc('cflag', '招募状态', 0); //未招募
        let list_filter_rand = aimFunc('cflag', '随机招募', 1); //可被随机招募

        let list_unadd = list_all.filter((item) => !list_cur.includes(item)); //未激活的角色表

        //自激活角色列表中筛出
        list_avail = list_cur.filter((item) => list_filter_recr.includes(item));
        list_avail = list_avail.filter((item) =>
          list_filter_rand.includes(item),
        );

        //可行列表足够长或无可添加角色则停止加长可行列表
        if (list_avail.length > 9 || list_unadd.length === 0) {
          flagRecruitList = false;
        } else {
          //否则从未激活列表中添加角色以试图加长可行列表
          let tmp_ind =
            list_unadd[Math.floor(Math.random() * list_unadd.length)];
          era.addCharacter(tmp_ind);
        }
      }

      //若可行列表中无角色则返回-1
      if (list_avail.length === 0) {
        return -1;
      } else {
        //否则从可行列表中随机返回一个index
        return list_avail[Math.floor(Math.random() * list_avail.length)];
      }
    default:
      return -1;
  }
};
