const express = require("express");
const bodyParser = require("body-parser");
const feedRouter = require("./routes/feed");
const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log("Hello");
  next();
});

app.use("/feed", feedRouter);

app.listen(8080);
