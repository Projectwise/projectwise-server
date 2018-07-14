const HttpStatus = require('http-status-codes')
const router = require('express').Router()
const passport = require('passport')
const axios = require('axios')
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
    if (user) {
      return res.status(HttpStatus.OK).json({
        user: user.toAuthJSON()
      })
    } else {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(info)
    }
  })(req, res, next)
})

router.get('/auth/token/github', async (req, res, next) => {
  const code = req.query['code']
  try {
    let token = await axios.post('https://github.com/login/oauth/access_token', {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET
    })
    token = token.data
    return res.status(HttpStatus.OK).json({
      token
    })
  } catch (e) {
    return next(e)
  }
})

router.get('/auth/github', (req, res, next) => {
  passport.authenticate('github-token', (err, user, info) => {
    if (err) return next(err)
    if (user) {
      return res.status(HttpStatus.OK).json({
        user: user.toAuthJSON()
      })
    } else {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(info)
    }
  })(req, res, next)
})

module.exports = router
