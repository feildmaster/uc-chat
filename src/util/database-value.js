const firebase = require('../firebase');

module.exports = (ref, {
  def,
} = {}) => {
  let value = def;
  const off = firebase.database().ref(ref).on('value', (snap) => {
    const val = snap.val();
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
  };
};
