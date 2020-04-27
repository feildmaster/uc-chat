const axios = require("axios");
const endpoint = process.env.WEBHOOK_STATUS;

let safeExit = false;

function sendStatus({
  status = true,
  message = "",
  error
} = {}) {
  if (!endpoint) return;

  safeExit = !status;

  const embed = {
    description: message,
    fields: [{
      name: "Status",
      value: status ? "online" : "offline",
      inline: true
    }],
  };

  if (error) {
    embed.fields.push({
      name: "Error",
      value: error.message
    });
  }

  axios.post(endpoint, {
    avatar_url: "https://undercards.net/images/souls/DETERMINATION.png",
    embeds: [embed]
  });
}

process.on("beforeExit", () => {
  if (safeExit) return;
  sendStatus({
    status: false,
    message: "Unexpected termination"
  });
});

module.exports = sendStatus;
