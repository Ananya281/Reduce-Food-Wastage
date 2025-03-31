const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: function () {
      // If user is using Google OAuth, password is not required
      return !this.googleId;
    },
    minlength: 6,
  },

  role: {
    type: String,
    enum: ['Donor', 'NGOs', 'Volunteer'],
    required: true,
  },

  googleId: {
    type: String,
    default: null, // Used to store Google user ID (if available)
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);
