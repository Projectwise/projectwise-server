const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/User')

const localOptions = {
  usernameField: 'email'
}

const LocalLogin = new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user) return done({errors: {'email': 'Your details could not be verified'}})
      user.verifyPassword(password)
        .then(isValid => {
          if (isValid) return done(null, user)
          else return done(null, false, {errors: {'password': 'Your details could not be verified'}})
        }).catch(e => done(e))
    }).catch(e => done(e))
})

passport.use(LocalLogin)
