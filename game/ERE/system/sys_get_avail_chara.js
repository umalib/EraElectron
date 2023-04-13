const era = require('../era-electron');

/*
  command：
    'RandomRecruit'：返回一个可被随机招募的角色


*/
module.exports = (command) => {
  let ind = -1;
  if (command == 'RandomRecruit') {
    let flagRecruitSingle = 0;

    while (flagRecruitSingle < 3) { //每轮调用最多抽3次
      let list_all = era.getAllCharacters();
      let list_cur = era.getAddedCharacters();

      let list_filter_recr = require('./sys_filter_chara')('cflag', '招募状态', 0); //未招募
      let list_filter_rand = require('./sys_filter_chara')('cflag', '随机招募', 1); //可被随机招募

      let list_unadd = list_all.filter((item) => !list_cur.includes(item)); //未激活的角色表

      let list_avail = list_cur.filter((item) => list_filter_recr.includes(item));
      list_avail = list_avail.filter((item) => list_filter_rand.includes(item)); //激活角色列表中筛出

      if (list_avail.length != 0) {
        ind = list_avail[Math.floor( Math.random() * list_avail.length )]; //从可行列表中抽选
        return ind;
      } else { //无可选角色
        if (list_unadd.length == 0) { //已添加所有角色
          return -1;
        } else {
          let tmp_ind = list_unadd[Math.floor( Math.random() * list_unadd.length )];
          era.addCharacter(tmp_ind);
        }
      }
      flagRecruitSingle += 1;
    }
  }
  return -1;
}