const mongoose = require('mongoose')
const slug = require('slug')
const User = require('./User')

const ProjectSchema = new mongoose.Schema({
  slug: {type: String, required: true, unique: true},
  title: {type: String, required: true},
  description: {type: String, required: true},
  projectUrl: {type: String},
  categories: [{type: String, required: true}],
  helpDescription: {type: String, required: true},
  addedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  active: {type: Boolean, default: true},
  likeCount: {type: Number, default: 0},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true})

ProjectSchema.pre('validate', function (next) {
  if (!this.slug) {
    this.slugify()
  }
  next()
})

ProjectSchema.methods.slugify = function () {
  this.slug = slug(this.title)
}

ProjectSchema.methods.updateLikeCount = async function () {
  const count = await User.count({likes: {$in: [this._id]}})
  this.likeCount = count
  return this.save()
}

ProjectSchema.methods.setActive = function () {
  this.active = true
  return this.save()
}

ProjectSchema.methods.setInactive = function () {
  this.active = false
  return this.save()
}

ProjectSchema.methods.toProjectJSON = function (user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    projectUrl: this.projectUrl,
    categories: this.categories,
    addedBy: this.addedBy.toProfileJSON(),
    active: this.active,
    likeCount: this.likeCount,
    liked: user ? user.hasLiked(this._id) : false,
    created_at: this.createdAt,
    updated_at: this.updated_at
  }
}

module.exports = mongoose.model('Project', ProjectSchema)
