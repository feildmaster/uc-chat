const emoteRegex = /<img src="images\/emotes\/([^.]*).(png|gif)" ?\/>/g;

function parseMessageEmotes(message) {
  //images are displayed to the web browser as <img src="images/emotes/Disturbed_Burger_Pants.png" />
  const parsedMessage = message.replace(emoteRegex, (match, emote) => {
    // TODO: convert supported emotes to discord emotes
    return `:${emote.replace('\\', '')}:`;
  });
  // console.log(parsedMessage);
  return parsedMessage;
}

module.exports = parseMessageEmotes;
