const URL = require('url');
const https = require("https");
const status = require('./status');

//boilerplate https post request, better to have fine control than a library
//do NOT put https:// part of url, it expects everything after that
function reqHttps(url, body, headers = {}, callback) {
  url = URL.parse(url);
  const hostname = url.hostname;
  const options = {
    hostname,
    path: encodeURI(url.path),
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      "Content-Length": body ? body.length : 0,
    }
  };
  const req = https.request(options, res => {
    //console.log("statusCode:", res.statusCode);
    //console.log("headers:", res.headers);
    if (callback) {
      if (res.statusCode !== 302 && res.statusCode !== 200) { // Redirect to quests
        const message = 'Server unavailable';
        status({message, status: false}).catch(() => false).then(() => {
          console.error(message);
          process.exit();
        });
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

module.exports = reqHttps;
