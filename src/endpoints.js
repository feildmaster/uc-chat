exports.endpoints = {
  'chat-discussion': {
    chan: process.env.CHANNEL_DISCUSSION,
  },
  'chat-strategy': {
    chan: process.env.CHANNEL_STRATEGY,
  },
  'chat-beginner': {
    chan: process.env.CHANNEL_BEGINNER,
  },
  'chat-tournament': {
    chan: process.env.CHANNEL_TOURNEY,
  },
  'chat-roleplay': {
    chan: process.env.CHANNEL_RP,
  },
  'chat-support': {
    chan: process.env.CHANNEL_SUPPORT,
  },
  'chat-fr': {
    chan: process.env.CHANNEL_FR,
  },
  'chat-ru': {
    chan: process.env.CHANNEL_RU,
  },
  'chat-es': {
    chan: process.env.CHANNEL_ES,
  },
  'chat-pt': {
    chan: process.env.CHANNEL_PT,
  },
  'chat-it': {
    chan: process.env.CHANNEL_IT,
  },
  'chat-de': {
    chan: process.env.CHANNEL_DE,
  },
  'chat-cn': {
    chan: process.env.CHANNEL_CN,
  },
  'chat-jp': {
    chan: process.env.CHANNEL_JP,
  },
  'chat-tr': {
    chan: process.env.CHANNEL_TR,
  },
  'chat-pl': {
    chan: process.env.CHANNEL_PL,
  },
};

exports.autoTemplates = {
  'chat-legendary-notification': {
    chan: process.env.CHANNEL_LEGEND,
    template: '$1 has just obtained $2!',
  },
  'chat-legendary-shiny-notification': {
    chan: process.env.CHANNEL_LEGEND,
    template: '$1 has just obtained Shiny $2!',
  },
  'chat-user-ws': {
    chan: process.env.CHANNEL_WS,
    template: '$1 is on a $2 game winning streak!',
  },
  'chat-user-ws-stop': {
    chan: process.env.CHANNEL_WS,
    template: `$1 has just stopped $2's $3 game winning streak!`,
  },
};
