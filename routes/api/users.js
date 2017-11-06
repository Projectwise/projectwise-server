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

router.get('/me', jwt.isAuthenticated, (req, res, next) => {
  const user = req.user
  return res.status(HttpStatus.OK).json({
    user: user.toProfileJSON()
  })
})

module.exports = router
