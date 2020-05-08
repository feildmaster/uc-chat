//glitch stuff
require('./src/glitch');

//real stuff
const axios = require('axios');
const WebSocket = require("ws");
const { endpoints, autoTemplates } = require('./src/endpoints');
const ranks = require('./src/undercardsRanks');
const reqHttps = require('./src/https');
const getMessage = require('./src/getMessage');
const sendStatus = require('./src/status');
const chatRecord = require('./src/util/chat-record');
const Limiter = require('./src/util/cooldown');
const stats = require('./src/stats');

const alertRole = process.env.ALERT_ROLE;
const templateRegex = /\$(\d+)/g;
const reportLimits = new Limiter({
  cooldown: 60000, // 1 minute per user
  globalCooldown: 30000, // 30 seconds between users
});

//sign in once
reqHttps("undercards.net/SignIn", process.env.LOGINBODY, "application/x-www-form-urlencoded; charset=UTF-8", headers => {
  const setCookie = headers["set-cookie"];
  const auth = setCookie.map(cookie => cookie.split(";")[0]).join("; ") + ";";
  //console.log(auth);

  //ws stuff with auth
  const options = {
    headers: {
      Cookie: auth,
    }
  };
  const ws = new WebSocket("wss://undercards.net/chat", options);
  //ws stuff
  ws.on("open", function open() {
    sendStatus({message: 'Connected'});
    // Join rooms we care about
    Object.keys(endpoints).forEach((room) => {
      if (!endpoints[room].hook) return;
      ws.send(JSON.stringify({
        room,
        action: "openRoom",
      }));
    });

    setInterval(() => {
      ws.send(JSON.stringify({
        ping: "pong"
      }));
    }, 9000);
  });
  
  //if the server goes down restart the app for new auth
  ws.on("close", function socketClosed() {
    const message = 'Websocket disconnected';
    sendStatus({status: false}).then(() => {
      console.log(message);
      process.exit();
    });
  });

  ws.on("message", function incoming(data) {
    stats.counters('messages').get('incoming').increment();
    const output = {
      hook: null,
      json: null,
    };
    
    const parsedData = JSON.parse(data);
    // console.log(parsedData)
    if (parsedData.action === 'getMessage') {
      const room = parsedData.room;
      const endpoint = endpoints[room] || {};
      if (!endpoint.hook) return; // This is just a fail-safe
      // console.log('Received message');
      const chatMessage = JSON.parse(parsedData.chatMessage);
      //let id = chatMessage.id;
      const user = chatMessage.user;
      chatRecord.add(chatMessage, room);
      //decode html entities sent over and fit to discord
      const { message, username } = getMessage(chatMessage);
      //console.log(id, user.username, message);
      output.hook = endpoint.hook;
      output.json = {
        username: `${endpoint.title || room} chat`,
        avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
        //content: message,
        embeds: [
          {
            author: {
              name: username,
              icon_url: 'https://undercards.net/images/avatars/' + user.avatar.image + '.' + user.avatar.extension
            },
            description: message,
            color: parseInt(ranks[user.mainGroup.priority] || ranks[10], 16),
            footer: {
              text: user.id,
            },
          }
        ]
      };
      
      if (alertRole && message.toLowerCase().startsWith('@report') && reportLimits.check(user.id)) {
        output.json.content = alertRole;
      }
    } else if (parsedData.action === 'getMessageBroadcast') {
      const endpoint = process.env.WEBHOOK_INFO;
      if (!endpoint) return;
      output.hook = endpoint;
      output.json = {
        username: 'info-chan',
        avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
        content: parsedData.message, // TODO: Parse message for images
      };
    } else if (parsedData.action === 'getMessageAuto') {
      const message = JSON.parse(JSON.parse(parsedData.message).args);
      const endpoint = autoTemplates[message[0]];
      if (!endpoint || !endpoint.hook) return;
      // console.log('Received message type', message[0]);
      output.hook = endpoint.hook;
      output.json = {
        username: `${endpoint.title} webhook`,
        avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
        content: endpoint.template.replace(templateRegex, (m, key) => message.hasOwnProperty(key) ? cleanString(message[key]) : ""),
      };
    } else if (parsedData.action === 'deleteMessages') {
      const ids = JSON.parse(parsedData.listId);
      const entries = new Map();
      
      // TODO: A dedicated mute channel

      // Done like this in case they were using multiple channels
      ids.forEach((id) => {
        const data = chatRecord.get(id);
        if (!data) return;
        const key = `${data.room}_${data.userid}`;
        if (entries.has(key)) return;
        const endpoint = endpoints[data.room];
        const msg = `${cleanString(getMessage.decode(data.username))}#${data.userid} was muted`;
        if (process.env.WEBHOOK_MUTED) {
          entries.set(`muted_${data.userid}`, {
            room: process.env.WEBHOOK_MUTED,
            message: {
              username: `Mute log`,
              avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
              content: msg,
            },
          });
        }
        entries.set(key, {
          room: endpoint.hook,
          message: {
            username: `${endpoint.title || data.room} chat`,
            avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
            content: msg,
          }
        });
      });

      for (const data of entries.values()) {
        post(data.room, data.message);
      }
    }
    
    if (output.hook && output.json) {
      post(output.hook, output.json);
    }
  });
  
  process.on('exit', () => {
    console.log('Closing socket');
    ws.close();
  });
});

function post(hook, data) {
  // TODO: Message queue for rate limits
  //console.log('Sending message');
  stats.counters('messages').get('outgoing').increment();
  axios.post(hook, data)
    //.then(() => console.log('Sent'))
    .catch((error = {}) => console.error(error.isAxiosError ? error.response : error));
}

function cleanString(string) {
  return string.replace(/_/g, '\\_').replace(getMessage.specialCharacters, '\\$1');
}