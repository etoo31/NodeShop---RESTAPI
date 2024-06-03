const express = require("express");
const { body } = require("express-validator");
const feedController = require("../controllers/feed");
const router = express.Router();

router.get("/posts", feedController.getPosts);
router.post(
  "/createPost",
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
router.get("/posts/:postId", feedController.getSinglePost);
router.put(
  "/post/:postId",
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
module.exports = router;
