const { getNumber } = require('@/renderer/utils/value-utils');

module.exports = (csv) => {
  const toParsed = csv.replace(/\s*;[^\n]*/g, '');
  const ret = [];
  for (const line of toParsed.split('\n')) {
    const arr = line
      .split(',')
      .map((x) => getNumber(x.toLowerCase().replace(/(^\s+|\s+$)/, '')));
    if (arr.length > 1) {
      ret.push(arr);
    }
  }
  return ret;
};
