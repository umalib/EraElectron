const era = require('../era-electron');

//返回以table:index:key 的值等同于 value 的角色index array

module.exports = (table, key, value) => {
  let list_cur = era.getAddedCharacters();
  let list_ret = [];

  for (let ind of list_cur) {
    if (era.get(`${table}:${ind}:${key}`) == value) {
      list_ret.push(ind);
    }
  }

  return list_ret;
}