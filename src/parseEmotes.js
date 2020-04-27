const emoji = require('./discordEmoji');

const emoteRegex = /<img src="images\/emotes\/([^.]*).(png|gif)" ?\/>/g;

function parseMessageEmotes(message) {
  //images are displayed to the web browser as <img src="images/emotes/Disturbed_Burger_Pants.png" />
  const parsedMessage = message.replace(emoteRegex, (match, $1) => {
    const emote = $1.replace(/\\/g, '');
    return emoji[emote] || `:${emote}:`;
  });
  // console.log(parsedMessage);
  return parsedMessage;
}

module.exports = parseMessageEmotes;
