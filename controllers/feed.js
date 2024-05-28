exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "Cracking the coding interview",
        description: "you can crack any interview using this book",
      },
    ],
  });
};
exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  res.status(201).json({
    message: "post created succssfully",
    post: {
      id: new Date().toISOString(),
      title: title,
      description: description,
    },
  });
};
