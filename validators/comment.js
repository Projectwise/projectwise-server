const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

exports.add = [
  check('body').exists().withMessage('Comment cannot be empty'),
  sanitize(['body']).trim()
]

exports.update = [
  check('body').optional(),
  sanitize(['body']).trim()
]
