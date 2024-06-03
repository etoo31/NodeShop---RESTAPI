const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "Cracking the coding interview",
        content: "you can crack any interview using this book",
        image: "images/etoo.jpg",
        creator: {
          name: "Etoo",
        },
        createdAt: new Date(),
      },
    ],
  });
};
exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Input data is not correct, Please enter a valid input",
      errors: errors.array(),
    });
  }
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/etoo.jpg",
    creator: {
      name: "Etoo",
    },
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "post created succssfully",
        post: post,
      });
    })
    .catch((err) => console.log(err));
};
