const emoji = require('./discordEmoji');
const stats = require('./stats');

const emoteRegex = /<img src="images\/emotes\/([^.]*).(png|gif)" ?\/>/g;

const popular = stats.counters('emoji');
const missing = stats.counters('emojiMissing');
const missingGif = stats.counters('emojiMissingAnimated');

function parseMessageEmotes(message) {
  //images are displayed to the web browser as <img src="images/emotes/Disturbed_Burger_Pants.png" />
  const parsedMessage = message.replace(emoteRegex, (match, $1, $2) => {
    const emote = $1.replace(/\\/g, '');
    const discord = emoji[emote];
    
    popular.get(emote).increment();

    if (discord) return discord;

    const counter = $2 === 'gif' ? missingGif : missing;
    counter.get(emote).increment();

    return `:${emote}:`;
  });
  // console.log(parsedMessage);
  return parsedMessage;
}

module.exports = parseMessageEmotes;
