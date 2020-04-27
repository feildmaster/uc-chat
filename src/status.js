const https = require('./https');
const endpoint = process.env.WEBHOOK_STATUS;

function sendStatus({
  status = true,
  message = '',
  error,
} = {}) {
  if (!endpoint) return;
  
  
  const embed = {
    description: message,
    fields: [{
      name: 'Status',
      value: status ? 'online' : 'offline',
      inline: true,
    }],
  };
  
  if (error) {
    embed.fields.push({
      name: 'Error',
      value: error.message,
    });
  }
  
  https(endpoint, JSON.stringify({
    avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
    embeds: [embed],
  }), "application/json; charset=UTF-8");
}

module.exports = sendStatus;