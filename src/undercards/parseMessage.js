const simpleParse = ['chatMessage', 'history', 'me', 'friends', 'listId'];

function parser(key, value) {
  if (simpleParse.includes(key)) {
    return JSON.parse(value);
  } else if (key === 'message') {
    return JSON.parse(JSON.parse(value).args);
  }
  return value;
}

module.exports = (stringData = '') => JSON.parse(stringData, parser);
