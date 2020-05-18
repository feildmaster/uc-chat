const express = require("express");
const path = require('path');
const serveIndex = require('serve-index');
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

app.use('/errors', express.static(path.resolve(__dirname, './.data/logs')), serveIndex(path.resolve(__dirname, './.data/logs')));

if (process.env.PORT) {
  const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
}
