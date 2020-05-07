const axios = require("axios");
const prettyDuration = require('pretty-ms');
const stats = require('./stats');
// const emoji = require('./discordEmoji');

// process.env.PROJECT_DOMAIN (https://api.glitch.com/v1/projects/by/domain?domain={PROJECT_DOMAIN})

const endpoint = process.env.WEBHOOK_STATUS;

// const popular = stats.counters('emoji');
// const missing = stats.counters('emojiMissing');
// const missingGif = stats.counters('emojiMissingAnimated');

let safeExit = false;
let count = 0;

function sendStatus({
  status = true,
  message,
  error,
} = {}) {
  if (!endpoint || safeExit) return Promise.resolve(false);

  safeExit = !status;

  const embed = { fields: [] };
  
  if (message) embed.description = message;
  
  function stat(name, value, inline = true) {
    if (name && value) embed.fields.push({ name: `❯ ${name}`, value, inline });
  }
  
  stat('Status', status ? "online" : "offline");
  stat('Uptime', prettyDuration(process.uptime() * 1000, {
    secondsDecimalDigits: 0,
  }));
  stat('Messages', `Incoming: ${stats.counters('messages').get('incoming').get()}\nOutgoing: ${stats.counters('messages').get('outgoing').get()}`);

  // stat('Top Emoji', popular.top(5).map((a))); // Well crap, I don't know the image name
  // stat('Least Used Emoji', popular.top(5).map((a))); // Well crap, I don't know the image name
  // stat('Upload Candidates (png)', missing.top(5).map((a))); // Well crap, I don't know the image name
  // stat('Upload Candidates (gif)', missingGif.top(5).map((a))); // Well crap, I don't know the image name

  
  // TODO: More stats

  if (error) stat('Error', error.message, false);

  return axios.post(endpoint, {
    avatar_url: "https://undercards.net/images/souls/DETERMINATION.png",
    embeds: [embed]
  }).then(() => true);
}

process.on("exit", unexpectedTermination);

process.on('SIGINT', () => unexpectedTermination().catch(() => false).then(() => process.exit(1)));

function unexpectedTermination() {
  console.log('Unexpected Terminaton'); // Does this even get called?
  return safeExit ? Promise.resolve(safeExit) : sendStatus({
    status: false,
    message: "Unexpected termination"
  });
}

module.exports = sendStatus;

setInterval(() => {
  count += 1;
  const disconnect = count > 20;
  sendStatus({
    status: !disconnect,
  }).catch(() => {}).then(() => {
    if (disconnect) {
      process.exit(1);
    }
  });
}, 30 * 60000);
