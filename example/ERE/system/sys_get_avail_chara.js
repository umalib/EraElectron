const era = require('../era-electron');

/*
  command：
    'RandomRecruit'：返回一个可被随机招募的角色


*/
module.exports = (command) => {
  let ind = -1;
  if (command == 'RandomRecruit') {
    let flagRecruitSingle = true;

    let list_all = era.getAllCharacters();
    let list_cur = era.getAddedCharacters();
    let list_filter_recr = require('./sys_filter_chara')('cflag', '招募状态', 0); //未招募
    let list_filter_rand = require('./sys_filter_chara')('cflag', '随机招募', 1); //可被随机招募

    let list_filter_comb = list_filter_recr.concat(list_filter_rand.filter((item) => list_filter_recr.indexOf(item) < 0)); 
    list_all = list_all.filter((item) => !list_filter_comb.includes(item)); //从全角色列表中筛出

    if (list_all.length == 0) { //已无可选角色
      flagRecruitSingle = false;
    }


    while (flagRecruitSingle) {
      let tmp_ind = list_all[Math.floor( Math.random() * list_all.length )] //可行列表中的index随机获取一个
        
      if (!list_cur.includes(tmp_ind)) { //若该index的角色未加载则进行加载
        era.addCharacter(tmp_ind);
      }
      ind = tmp_ind;
    }
    return ind;
  }
}