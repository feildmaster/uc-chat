const express = require("express");
const status = require('./status');

const app = express();
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.send("oof");
});
app.get("/status", (req, res) => status().catch(() => false).then((sent) => {
  res.send(sent ? 'Sent' : 'oof');
}));
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
