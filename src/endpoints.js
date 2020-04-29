exports.endpoints = {
  'chat-discussion': {
    title: 'Discussion',
    hook: process.env.WEBHOOK_DISCUSSION || process.env.WEBHOOKURL,
  },
  'chat-strategy': {
    title: 'Strategy',
    hook: process.env.WEBHOOK_STRATEGY,
  },
  'chat-beginner': {
    title: 'Beginner',
    hook: process.env.WEBHOOK_BEGINNER,
  },
  'chat-tournament': {
    title: 'Tournament',
    hook: process.env.WEBHOOK_TOURNEY,
  },
  'chat-roleplay': {
    title: 'Roleplay',
    hook: process.env.WEBHOOK_RP,
  },
  'chat-support': {
    title: 'Support',
    hook: process.env.WEBHOOK_SUPPORT,
  },
  'chat-fr': {
    title: 'French',
    hook: process.env.WEBHOOK_FR,
  },
  'chat-ru': {
    title: 'Russian',
    hook: process.env.WEBHOOK_RU,
  },
  'chat-es': {
    title: 'Spanish',
    hook: process.env.WEBHOOK_ES,
  },
  'chat-pt': {
    title: 'Portuguese',
    hook: process.env.WEBHOOK_PT,
  },
  'chat-it': {
    title: 'Italian',
    hook: process.env.WEBHOOK_IT,
  },
  'chat-de': {
    title: 'German',
    hook: process.env.WEBHOOK_DE,
  },
  'chat-cn': {
    title: 'Chinese',
    hook: process.env.WEBHOOK_CN,
  },
  'chat-jp': {
    title: 'Japanese',
    hook: process.env.WEBHOOK_JP,
  },
  'chat-tr': {
    title: 'Turkish',
    hook: process.env.WEBHOOK_TR,
  },
  'chat-pl': {
    title: 'Polish',
    hook: process.env.WEBHOOK_PL,
  },
};

exports.autoTemplates = {
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
