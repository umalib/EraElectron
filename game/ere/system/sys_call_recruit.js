module.exports = (ind_target, extra_flag) => {
  const { existsSync } = require('fs');
  if (existsSync(`../event/recruit/rec_${ind_target}.js`)) {
    require(`../event/recruit/rec_${ind_target}`)(extra_flag);
  } else {
    require('../event/recruit/rec_common')(ind_target, extra_flag);
  }
};
