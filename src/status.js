const axios = require("axios");
const endpoint = process.env.WEBHOOK_STATUS;

let safeExit = false;

function sendStatus({
  status = true,
  message,
  error
} = {}) {
  if (!endpoint || safeExit) return Promise.resolve(false);

  safeExit = !status;

  const embed = {
    fields: [{
      name: "> Status",
      value: status ? "online" : "offline",
      inline: true
    }],
  };
  
  if (message) embed.description = message;

  if (error) {
    embed.fields.push({
      name: "Error",
      value: error.message
    });
  }

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
