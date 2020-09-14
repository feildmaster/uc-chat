module.exports = (truthy, fn) => {
  return (val) => {
    if (truthy) return fn(val);
    return val;
  };
};
