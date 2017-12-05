const HttpStatus = require('http-status-codes')
const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const User = require('../../models/User')
const validate = require('../../validators/user')
const jwt = require('../../config/jwt')

router.post('/signup', validate.add, async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    const user = await new User(matchedData(req)).save()
    return res.status(HttpStatus.OK).json({
      user: user.toAuthJSON()
    })
  } catch (e) {
    return next(e)
  }
})

router.get('/me', jwt.authenticated, (req, res, next) => {
  const user = req.user
  return res.status(HttpStatus.OK).json({
    user: user.toProfileJSON()
  })
})

router.get('/:userId', jwt.optional, async (req, res, next) => {
  const userId = req.params.userId
  try {
    const user = await User.findOne({ userId })
    if (!user) {
      return next({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        details: {
          project: `No user found for ${userId}`
        }
      })
    }
    return res.status(HttpStatus.OK).json({ user })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
