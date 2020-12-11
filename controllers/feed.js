const { validationResult } = require('express-validator/check')

const Post = require('../models/post');

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
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/gundam.jpg',
    creator: {
      name: 'Ming'
    }
  });

  post.save()
    .then(result => {
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
    })
    .catch(err => {
      console.log(err)
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })


};