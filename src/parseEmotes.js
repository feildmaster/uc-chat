const emoteRegex = /<img src="images\/emotes\/([^.]*).(png|gif)" ?\/>/g;

function parseMessageEmotes(message) {
  //images are displayed to the web browser as <img src="images/emotes/Disturbed_Burger_Pants.png" />
  const parsedMessage = message.replace(emoteRegex, ':$1:');
  // console.log(parsedMessage);
  return parsedMessage;
}

module.exports = parseMessageEmotes;
