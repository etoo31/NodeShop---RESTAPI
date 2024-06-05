const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .populate("creator")
        .skip((page - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      //console.log(posts[0].creator);
      res.status(200).json({ posts: posts, totalItems: totalItems });
    })
    .catch((err) => next(err));
};
exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Input data is not correct, Please enter a valid input"
    );
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("File is missing");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  let postCreated;
  post
    .save()
    .then((result) => {
      postCreated = result;
      console.log("Post Created : ", result);
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "post created succssfully",
        post: { ...post._doc, creator: { _id: result._id, name: result.name } },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("There is no post with this id");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        post: post,
      });
    })
    .catch((err) => next(err));
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Input data is not correct, Please enter a valid input"
    );
    error.statusCode = 422;
    throw error;
  }
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("File is not found");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (req.userId !== post.creator.toString()) {
        const error = new Error("UnAuthorized");
        error.statusCode = 403;
        throw error;
      }
      if (!post) {
        const error = new Error("There is no post with this id");
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        deleteImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((post) => {
      res.status(200).json({ message: "Post updated succssfully", post: post });
    })
    .catch((err) => next(err));
};
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("There is no post with this id");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("UnAuthorized");
        error.statusCode = 403;
        throw error;
      }
      deleteImage(post.imageUrl);
      return Post.findOneAndDelete(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post deleted succssfully" });
    })
    .catch((err) => next(err));
};

const deleteImage = (imagePath) => {
  const fullPath = path.join(__dirname, "..", imagePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.log(err);
  });
};
