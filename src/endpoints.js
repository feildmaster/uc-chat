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
    lang: 'fr',
  },
  'chat-ru': {
    chan: process.env.CHANNEL_RU,
    lang: 'ru',
  },
  'chat-es': {
    chan: process.env.CHANNEL_ES,
    lang: 'es',
  },
  'chat-pt': {
    chan: process.env.CHANNEL_PT,
    lang: 'pt',
  },
  'chat-it': {
    chan: process.env.CHANNEL_IT,
    lang: 'it',
  },
  'chat-de': {
    chan: process.env.CHANNEL_DE,
    lang: 'de',
  },
  'chat-cn': {
    chan: process.env.CHANNEL_CN,
    lang: 'zh-cn',
  },
  'chat-jp': {
    chan: process.env.CHANNEL_JP,
    lang: 'ja',
  },
  'chat-tr': {
    chan: process.env.CHANNEL_TR,
    lang: 'tr',
  },
  'chat-pl': {
    chan: process.env.CHANNEL_PL,
    lang: 'pl',
  },
  0: {
    chan: process.env.CHANNEL_VOID,
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
  'chat-new-legend': {
    chan: process.env.CHANNEL_LEADERBOARD,
    template: '$1 has just reached LEGEND division!',
  },
};
