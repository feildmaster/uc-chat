//glitch stuff
const express = require("express");
const app = express();
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.send("oof");
});
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//real stuff
const https = require("https");
const WebSocket = require("ws");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const endpoints = {
  'chat-discussion': process.env.WEBHOOKURL,
  'chat-strategy': process.env.WEBHOOK_STRATEGY,
  'chat-beginner': process.env.WEBHOOK_BEGINNER,
  'chat-tournament': process.env.WEBHOOK_TOURNEY,
  'chat-roleplay': process.env.WEBHOOK_RP,
  'chat-support': process.env.WEBHOOK_SUPPORT,
};

const templateRegex = /\$(\d+)/g;

const autoTemplates = {
  'chat-legendary-notification': {
    hook: process.env.WEBHOOK_LEGEND,
    title: 'Legendary draw',
    template: '$1 has just obtained $2!',
  },
  'chat-legendary-shiny-notification': {
    hook: process.env.WEBHOOK_LEGEND,
    title: 'Legendary draw',
    template: '$1 has just obtained Shiny $2!',
  },
  'chat-user-ws': {
    hook: process.env.WEBHOOK_WS,
    title: 'Win streak',
    template: '$1 is on a $2 game winning streak!',
  },
  'chat-user-ws-stop': {
    hook: process.env.WEBHOOK_WS,
    title: 'Win streak',
    template: `$1 has just stopped $2's $3 game winning streak!`,
  },
};

const specialCharacters = /([`|*_~>])/g;

const ranks = [
  '', // Blank
  'ff0000', // Admin
  'fca500', // Coordinator
  '00cc00', // Moderator
  '41fcff', // Supporter
  'd535d9', // Balancer
  '00ceff', // Designer
  '7355ff', // Artist
  '43ec94', // Tester
  '', // Unused
  '0091ff', // Default
  'ffd700', // Contributor
];

//sign in once
/**/
reqHttps("undercards.net/SignIn", process.env.LOGINBODY, "application/x-www-form-urlencoded; charset=UTF-8", headers => {
  let setCookie = headers["set-cookie"];
  let auth = setCookie.map(cookie => cookie.split(";")[0]).join("; ") + ";";
  //console.log(auth);

  //ws stuff with auth
  const hostname = "undercards.net/chat";
  const options = {
    headers: {
      Cookie: auth
    }
  };
  const ws = new WebSocket("wss://undercards.net/chat", options);
  //ws stuff
  ws.on("open", function open() {
    // Join rooms we care about
    Object.keys(endpoints).forEach((room) => {
      if (!endpoints[room]) return;
      ws.send(JSON.stringify({
        room,
        action: "openRoom",
      }));
    });

    setInterval(() => {
      ws.send(
        JSON.stringify({
          ping: "pong"
        })
      );
      //console.log("pinged");
    }, 9000);
  });
  
  //if the server goes down restart the app for new auth
  ws.on("close", function socketClosed() {
    console.log('Websocket disconnected');
    process.exit();
  });

  ws.on("message", function incoming(data) {
    let parsedData = JSON.parse(data);
    // console.log(parsedData)
    if (parsedData.action === 'getMessage') {
      const room = parsedData.room;
      const endpoint = endpoints[room];
      if (!endpoint) return; // This is just a fail-safe
      let chatMessage = JSON.parse(parsedData.chatMessage);
      //let id = chatMessage.id;
      let user = chatMessage.user;
      //decode html entities sent over
      let message = entities.decode(chatMessage.message);
      let [messageNoEmotes, emotes] = parseMessageEmotes(message);
      //console.log(id, user.username, message);
      let params = {
        username: `${room} webhook`,
        avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
        //content: message,
        embeds: [
          {
            author: {
              name: entities.decode(user.username),
              icon_url: 'https://undercards.net/images/avatars/' + user.avatar.image + '.' + user.avatar.extension
            },
            description: messageNoEmotes.replace(specialCharacters, '\\$1'),
            color: parseInt(ranks[user.mainGroup.priority] || ranks[10], 16),
            footer: {
              text: user.id,
            },
          }
        ]
      };
      reqHttps(endpoint, JSON.stringify(params), "application/json; charset=UTF-8");
    } else if (parsedData.action === 'getMessageBroadcast') {
      const endpoint = process.env.WEBHOOK_INFO;
      if (!endpoint) return;
      const params = {
        username: 'info-chan',
        avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
        content: parsedData.message,
      };
      reqHttps(endpoint, JSON.stringify(params), "application/json; charset=UTF-8");
    } else if (parsedData.action === 'getMessageAuto') {
      const message = JSON.parse(JSON.parse(parsedData.message).args);
      const template = autoTemplates[message[0]];
      if (!template || !template.hook) return;
      const params = {
        username: `${template.title} webhook`,
        avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
        content: template.template.replace(templateRegex, (m, key) => message.hasOwnProperty(key) ? message[key] : ""),
      };
      reqHttps(template.hook, JSON.stringify(params), "application/json; charset=UTF-8");
    }
  });
});
//*/

//boilerplate https post request, better to have fine control than a library
//do NOT put https:// part of url, it expects everything after that
function reqHttps(url, body, type, callback) {
  const hostname = url.split("/")[0];
  const options = {
    hostname: hostname,
    port: 443,
    path: encodeURI(url.slice(url.indexOf("/"))),
    method: "POST",
    headers: {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
      Connection: "keep-alive",
      "Content-Type": type,
      "Content-Length": body ? body.length : 0,
      //Cookie: cookie,
      Host: hostname,
      Origin: "https://" + hostname,
      Referer: "https://" + hostname,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
    }
  };
  const req = https.request(options, res => {
    //console.log("statusCode:", res.statusCode);
    //console.log("headers:", res.headers);
    if (callback) {
      if (res.statusCode !== 302 && res.statusCode !== 200) { // Redirect to quests
        console.error('Server unavailable');
        process.exit();
      }
      callback(res.headers);
    }
    /*let total = "";
    res.on("data", d => {
      total += d;
    });
    res.on("end", () => {
      callback ? callback(total) : null;
    });*/
  });
  //req.on("error", console.error.bind(console));
  if (body) req.write(body);
  req.end();
}

function parseMessageEmotes(message) {
  // TODO
  return [message, message];
}