// https://undercards.net/images/emotes/NAME.EXT
const firebase = require('./firebase');
const stats = require('./stats');

const emoji = {};
const popular = stats.counters('emoji');
const missing = stats.counters('emojiMissing');
const missingGif = stats.counters('emojiMissingAnimated');

function add({ key, id, name, animated }) {
  if (!id) return;
  emoji[key] = `<${animated?'a':''}:${name || key.substring(0, key.indexOf('.'))}:${id}>`;
  emoji[id] = true;
  popular.get(key); // Add entry to popularity list
  const list = animated ? missingGif : missing;
  if (list.has(key)) {
    list.remove(key);
  }
}

function hook(data) {
  const key = data.key;
  const {
    id,
    name,
    animated = key.endsWith('_gif'),
  } = data.val() || {};

  const index = key.lastIndexOf('_');

  add({
    key: `${key.substring(0, index)}.${key.substring(index + 1)}`,
    id,
    name,
    animated,
  });
}

const ref = firebase.database().ref('config/undercards/emoji');

ref.on('child_added', hook);
ref.on('child_changed', hook);
// Delete, somehow
ref.on('child_removed', (data) => {
  const key = data.key;
  const {
    id,
    name,
    animated = key.endsWith('_gif'),
  } = data.val() || {};

  const index = key.lastIndexOf('_');
  const fixedKey = `${key.substring(0, index)}.${key.substring(index + 1)}`;

  delete emoji[fixedKey];
  delete emoji[id];
});

module.exports = emoji;
