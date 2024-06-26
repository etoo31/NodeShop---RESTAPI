const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });

    const result = await user.save();

    res.status(201).json({
      message: "A new user created succssfully",
      userId: result._id,
    });
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
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
    // console.log(email);
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    // console.log(user);
    if (!user) {
      const error = new Error("Email dosen't exists");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("password is wrong");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "supersecretkey",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    next(err);
  }
};
