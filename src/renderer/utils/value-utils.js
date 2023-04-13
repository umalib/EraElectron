module.exports = {
  getValidValue(val, lowest, highest, defVal) {
    const num = Number(val);
    if (isNaN(num) || num < lowest || num > highest) {
      return defVal;
    }
    return val;
  },
  safeUndefinedCheck(_value, _default) {
    if (_value === undefined) {
      return _default;
    }
    return _value;
  },
};
