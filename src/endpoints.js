exports.endpoints = {
  'chat-discussion': {
    connect: true,
    title: 'Discussion',
    hook: process.env.WEBHOOK_DISCUSSION || process.env.WEBHOOKURL,
    chan: process.env.CHANNEL_DISCUSSION,
  },
  'chat-strategy': {
    connect: true,
    title: 'Strategy',
    hook: process.env.WEBHOOK_STRATEGY,
    chan: process.env.CHANNEL_STRATEGY,
  },
  'chat-beginner': {
    connect: true,
    title: 'Beginner',
    hook: process.env.WEBHOOK_BEGINNER,
    chan: process.env.CHANNEL_BEGINNER,
  },
  'chat-tournament': {
    connect: true,
    title: 'Tournament',
    hook: process.env.WEBHOOK_TOURNEY,
    chan: process.env.CHANNEL_TOURNEY,
  },
  'chat-roleplay': {
    connect: true,
    title: 'Roleplay',
    hook: process.env.WEBHOOK_RP,
    chan: process.env.CHANNEL_RP,
  },
  'chat-support': {
    connect: true,
    title: 'Support',
    hook: process.env.WEBHOOK_SUPPORT,
    chan: process.env.CHANNEL_SUPPORT,
  },
  'chat-fr': {
    connect: true,
    title: 'French',
    hook: process.env.WEBHOOK_FR,
    chan: process.env.CHANNEL_FR,
  },
  'chat-ru': {
    connect: true,
    title: 'Russian',
    hook: process.env.WEBHOOK_RU,
    chan: process.env.CHANNEL_RU,
  },
  'chat-es': {
    connect: true,
    title: 'Spanish',
    hook: process.env.WEBHOOK_ES,
    chan: process.env.CHANNEL_ES,
  },
  'chat-pt': {
    connect: true,
    title: 'Portuguese',
    hook: process.env.WEBHOOK_PT,
    chan: process.env.CHANNEL_PT,
  },
  'chat-it': {
    connect: true,
    title: 'Italian',
    hook: process.env.WEBHOOK_IT,
    chan: process.env.CHANNEL_IT,
  },
  'chat-de': {
    connect: true,
    title: 'German',
    hook: process.env.WEBHOOK_DE,
    chan: process.env.CHANNEL_DE,
  },
  'chat-cn': {
    connect: true,
    title: 'Chinese',
    hook: process.env.WEBHOOK_CN,
    chan: process.env.CHANNEL_CN,
  },
  'chat-jp': {
    connect: true,
    title: 'Japanese',
    hook: process.env.WEBHOOK_JP,
    chan: process.env.CHANNEL_JP,
  },
  'chat-tr': {
    connect: true,
    title: 'Turkish',
    hook: process.env.WEBHOOK_TR,
    chan: process.env.CHANNEL_TR,
  },
  'chat-pl': {
    connect: true,
    title: 'Polish',
    hook: process.env.WEBHOOK_PL,
    chan: process.env.CHANNEL_PL,
  },
};

exports.autoTemplates = {
  'chat-legendary-notification': {
    hook: process.env.WEBHOOK_LEGEND,
    chan: process.env.CHANNEL_LEGEND,
    title: 'Legendary draw',
    template: '$1 has just obtained $2!',
  },
  'chat-legendary-shiny-notification': {
    hook: process.env.WEBHOOK_LEGEND,
    chan: process.env.CHANNEL_LEGEND,
    title: 'Legendary draw',
    template: '$1 has just obtained Shiny $2!',
  },
  'chat-user-ws': {
    hook: process.env.WEBHOOK_WS,
    chan: process.env.CHANNEL_WS,
    title: 'Win streak',
    template: '$1 is on a $2 game winning streak!',
  },
  'chat-user-ws-stop': {
    hook: process.env.WEBHOOK_WS,
    chan: process.env.CHANNEL_WS,
    title: 'Win streak',
    template: `$1 has just stopped $2's $3 game winning streak!`,
  },
};
