const Entities = require('html-entities').AllHtmlEntities;
const parseMessageEmotes = require('./parseEmotes');

const entities = new Entities();
const specialCharacters = /([`|*~]|^>)/g;

function getMessage({ message, me }) {
  const safeMessage = entities.decode(parseMessageEmotes(message.replace('_', '\\_'))).replace(specialCharacters, '\\$1');
  if (me) {
    return `*${safeMessage}*`;
  }
  return safeMessage;
}

module.exports = getMessage;
