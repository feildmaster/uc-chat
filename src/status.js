const axios = require("axios");
const prettyDuration = require('pretty-ms');

const endpoint = process.env.WEBHOOK_STATUS;

let safeExit = false;

function sendStatus({
  status = true,
  message,
  error
} = {}) {
  if (!endpoint || safeExit) return Promise.resolve(false);

  safeExit = !status;

  const embed = { fields: [] };
  
  if (message) embed.description = message;
  
  function stat(name, value, inline = true) {
    embed.fields.push({ name: `❯ ${name}`, value, inline });
  }
  
  stat('Status', status ? "online" : "offline");
  stat('Uptime', prettyDuration(process.uptime() * 1000));
  
  // TODO: More stats

  if (error) stat('Error', error.message, false);

  return axios.post(endpoint, {
    avatar_url: "https://undercards.net/images/souls/DETERMINATION.png",
    embeds: [embed]
  }).then(() => true);
}

process.on("beforeExit", () => sendStatus({
  status: false,
  message: "Unexpected termination"
}));

module.exports = sendStatus;
