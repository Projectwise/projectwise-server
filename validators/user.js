const User = require('../models/User')
const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

exports.add = [
  check('username')
    .optional().trim().isLength({min: 2})
    .withMessage('Username should be atleast 2 characters long')
    .custom(async username => !(await User.findOne({ username }) !== null))
    .withMessage('This username is already in use'),

  check('email')
    .exists().withMessage('Email cannot be empty')
    .isEmail().withMessage('Must be a valid email')
    .custom(async email => !(await User.findOne({ email }) !== null))
    .withMessage('This email is already in use'),

  check('password').exists().withMessage('Password cannot be empty'),

  check('name').optional(),

  sanitize(['username', 'email', 'name']).trim(),

  sanitize('email').normalizeEmail()
]
