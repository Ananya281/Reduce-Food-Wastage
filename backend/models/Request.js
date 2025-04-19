const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  foodItem: {
    type: String,
    required: true,
    trim: true
  },
foodType: {
  type: String,
  required: true,
  trim: true,
  enum: ['Veg', 'Non-Veg', 'Cooked', 'Canned', 'Packaged', 'Raw', 'Other']
},
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent'],
    default: 'Normal'
  },
  preferredDate: {
    type: Date,
    default: null
  },
  contactNumber: {
    type: String,
    match: /^[6-9]\d{9}$/, // Optional: basic validation for Indian mobile format
    default: ''
  },
  specialNotes: {
    type: String,
    trim: true,
    default: ''
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// 🔁 Automatically update `updatedAt` field on save
requestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', requestSchema);
