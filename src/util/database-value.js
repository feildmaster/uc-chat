const firebase = require('../firebase');

module.exports = (ref, {
  def,
} = {}) => {
  let value = def;
  let loaded = false;
  const off = firebase.database().ref(ref).on('value', (snap) => {
    const val = snap.val();
    loaded = true;
    if (val) value = val;
    else value = def;
  });

  return {
    value() {
      return value;
    },
    close() {
      off();
    },
    wait() {
      if (loaded) return Promise.resolve(value);
      return new Promise((res) => {
        res(value);
      })
    },
  };
};
