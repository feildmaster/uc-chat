const express = require("express");
const status = require('./status');

const app = express();
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.send("oof");
});
app.get("/status", (req, res) => status().then(() => {
  res.send('Sent');
}).catch((error) => {
  res.send(error);
}));

// app.get('/errors', express.static('.data/logs'), serveIndex('./data/logs', { template: errorTemplate }));

function errorTemplate(locals, callback) {}

if (process.env.PORT) {
  const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
}
