const passport = require('passport')
const JWTStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const User = require('../models/User')

const JWTOptions = {
  secretOrKey: process.env.SECRET,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
}

const JWTLogin = new JWTStrategy(JWTOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id)
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (e) {
    return done(e)
  }
})

passport.use(JWTLogin)

const JWTOptional = (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) return next(err)
    return next()
  })(req, res, next)
}

exports.authenticated = passport.authenticate('jwt', { session: false })
exports.optional = JWTOptional
