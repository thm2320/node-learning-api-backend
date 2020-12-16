const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.')
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const {
    email, name, password
  } = req.body
  bcrypt.hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email,
        name,
        password: hashedPw
      })
      return user.save();
    })
    .then(result => {
      res.status(201)
        .json({
          message: 'User created',
          userId: result._id
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err)
    })
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('email not found');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('wrong password');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'secretprivatekey' /*private key*/,
        {
          expiresIn: '1h'
        }
      );
      res.status(200)
        .json({
          token: token,
          userId: loadedUser._id.toString()
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err)
    })
}

exports.getUserStatus = (req, res, next) => {
  const userId = req.userId
  User.findById(userId)
    .then(user => {
      res.status(200)
        .json({
          status: user.status
        })
    })
}

exports.updateUserStatus = (req, res, next) => {
  const userId = req.userId
  const newStatus = req.body.status
  User.findById(userId)
    .then(user => {
      user.status = newStatus;
      return user.save()

    })
    .then(result => {
      res.status(200)
        .json({
          message: 'User status updated'
        })
    })
}
