const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const uniqueValidator = require('mongoose-unique-validator')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "can't be blank"],
    lowercase: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  password: { type: String, required: [true, "can't be blank"] },
  token: {
    github: {type: String}
  },
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
  profile: {
    firstName: { type: String, required: [true, "can't be blank"] },
    lastName: { type: String, required: [true, "can't be blank"] },
    bio: String,
    image: String,
    github: String,
    dribbble: String,
    behance: String,
    website: String
  }
}, {timestamps: true})

UserSchema.plugin(uniqueValidator, {message: 'is already taken'})

UserSchema.pre('save', function (next) {
  const SALT_FACTOR = 5
  if (!this.isModified('password')) next()

  bcrypt.genSalt(SALT_FACTOR)
    .then((salt) => {
      bcrypt.hash(this.password, salt)
        .then(hash => {
          this.password = hash
          next()
        })
        .catch(next)
    })
    .catch(next)
})

UserSchema.methods.comparePassword = function (validatePassword, cb) {
  bcrypt.compare(validatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

UserSchema.methods.generateJWT = function () {
  let today = new Date()
  let exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return JWT.sign({
    id: this._id,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000)
  }, process.env.SECRET)
}

UserSchema.methods.toAuthJSON = function () {
  return {
    ...this.profile
  }
}

UserSchema.methods.toProfileJSON = function () {
  return {
    ...this.profile,
    likes: this.likes
  }
}

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
  return this.likes.some((likeId) => {
    return likeId.toString() === id.toString()
  })
}

mongoose.model('User', UserSchema)
