const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

exports.add = [
  check('title').exists().withMessage('Title cannot be empty'),
  check('description').exists().withMessage('Description cannot be empty'),
  check('projectUrl').optional(),
  check('categories').exists().withMessage('Please pick at least one category'),
  sanitize(['title', 'description', 'projectUrl', 'categories']).trim()
]

exports.update = [
  check('title').optional(),
  check('description').optional(),
  check('projectUrl').optional(),
  check('categories').optional(),
  sanitize(['title', 'description', 'projectUrl', 'categories']).trim()
]

exports.addComment = [
  check('body').exists().withMessage('Comment cannot be empty'),
  sanitize(['body']).trim()
]

exports.updateComment = [
  check('body').optional(),
  sanitize(['body']).trim()
]
