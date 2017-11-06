const passport = require('passport')
const JWTStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const User = require('../models/User')

const JWTOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
}

const JWTLogin = new JWTStrategy(JWTOptions, (payload, done) => {
  User.findById(payload.id)
    .then(user => {
      if (user) {
        return done(null, user)
      } else return done(null, false)
    }).catch(e => done(e))
})

passport.use(JWTLogin)

exports.isAuthenticated = passport.authenticate('jwt', { session: false })
