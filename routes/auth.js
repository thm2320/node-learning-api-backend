const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const User = require('../models/user');
const authController = require('../controllers/auth')


const router = express.Router();

router.put('/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({
          email: value
        })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('E-mail already exists!')
            }
          })
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({
        min: 5
      }),
    body('name')
      .trim()
      .not()
      .isEmpty()

  ],
  authController.signup
);

router.post('/login', authController.login)

router.get('/userStatus', isAuth, authController.getUserStatus)

router.patch('/userStatus', isAuth, authController.updateUserStatus)

module.exports = router;