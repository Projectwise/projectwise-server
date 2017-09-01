const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slugify = require('slug')

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  addedBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  likeCount: {type: Number, default: 0},
  description: { type: String, required: true },
  helpDescription: { type: String },
  categories: [{type: String}],
  meta: {
    projectUrl: {type: String, required: true, unique: true},
    homepage: {type: String}
  }
}, {timestamps: true})

ProjectSchema.plugin(uniqueValidator, {message: 'is already taken'})

ProjectSchema.pre('validate', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title)
  }
  next()
})

ProjectSchema.methods.updateLikeCount = function () {
  let project = this

}

mongoose.model('Project', ProjectSchema)
