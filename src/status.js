const axios = require("axios");
const prettyDuration = require('pretty-ms');

// process.env.PROJECT_DOMAIN (https://api.glitch.com/v1/projects/by/domain?domain={PROJECT_DOMAIN})

const endpoint = process.env.WEBHOOK_STATUS;

let safeExit = false;

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
    embed.fields.push({ name: `❯ ${name}`, value, inline });
  }
  
  stat('Status', status ? "online" : "offline");
  stat('Uptime', prettyDuration(process.uptime() * 1000, {
    secondsDecimalDigits: 0,
  }));
  
  // TODO: More stats

  if (error) stat('Error', error.message, false);

  return axios.post(endpoint, {
    avatar_url: "https://undercards.net/images/souls/DETERMINATION.png",
    embeds: [embed]
  }).then(() => true);
}

process.on("beforeExit", unexpectedTermination);

process.on('SIGINT', () => unexpectedTermination().catch(() => false).then(() => process.exit(1)));

function unexpectedTermination() {
  console.log('Unexpected Terminaton'); // Does this even get called?
  return safeExit ? Promise.resolve(safeExit) : sendStatus({
    status: false,
    message: "Unexpected termination"
  });
}

module.exports = sendStatus;
