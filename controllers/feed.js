const { validationResult } = require('express-validator/check')

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Validation failed.',
        errors: errors.array()
      })
  }

  const { title, content } = req.body;

  //create post in db
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: { name: 'Ming' },
      createdAt: new Date()
    }
  });
};