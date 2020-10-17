const Eris = require('eris');
const chatRecord = require('./util/chat-record');
const EMOJI = require('./discordEmoji');
const { endpoints, autoTemplates } = require('./endpoints');
const firebase = require('./firebase');
const getMessage = require('./getMessage');
const Limiter = require('./util/cooldown');
const ranks = require('./undercardsRanks');
const stats = require('./stats');
const Undercards = require('./undercards/connection');
const databaseValue = require('./util/database-value');
const pipe = require('./util/pipe');
const pipeIf = require('./util/pipe-if');

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
};
const _MUTE_ = {
  chan: process.env.CHANNEL_MUTED,
};
const alertRole = process.env.ALERT_ROLE;

const _REPORTS_ = databaseValue('config/undercards/endpoints/reports');

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

discord.on('error', (err) => console.log(err.code ? `Error: ${err.code}${err.message?`: ${err.message}`:''}` : err));

const pending = new Map();
discord.registerCommand('emotes', (msg, args) => {
  const run = !!args.length;
  const tempKey = args[0] || '';  
  const url = tempKey.lastIndexOf('/') + 1;
  const key = url ? tempKey.substring(url) : tempKey;
  
  if (run && key.lastIndexOf('.') === -1) return 'Missing emote extension';

  if (run) {
    const existing = EMOJI[key];
    if (existing) {
      return `\`${key}\` registered to ${existing}`;
    }
  }

  const emoji = [];
  discord.guilds.forEach(({emojis}) => emoji.push(...emojis.filter(({id}) => !EMOJI[id])));

  const safeEmoji = emoji.slice(0, 20);

  if (!safeEmoji.length) return 'Found no emoji';

  return discord.createMessage(msg.channel.id, run ? `Select emoji for \`${key}\`` : 'Unused Emoji').then((resp) => {
    safeEmoji.forEach(({id, name}) => resp.addReaction(`${name?`${name}:`:''}${id}`));

    if (run) {
      pending.set(resp.id, {
        key,
        emoji: safeEmoji,
        uid: msg.author.id,
      });
    }
  });
}, {
  requirements: commandRequirements,
});

discord.on('messageReactionAdd', (msg, emoji, uid) => {
  if (discord.user.id === uid) return; // Ignore self
  const data = pending.get(msg.id);
  if (!data) return;
  if (data.uid !== uid) return console.log(`UID(${uid}) incorrect`);
  if (!data.emoji.some(({id}) => id === emoji.id)) return console.log(`${emoji.id} not found`);
  pending.delete(msg.id);

  msg.removeReactions(); // Remove reactions immediately
  firebase.database().ref(`config/undercards/emoji/${data.key.replace('.', '_')}`).set({
    id: emoji.id,
    name: emoji.name,
    animated: emoji.animated,
  }).then(() =>
    msg.edit(`Registered <${emoji.animated?'a':''}:${emoji.name}:${emoji.id}> for \`${data.key}\``)
  ).catch(console.error);
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
  if (endpoint.chan) {
    const clone = { ...data };
    return discord.createMessage(endpoint.chan, clone)
    .then(pipe(() => {
      outgoing.increment();
    }))
    .catch(console.error);
  }

  return Promise.resolve(false);
}

function cleanString(string) {
  return string.replace(/_/g, '\\_').replace(getMessage.specialCharacters, '\\$1');
}

// TODO: Modularize message handlers
undercards.on('connect', () => { // Join rooms
  getSendStatus()();

  discord.editStatus('online');
}).on('message/getHistory', ({room = '', history = []} = {}) => {
  history.forEach(message => chatRecord.add(message, room));
}).on('message/received', () => { // Increment incoming stats
  stats.counters('messages').get('incoming').increment();
}).on('message/deleteMessages', (data) => {
  const entries = new Map();

  chatRecord.find(data.idUser).forEach((r) => {
    const key = `${r.room}_${r.userid}`;
    if (entries.has(key)) return;
    const endpoint = endpoints[r.room];
    const message = {
      content: `${cleanString(getMessage.decode(r.username))}#${r.userid} was muted`,
    }

    // Mute channel
    if (_MUTE_.chan) {
      entries.set(`muted_${r.userid}`, {
        endpoint: _MUTE_,
        message,
      });
    }

    entries.set(key, {
      endpoint,
      message,
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
  if (process.exitCode === undefined) {
    discord.editStatus('idle');
    reconnectUC(500);
  }
}).on('error', (err) => {
  console.error('Connection error:', err);
}).on('error/login', (res) => {
  console.error('Server unavailable');
  // TODO: Add restart flag
  // Retry connection after 5 seconds
  reconnectUC(5000);
  discord.editStatus('idle');
}).on('error/timeout', () => {
  console.error('Timeout occurred: Please check login credentials');
  discord.editStatus('idle');
}).on('message/getPrivateMessage', (data) => { // TODO: Handle private messages
  console.log('[PM]', JSON.stringify(data));
});

if (_INFO_.chan) {
  undercards.on('message/getMessageBroadcast', ({ message }) => {
    // TODO: Parse message for images
    post(_INFO_, {
      content: message,
    });
  });
}

// Chat rooms
Object.entries(endpoints)
.filter(([ _, { chan } = {} ]) => chan)
.forEach(([ room, { chan } ]) => {
  undercards.on(`message/getMessage/${room}`, ({ chatMessage }) => {
    chatRecord.add(chatMessage, room);
    if (!chan) return;
    const user = chatMessage.user;
    const { message, username } = getMessage(chatMessage);
    const data = {
      embed: {
        author: {
          name: username,
          icon_url: 'https://undercards.net/images/avatars/' + user.avatar.image + '.' + (user.avatar.extension || 'png')
        },
        description: message,
        color: parseInt(ranks[user.mainGroup.priority] || ranks[10], 16),
        footer: {
          text: `ID:${user.id}, LV:${user.level}(${user.division.replace('_', ' ')})`,
        },
      },
    };

    const alert = alertRole && isReport(message) && reportLimits.check(user.id) === true;
    if (alert) {
      data.content = alertRole;
    }

    const _reports = _REPORTS_.value();
    post({ chan }, data)
      .then(pipeIf(_reports && alert, (res) => {
        if (res instanceof Eris.Message) { // Link to original message
          data.content = `https://discord.com/channels/${res.guildID}/${res.channel.id}/${res.id}`;
          return post(_reports, data);
        }
      }));
  });
});
// Auto messages
Object.entries(autoTemplates)
.filter(([ _, { chan } = {} ]) => chan)
.forEach(([ type, { chan, template } ]) => {
  undercards.on(`message/getMessageAuto/${type}`, (message) => {
    post({ chan }, {
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

discord.connect().then(() => undercards.connect());

process.on('exit', () => {
  undercards.disconnect();
  discord.editStatus('invisible');
  // discord.disconnect({ reconnect: false });
});

function isReport(message) {
  const lower = message.toLowerCase().split(' ')[0];
  return lower === '@report';
}

module.exports = {
  undercards,
  discord,
  connected: () => {
    return undercards.connected;
  },
  post,
};
