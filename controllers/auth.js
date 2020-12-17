const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.')
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const {
      email, name, password
    } = req.body


    const hashedPw = await bcrypt.hash(password, 12)
    const user = new User({
      email,
      name,
      password: hashedPw
    })
    const result = await user.save();
    res.status(201)
      .json({
        message: 'User created',
        userId: result._id
      })
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const loadedUser = await User.findOne({ email: email })

    if (!loadedUser) {
      const error = new Error('email not found');
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, loadedUser.password);

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
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
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
