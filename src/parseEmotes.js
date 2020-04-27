const emoteRegex = /<img src="images\/emotes\/([^.]*).(png|gif)" ?\/>/g;

function parseMessageEmotes(message) {
  //images are displayed to the web browser as <img src="images/emotes/Disturbed_Burger_Pants.png" />
  const parsedMessage = message.replace(emoteRegex, (match, $1) => {
    // TODO: convert in-game emotes to discord emotes
    const emote = $1.replace(/\\/g, '');
    return `:${emote}:`;
  });
  // console.log(parsedMessage);
  return parsedMessage;
}

module.exports = parseMessageEmotes;
