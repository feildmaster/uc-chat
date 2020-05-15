require('dotenv').config();
require('./server');

const { undercards } = require('./src/bot');

undercards.once('message/getSelfInfos', () => {
  // Sending here is *too early*
  // undercards.privateMessage('Pong', 63068); // Pong feildmaster
  // undercards.message('Hi. This is an automated message. Please ignore - feildmaster', 'chat-discussion');
});
