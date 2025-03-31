const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  foodType: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent'],
    default: 'Normal',
  },
  preferredDate: {
    type: Date,
    default: null,
  },
  contactNumber: {
    type: String,
    default: '',
  },
  specialNotes: {
    type: String,
    default: '',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Request', requestSchema);
