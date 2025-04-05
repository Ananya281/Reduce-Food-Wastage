const mongoose = require('mongoose');

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
  }
});

module.exports = mongoose.model('Pickup', pickupSchema);
