const https = require('./https');
const endpoint = process.env.WEBHOOK_STATUS;

function sendStatus(msg, error) {
  if (!endpoint) return;
  
  const data = {
    avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
  };
  
  https(endpoint, JSON.stringify(data), "application/json; charset=UTF-8");
}

module.exports = sendStatus;