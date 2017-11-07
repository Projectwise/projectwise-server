const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GithubStrategy = require('passport-github-token')

const User = require('../models/User')

const localOptions = {
  usernameField: 'email'
}

const githubOptions = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  passReqToCallback: true
}

const LocalLogin = new LocalStrategy(localOptions, async (email, password, done) => {
  try {
    const user = await User.findOne({email})
    if (user && await user.verifyPassword(password)) {
      return done(null, user)
    } else {
      return done(null, false, {errors: {'password': 'Your details could not be verified'}})
    }
  } catch (e) {
    return done(e)
  }
})

const GithubLogin = new GithubStrategy(githubOptions,
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({email: profile.email})
      if (user) return done(null, user)
      else {
        const user = await new User({
          username: profile.login,
          email: profile.email,
          name: profile.name || null,
          avatar: profile.avatar_url || null
        }).save()
        return done(null, user)
      }
    } catch (e) {
      return done(e)
    }
  })

passport.use(LocalLogin)
passport.use(GithubLogin)
