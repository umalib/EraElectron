
module.exports = (ind_targ, extra_flag) => {
  require(`../event/recruit/rec_${ind_targ}`)(extra_flag);
}