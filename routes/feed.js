const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const feedController = require("../controllers/feed");
const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);
router.post(
  "/createPost",
  isAuth,
  [
    body("title", "Title must be atlease 5 char long")
      .trim()
      .isLength({ min: 5 }),
    body("content", "Content must be atleast 5 char long")
      .trim()
      .isLength({ min: 5 }),
  ],
  feedController.createPost
);
router.get("/posts/:postId", isAuth, feedController.getSinglePost);
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title", "Title must be atlease 5 char long")
      .trim()
      .isLength({ min: 5 }),
    body("content", "Content must be atleast 5 char long")
      .trim()
      .isLength({ min: 5 }),
  ],
  feedController.updatePost
);
router.delete("/post/:postId", isAuth, feedController.deletePost);
module.exports = router;
