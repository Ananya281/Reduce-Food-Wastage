const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
  },

  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    required: function () {
      // Password is required only if Google ID is not present
      return !this.googleId;
    },
    select: false, // Prevent password from being returned in queries
  },

  role: {
    type: String,
    enum: ['Donor', 'NGOs', 'Volunteer'],
    required: [true, 'Role is required'],
  },

  googleId: {
    type: String,
    default: null, // Only present if user registered via Google
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  versionKey: false, // Optional: remove __v field
});
