exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      title: 'First Post',
      content: "This is Post"
    }]
  });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;

  //create post in db
  res.status(201).json({
    message: 'Post created successfully',
    posts: [{
      id: new Date(),
      title: title,
      content: content
    }]
  });
};