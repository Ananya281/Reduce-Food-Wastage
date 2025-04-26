const mongoose = require('mongoose'); // ✅ ADD THIS LINE

const pickupSchema = new mongoose.Schema({
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
  acceptedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  feedback: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Pickup', pickupSchema);
