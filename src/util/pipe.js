module.exports = (fn) => {
  return (val) => {
    return fn(val) ?? val;
  };
};
