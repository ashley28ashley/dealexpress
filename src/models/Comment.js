const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est requis'],
    trim: true,
    minlength: [3, 'Le commentaire doit contenir au moins 3 caractères'],
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.index({ dealId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);