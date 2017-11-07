const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  body: {type: String, required: true},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'}
}, {timestamps: true})

CommentSchema.methods.toCommentJSON = function () {
  return {
    id: this._id,
    body: this.body,
    created_at: this.createdAt,
    author: this.author.toProfileJSON()
  }
}

module.exports = mongoose.model('Comment', CommentSchema)
