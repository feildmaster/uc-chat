// glitch stuff
require('./src/glitch');

// bot stuff
require('./src/bot');

const fs = require('fs');
const dir = `./.data/logs`;

function saveLog(data) { // If we're saving a log we're exiting anyway, so sync is fine
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = `${dir}/${Date.now()}.txt`;
  fs.writeFileSync(filename, data);
  return filename;
}

process.on('uncaughtException', (error = {}) => {
  const filename = saveLog(`[uncaughtException] ${error.stack || error}`);
  console.log(`Uncaught Exception, see: ${filename}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  const filename = saveLog(`[unhandledRejection] ${error.stack || error}`);
  console.log(`Uncaught Rejection, see: ${filename}`);
  process.exit(1);
});
