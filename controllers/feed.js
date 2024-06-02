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
  res.status(201).json({
    message: "post created succssfully",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      image: "images/etoo.jpg",
      creator: {
        name: "Etoo",
      },
      createdAt: new Date(),
    },
  });
};
