module.exports = {
  safeUndefinedCheck(_value, _default) {
    if (_value === undefined) {
      return _default;
    }
    return _value;
  },
};
