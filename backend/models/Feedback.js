const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt fields automatically
});

// ✅ Prevents duplicate feedback for the same donation by the same volunteer
feedbackSchema.index({ volunteer: 1, donation: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
