const HttpStatus = require('http-status-codes')
const router = require('express').Router()
const passport = require('passport')
const { validationResult } = require('express-validator/check')

const validate = require('../../validators/auth')

router.post('/login', validate.login, (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err) return next(err)
    if (user) return res.status(HttpStatus.OK).json({ user: user.toAuthJSON() })
    else return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(info)
  })(req, res, next)
})

module.exports = router
