const axios = require('axios');
const Eris = require('eris');
const chatRecord = require('./util/chat-record');
const emoji = require('./discordEmoji');
const { endpoints, autoTemplates } = require('./endpoints');
const getMessage = require('./getMessage');
const Limiter = require('./util/cooldown');
const ranks = require('./undercardsRanks');
const stats = require('./stats');
const Undercards = require('./undercards/connection');

let sendStatus;
const templateRegex = /\$(\d+)/g;
const reportLimits = new Limiter({
  cooldown: 60000, // 1 minute per user
  globalCooldown: 30000, // 30 seconds between users
});
const reconnection = {
  delay: 0,
  timeout: null,
};
const _INFO_ = {
  chan: process.env.CHANNEL_INFO,
  hook: process.env.WEBHOOK_INFO,
};

const undercards = new Undercards(process.env.LOGINBODY);
const discord = new Eris.CommandClient(process.env.DISCORD_BOT_TOKEN, {}, {
  prefix: ['@mention', '~'],
});

const commandRequirements = {
  userIDs: [
    '208562116590960640', // feildmaster
  ],
  roleIDs: [
    '703677962859315230', // Manager
  ],
};

let discordReady = false;
discord.on('ready', () => discordReady = true);
discord.on('error', (err) => console.log(err.code ? `Error: ${err.code}${err.message?`: ${err.message}`:''}` : err));

discord.registerCommand('emotes', (msg, args) => {
  // TODO: Allow registering discord emoji to in-game emoji
  const emoji = [];
  discord.guilds.forEach(({emojis}) => emoji.push(...emojis.filter(({id}) => !emoji[id]).map(({id, name}) => `${name?`${name}:`:''}${id}`)));
  return discord.createMessage(msg.channel.id, 'All Emoji').then((resp) => emoji.slice(0, 20).forEach(e => resp.addReaction(e)));
}, {
  requirements: commandRequirements,
});

discord.registerCommand('restart', (msg, args) => {
  return getSendStatus()({
    shuttingDown: true,
    message: 'Restarting',
  }).then(() => discord.createMessage(msg.channel.id, 'Restarting!')
  .catch(console.error)
  .then(() => process.exit()));
}, {
  requirements: commandRequirements,
});

discord.registerCommand('status', (msg) => {
  return getSendStatus()({
    endpoint: {
      chan: msg.channel.id,
    },
    extended: false,
  }).then(() => {
    // noop
  });
}, {
  cooldown: 60*1000,
});

function getSendStatus() {
  if (!sendStatus) {
    sendStatus = require('./status');
  }
  return sendStatus;
}

function reconnectUC(delay = 0) {
  if (undercards.connected) return;
  const now = Date.now();
  if (reconnection.timeout) {
    if (reconnection.delay > delay + now) {
      clearTimeout(reconnection.timeout);
    } else return;
  }

  reconnection.delay = now + delay;
  reconnection.timeout = setTimeout(() => {
    reconnection.timeout = null;
    undercards.connect();
  }, delay);
}

function post(endpoint, data) {
  const outgoing = stats.counters('messages').get('outgoing');
  if (endpoint.chan && discordReady) {
    const clone = { ...data };
    delete clone.avatar_url;
    delete clone.username;
    return discord.createMessage(endpoint.chan, clone)
    .then(() => outgoing.increment())
    .catch(() => post({ hook: endpoint.hook }, data));
  } else if (endpoint.hook) { // Fallback to webhooks
    // TODO: Hook based throttles
    const clone = { ...data };
    if (clone.embed) {
      clone.embeds = [clone.embed];
      delete clone.embed;
    }
    return axios.post(endpoint.hook, clone)
      .then(() => outgoing.increment())
      .catch((error = {}) => console.error(error.isAxiosError ? error.response : error));
  }

  return Promise.resolve(false);
}

function cleanString(string) {
  return string.replace(/_/g, '\\_').replace(getMessage.specialCharacters, '\\$1');
}

// TODO: Modularize message handlers
undercards.on('connect', () => { // Join rooms
  getSendStatus()();

  Object.entries(endpoints)
  .filter(([_, { connect } = {}]) => connect)
  .forEach(([ room ]) => undercards.join(room));
  discord.editStatus('online');
}).on('message/getHistory', ({room = '', history = []} = {}) => {
  history.forEach(message => chatRecord.add(message, room));
}).on('message/received', () => { // Increment incoming stats
  stats.counters('messages').get('incoming').increment();
}).on('message/deleteMessages', (data) => {
  const entries = new Map();

  // Done like this in case they were using multiple channels
  data.listId.forEach((id) => {
    const data = chatRecord.get(id);
    if (!data) return;
    const key = `${data.room}_${data.userid}`;
    if (entries.has(key)) return;
    const endpoint = endpoints[data.room];
    const msg = `${cleanString(getMessage.decode(data.username))}#${data.userid} was muted`;
    const baseMsg = {
      avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
      content: msg,
    }

    // Mute channel
    const _MUTE_ = {
      chan: process.env.CHANNEL_MUTED,
      hook: process.env.WEBHOOK_MUTED,
    };
    if (_MUTE_.chan || _MUTE_.hook) {
      entries.set(`muted_${data.userid}`, {
        endpoint: _MUTE_,
        message: {
          ...baseMsg,
          username: `Mute log`,
        },
      });
    }

    entries.set(key, {
      endpoint,
      message: {
        ...baseMsg,
        username: `${endpoint.title || data.room} chat`,
      }
    });
  });

  for (const { endpoint, message } of entries.values()) {
    post(endpoint, message);
  }
}).on('disconnect', () => {
  getSendStatus()({
    message: 'Socket Closed',
  });
  console.debug('Socket Closed');
  // We can technically try and reconnect here
  if (process.exitCode !== undefined) {
    discord.editStatus('idle');
    reconnectUC(5000);
  }
}).on('error', (err) => {
  console.error('Connection error:', err);
}).on('error/login', (res) => {
  console.error('Server unavailable');
  // Retry connection after 5 seconds
  reconnectUC(5000);
  discord.editStatus('idle');
}).on('error/timeout', () => {
  console.error('Timeout occurred: Please check login credentials');
  discord.editStatus('idle');
}).on('message/getPrivateMessage', (data) => { // TODO: Handle private messages
  console.log('[PM]', JSON.stringify(data));
});

if (_INFO_.chan || _INFO_.hook) {
  undercards.on('message/getMessageBroadcast', ({ message }) => {
    // TODO: Parse message for images
    post(_INFO_, {
      username: 'info-chan',
      avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
      content: message,
    });
  });
}

// Chat rooms
Object.entries(endpoints)
.filter(([ _, { chan, hook } = {} ]) => chan || hook)
.forEach(([ room, { chan, hook } ]) => {
  undercards.on(`message/getMessage/${room}`, ({ room, chatMessage }) => {
    chatRecord.add(chatMessage, room);
    if (!chan && !hook) return;
    const user = chatMessage.user;
    const { message, username } = getMessage(chatMessage);
    const data = {
      username: ``,
      avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
      embed: {
        author: {
          name: username,
          icon_url: 'https://undercards.net/images/avatars/' + user.avatar.image + '.' + user.avatar.extension
        },
        description: message,
        color: parseInt(ranks[user.mainGroup.priority] || ranks[10], 16),
        footer: {
          text: user.id,
        },
      },
    };

    const alertRole = process.env.ALERT_ROLE;
    if (alertRole && message.toLowerCase().startsWith('@report') && reportLimits.check(user.id) === true) {
      data.content = alertRole;
    }

    post({ chan, hook }, data);
  });
});
// Auto messages
Object.entries(autoTemplates)
.filter(([ _, { chan, hook } = {} ]) => chan || hook)
.forEach(([ type, { chan, hook, template, title } ]) => {
  undercards.on(`message/getMessageAuto/${type}`, (message) => {
    post({ chan, hook }, {
      username: `${title} webhook`,
      avatar_url: 'https://undercards.net/images/souls/DETERMINATION.png',
      content: template.replace(templateRegex, (m, key) => message.hasOwnProperty(key) ? cleanString(message[key]) : ""),
    });
  });
});

// DEBUG
if (process.env.DEBUG === 'true') {
  function getData(data) {
    switch (data.action) {
      case '':
      case 'getMessage': return '';
      default: return JSON.stringify(data);
    }
  }

  undercards.on('message/unhandled', (data) => { // Debug unhandled messages
    console.debug(`[UNHANDLED] ${data.action}:`, getData(data));
  });
}

undercards.connect();
discord.connect();

process.on('exit', () => {
  undercards.disconnect();
  discord.editStatus('invisible');
  // discord.disconnect({ reconnect: false });
});

module.exports = {
  undercards,
  discord,
  connected: () => {
    return undercards.connected;
  },
  post,
};
