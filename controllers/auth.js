const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorsData = errors.array();
    console.log(errorsData);
    const error = new Error(
      "Input data is not correct, Please enter a valid input"
    );
    error.statusCode = 422;
    error.data = errorsData;
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });

      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "A new user created succssfully",
        userId: result._id,
      });
    })
    .catch((err) => next(err));
};
exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorsData = errors.array();
    console.log(errorsData);
    const error = new Error(
      "Input data is not correct, Please enter a valid input"
    );
    error.statusCode = 422;
    error.data = errorsData;
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("Email dosen't exists");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Email dosen't exists");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "supersecretkey",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
      });
    })
    .catch((err) => next(err));
};
