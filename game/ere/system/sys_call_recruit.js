module.exports = (ind_target, extra_flag) => {
  require(`../event/recruit/rec_${ind_target}`)(extra_flag);
};
