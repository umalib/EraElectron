function parseNumber(num) {
  const ret = Number(num);
  if (isNaN(ret)) {
    return num;
  }
  return ret;
}

module.exports = (csv) => {
  const toParsed = csv.replace(/\s*;[^\n]*/g, '');
  const ret = [];
  for (const line of toParsed.split('\n')) {
    const arr = line
      .split(',')
      .map((x) => parseNumber(x.replace(/(^\s+|\s+$)/, '')));
    if (arr.length > 1) {
      ret.push(arr);
    }
  }
  return ret;
};
