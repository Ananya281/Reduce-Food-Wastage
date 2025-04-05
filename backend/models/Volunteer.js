const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensures one-to-one mapping with a user
  },
  assignedDonations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    }
  ],
  availability: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: String,
    trim: true,
    default: ''
  },
  contactNumber: {
    type: String,
    match: /^\d{10}$/, // Allows any 10-digit mobile number
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update `updatedAt` before saving
volunteerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
