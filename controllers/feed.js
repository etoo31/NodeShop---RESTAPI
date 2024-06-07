const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.status(200).json({ posts: posts, totalItems: totalItems });
  } catch (err) {
    next(err);
  }
};
exports.createPost = async (req, res, next) => {
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
  try {
    const postCreated = await post.save();
    console.log("Post Created : ", postCreated);

    const user = await User.findById(req.userId);
    user.posts.push(post);
    const result = user.save();
    io.getio().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: user._id, name: user.name } },
    });
    res.status(201).json({
      message: "post created succssfully",
      post: { ...post._doc, creator: { _id: user._id, name: user.name } },
    });
  } catch (err) {
    next(err);
  }
};
exports.getSinglePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("There is no post with this id");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      post: post,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
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
  try {
    const post = await Post.findById(postId).populate("creator");
    if (req.userId !== post.creator._id.toString()) {
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

    const result = await post.save();
    io.getio().emit("posts", { action: "update", post: result });
    res.status(200).json({ message: "Post updated succssfully", post: result });
  } catch (err) {
    next(err);
  }
};
exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
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
    const deleteResult = await Post.findOneAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    const userUpdateResult = await user.save();
    io.getio().emit("posts", { action: "delete", post: post });
    res.status(200).json({ message: "post deleted succssfully" });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new Error("User is not found");
    }
    res.status(200).json({
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};
exports.updateStatus = async (req, res, next) => {
  const status = req.body.status;
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new Error("User is not found");
    }

    user.status = status;

    const result = await user.save();

    res.status(200).json({
      message: "User status updated succssfully",
      status: status,
    });
  } catch (err) {
    next(err);
  }
};
const deleteImage = (imagePath) => {
  const fullPath = path.join(__dirname, "..", imagePath);
  console.log("Full path : ", fullPath);
  fs.unlink(fullPath, (err) => {
    if (err) console.log(err);
  });
};
