const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const feedRouter = require("./routes/feed");
const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST , PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRouter);

mongoose
  .connect(process.env.DATABASE_URI)
  .then((result) => {
    console.log("Connected to the Database");
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
