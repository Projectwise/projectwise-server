const User = require('../models/User')
const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

exports.add = [
  check('username')
    .optional().trim().isLength({min: 2})
    .withMessage('Username should be atleast 2 characters long')
    .custom(username => {
      return User.findOne({ username }).then(user => {
        throw new Error('This username is already in use')
      })
    }),
  check('email')
    .exists().withMessage('Email cannot be empty')
    .isEmail().withMessage('Must be a valid email')
    .custom(async email => !(await User.findOne({ email }) !== null))
    .withMessage('This email is already in use'),
  check('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Must be a valid phone number')
    .trim()
    .custom(async phone => !(await User.findOne({ phone }) !== null))
    .withMessage('This phone number is already in use'),
  check('password').exists().withMessage('Password cannot be empty'),
  check('firstName').optional(),
  check('lastName').optional(),
  sanitize(['username', 'email', 'phone', 'firstName', 'lastName']).trim(),
  sanitize('email').normalizeEmail()
]
