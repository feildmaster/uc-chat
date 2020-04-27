const Entities = require('html-entities').AllHtmlEntities;
const parseMessageEmotes = require('./parseEmotes');

const entities = new Entities();
const specialCharacters = /([`|*~]|^>)/g;

function getMessage({ user, message, me }) {
  let safeMessage = entities.decode(parseMessageEmotes(message.replace(/_/g, '\\_')))
    .replace(/:[\w\d]+(?:\\_[\w\d]+)+:/g, (match) => match.)
    .replace(specialCharacters, '\\$1');
  if (me) {
    safeMessage = `*${safeMessage}*`;
  }
  return {
    message: safeMessage,
    username: entities.decode(user.username),
  };
}

module.exports = getMessage;
