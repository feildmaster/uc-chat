const axios = require("axios");
const prettyDuration = require('pretty-ms');
const stats = require('./stats');
const bot = require('./bot');
const emoji = require('./discordEmoji');
const firebase = require('./firebase');

const emojiURI = 'https://undercards.net/images/emotes/';

// process.env.PROJECT_DOMAIN (https://api.glitch.com/v1/projects/by/domain?domain={PROJECT_DOMAIN})

const _endpoint = {
  chan: process.env.CHANNEL_STATUS,
};

const popular = stats.counters('emoji');
const missing = stats.counters('emojiMissing');
const missingGif = stats.counters('emojiMissingAnimated');

let safeExit = false;
let interval;

function sendStatus({
  shuttingDown = false,
  message,
  error,
  extended = true,
  endpoint = _endpoint,
} = {}) {
  if (!endpoint.chan || safeExit) return Promise.resolve(false);

  safeExit = shuttingDown;

  const embed = { fields: [] };
  
  if (message) embed.description = message;
  
  function stat(name, value, inline = true) {
    if (name && value) embed.fields.push({ name: `❯ ${name}`, value, inline });
  }
  
  stat('Status', bot.connected() ? 'online' : 'offline');
  stat('Uptime', prettyDuration(process.uptime() * 1000, {
    secondsDecimalDigits: 0,
  }));
  
  stat('Messages', `Incoming: ${stats.counters('messages').get('incoming').get()}\nOutgoing: ${stats.counters('messages').get('outgoing').get()}`, false);

  if (extended) {
    if (popular.total()) {
      // `[${a.name}](${emojiURI}${a.name}})`
      stat('Top Emoji', popular.top(5).map((a) => `${emoji[a.name] || a.name} x${a.get()}`).join('\n'));
      stat('Least Used Emoji', popular.last(5).map((a) => `${a.name} x${a.get()}`).join('\n'));
    }
    stat('Upload Candidates (png)', missing.top(5).map((a) => `[${a.name}](${emojiURI}${a.name}) x${a.get()}`).join('\n'));
    stat('Upload Candidates (gif)', missingGif.top(5).map((a) => `[${a.name}](${emojiURI}${a.name}) x${a.get()}`).join('\n'));
  }
  
  // TODO: More stats

  if (error) stat('Error', error.message, false);

  return bot.post(endpoint, {
    avatar_url: "https://undercards.net/images/souls/DETERMINATION.png",
    embed,
  }).then(() => true);
}

process.on('exit', unexpectedTermination);

process.on('SIGINT', () => unexpectedTermination().catch(() => false).then(() => process.exit(1)));

function unexpectedTermination() {
  console.log('Unexpected Terminaton');
  return safeExit ? Promise.resolve(safeExit) : sendStatus({
    shuttingDown: true,
    message: "Unexpected termination"
  });
}

module.exports = sendStatus;

firebase.database().ref('config/statusRate').on('value', (s) => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  const minute = 60000;
  const val = s.val() * minute; // value * minute
  if (val >= minute * 10) { // Min 10 minutes
    interval = setInterval(() => sendStatus(), val);
    console.log(`Sending status updates every ${val}ms`);
  } else {
    console.log('Not sending status updates');
  }
});
