const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  email: {type: String, unique: true, required: true, lowercase: true, index: true},
  phone: {type: String, unique: true},
  password: {type: String, required: true},
  firstName: String,
  lastName: String,
  profileImage: String
}, {timestamps: true})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next()
  const SALT_FACTOR = 5
  try {
    const salt = await bcrypt.genSalt(SALT_FACTOR)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (e) {
    next(e)
  }
})

UserSchema.methods.verifyPassword = function (password) {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = await bcrypt.compare(password, this.password)
      return resolve(isValid)
    } catch (e) {
      return reject(e)
    }
  })
}

UserSchema.methods.generateJWT = function () {
  const today = new Date()
  let expiry = new Date(today)
  expiry.setDate(today.getDate() + 60)

  return jwt.sign({
    id: this._id,
    email: this.email,
    exp: parseInt(expiry.getTime() / 1000)
  }, process.env.JWT_SECRET)
}

UserSchema.methods.toAuthJSON = function (token) {
  const auth = {
    id: this._id,
    username: this.username,
    email: this.email,
    phone: this.phone,
    token: token || this.generateJWT(),
    first_name: this.firstName,
    last_name: this.lastName,
    profile_image: this.profileImage
  }

  return _.omitBy(auth, _.isNil)
}

UserSchema.methods.toProfileJSON = function () {
  const profile = {
    id: this._id,
    username: this.username,
    profile_image: this.profileImage,
    first_name: this.firstName,
    last_name: this.lastName
  }

  return _.omitBy(profile, _.isNil)
}

module.exports = mongoose.model('User', UserSchema)
