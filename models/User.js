const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
  username: {type: String},
  email: {type: String, unique: true, required: true, lowercase: true, index: true},
  password: {type: String},
  name: String,
  avatar: String,
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}]
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

UserSchema.methods.like = function (id) {
  if (this.likes.indexOf(id) === -1) {
    this.likes.push(id)
  }
  return this.save()
}

UserSchema.methods.dislike = function (id) {
  this.likes.remove(id)
  return this.save()
}

UserSchema.methods.hasLiked = function (id) {
  return this.likes.some((projectId) => projectId.toString() === id.toString())
}

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
  }, process.env.SECRET)
}

UserSchema.methods.toAuthJSON = function (token) {
  const auth = {
    id: this._id,
    username: this.username,
    email: this.email,
    token: token || this.generateJWT(),
    name: this.name,
    avatar: this.avatar
  }

  return _.omitBy(auth, _.isNil)
}

UserSchema.methods.toProfileJSON = function () {
  const profile = {
    id: this._id,
    username: this.username,
    profile_image: this.profileImage,
    name: this.name,
    avatar: this.avatar
  }

  return _.omitBy(profile, _.isNil)
}

module.exports = mongoose.model('User', UserSchema)
