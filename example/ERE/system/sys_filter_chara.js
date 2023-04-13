const era = require('../era-electron');

//返回以table:index:key 的值等同于 value 的角色index array

module.exports = (table, key, value) => {
  let list_cur = era.getAddedCharacters();

  if (value) {
    return list_cur.filter((item) => (era.get(`${table}:${item}:${key}`) == value));
  } else {
    return list_cur.filter((item) => (!era.get(`${table}:${item}:${key}`)));
  }
}