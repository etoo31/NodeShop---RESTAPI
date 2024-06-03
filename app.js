const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const feedRouter = require("./routes/feed");
const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST , PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRouter);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({
    message: message,
  });
});

mongoose
  .connect(process.env.DATABASE_URI)
  .then((result) => {
    console.log("Connected to the Database");
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
