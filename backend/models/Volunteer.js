const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // ✅ Ensures one-to-one mapping with a user
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
    default: '', // 📍 Can be used later for route optimization
    trim: true
  },
  contactNumber: {
    type: String,
    match: /^[6-9]\d{9}$/, // Optional: Indian mobile number format
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 🔁 Auto-update timestamp
volunteerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
