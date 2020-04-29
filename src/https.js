const URL = require('url');
const https = require("https");
const status = require('./status');

//boilerplate https post request, better to have fine control than a library
//do NOT put https:// part of url, it expects everything after that
function reqHttps(url, body, headers = {}, callback) {
  url = new URL(url);
  const hostname = url.hostname;
  const options = {
    hostname,
    path: encodeURI(url.path),
    method: "POST",
    headers: {
      ...headers,
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
      Connection: "keep-alive",
      "Content-Length": body ? body.length : 0,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
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
