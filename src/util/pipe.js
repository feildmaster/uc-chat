module.exports = (fn) => {
  return (val) => {
    const ret = fn(val);
    if (ret !== undefined) return ret;
    return val;
  };
};
