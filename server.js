// glitch stuff
require('./src/glitch');

// bot stuff
require('./src/bot');

const fs = require('fs');
const { inspect } = require('util');

const dir = `.data/logs`;

function saveLog(data) { // If we're saving a log we're exiting anyway, so sync is fine
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = `${dir}/${Date.now()}.txt`;
  fs.writeFileSync(filename, inspect(data));
  return filename;
}

process.on('uncaughtException', (error = {}) => {
  const filename = saveLog(error);
  console.log(`Uncaught Exception, see: ${filename}`);
  process.exit(1);
});

process.on('unhandledRejection', (_, promise) => {
  const filename = saveLog(promise);
  console.log(`Uncaught Rejection, see: ${filename}`);
  process.exit(1);
});
