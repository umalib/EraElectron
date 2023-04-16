const era = require('../../era-electron');

module.exports = (chara_id, extra_flag) => {
  const { recruitFlags } = require('../../data/const.json');
  era.log(
    `recruit ${era.get('callname:' + chara_id + ':-2')}, flag=${extra_flag}`,
  );
  switch (extra_flag) {
    case recruitFlags['fail']:
      break;
    default:
      era.set(`cflag:${chara_id}:招募状态`, 1);
      break;
  }
};
