const simpleParse = ['chatMessage', 'history', 'me', 'friends', 'listId'];

function parser(key, value) {
  if (simpleParse.includes(key)) {
    return JSON.parse(value);
  } else if (key === 'message' && typeof value === 'string') {
    try {
      const temp = JSON.parse(value);
      if (temp.args) {
        return JSON.parse(temp.args);
      }
      return temp;
    } catch {}
  }
  return value;
}

module.exports = (stringData = '') => JSON.parse(stringData, parser);
