const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
require("dotenv").config();
const feedRouter = require("./routes/feed");
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    let currentDate = new Date();
    console.log(currentDate);
    // Get the year, month, and day
    let year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    let day = currentDate.getDate().toString().padStart(2, "0");

    // Get the hours, minutes, and seconds
    let hours = currentDate.getHours().toString().padStart(2, "0");
    let minutes = currentDate.getMinutes().toString().padStart(2, "0");
    let seconds = currentDate.getSeconds().toString().padStart(2, "0");

    // Concatenate to form the date and time string without special characters
    let dateTimeString = year + month + day + hours + minutes + seconds;
    console.log(dateTimeString);
    cb(null, dateTimeString + file.originalname);
  },
});
const fileFileter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else cb(null, false);
};
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFileter }).single("image")
);
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
