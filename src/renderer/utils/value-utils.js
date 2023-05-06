module.exports = {
  getNumber(val) {
    const num = Number(val);
    if (isNaN(num)) {
      return val;
    }
    return num;
  },
  getValidValue(val, lowest, highest, defVal) {
    const num = Number(val);
    if (isNaN(num) || num < lowest || num > highest) {
      return defVal;
    }
    return num;
  },
  safeUndefinedCheck(_value, _default) {
    if (_value === undefined) {
      return _default;
    }
    return _value;
  },
  toLowerCase(val) {
    if (typeof val === 'string') {
      return val.toLowerCase();
    }
    return val;
  },
};
