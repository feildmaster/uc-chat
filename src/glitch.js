const express = require("express");
const status = require('./status');

const app = express();
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.send("oof");
});
app.get("/status", (req, res) => status().then(() => {
  res.send('Sent');
}).catch(() => {
  res.send('oof');
}));
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
