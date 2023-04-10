function parseNumber(num) {
  const ret = Number(num);
  if (isNaN(ret)) {
    return num;
  }
  return ret;
}

module.exports = (csv) => {
  const toParsed = csv.replace(/\s*;[^\n]*/g, '');
  const ret = {};
  for (const line of toParsed.split('\n')) {
    const arr = line.split(',');
    for (const index in arr) {
      arr[index] = arr[index].replace(/(^\s+|\s+$)/, '');
    }
    switch (arr.length) {
      case 2:
        ret[arr[0]] = parseNumber(arr[1]);
        break;
      case 3:
        if (!ret[arr[0]]) {
          ret[arr[0]] = {};
        }
        ret[arr[0]][arr[1]] = parseNumber(arr[2]);
        break;
      default:
        break;
    }
  }
  return ret;
};
