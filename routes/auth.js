const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");
const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("This email is not valid")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Email already exists");
        }
      })
      .normalizeEmail(),
    body("password", "Password must have atlease 5 chars")
      .trim()
      .isLength({ min: 5 }),
    body("name", "Name must has atlease 4 chars").trim().isLength({ min: 4 }),
  ],
  authController.signup
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("This email is not valid"),
    body("password", "Password must have atlease 5 chars")
      .trim()
      .isLength({ min: 5 }),
  ],
  authController.login
);

module.exports = router;
