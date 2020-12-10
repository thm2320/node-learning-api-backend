exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      _id: 1,
      title: 'First Post',
      content: "This is Post",
      imageUrl: 'images/gundam.jpg',
      creator: {
        name: 'Ming'
      },
      createdAt: new Date().toISOString()
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