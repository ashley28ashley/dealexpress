const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hot', 'cold'],
    required: [true, 'Le type de vote est requis']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


voteSchema.index({ userId: 1, dealId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);