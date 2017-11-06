const { check } = require('express-validator/check')

exports.login = [
  check('email')
    .exists().withMessage('Cannot be empty')
    .isEmail().withMessage('Must be a valid email'),
  check('password').exists().withMessage('Cannot be empty')
]

// TODO: Add validation for email token and OTP verification
