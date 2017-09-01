const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
  {
    discussion_id: {type: mongoose.Schema.ObjectId, ref: 'Project', required: true},
    author: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
    body: {type: String, required: true}
  },
  {timestamps: true}
)

CommentSchema.methods.toJSONP = function (user) {
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSON(user)
  }
}

module.exports = mongoose.model('Comment', CommentSchema)
