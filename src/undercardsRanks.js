module.exports = {
  Administrator: 'ff0000',
  Coordinator: 'fca500',
  Moderator: '00cc00',
  Supporter: '41fcff',
  Balancer: 'd535d9',
  Designer: '00ceff',
  Artist: '7355ff',
  Tester: '43ec94',
  Translator: 'e7f1b1',
  Contributor: 'ffd700',
  User: '0091ff',
};

Object.keys(module.exports).forEach((key) => {
  module.exports[key] = parseInt(module.exports[key], 16);
});
