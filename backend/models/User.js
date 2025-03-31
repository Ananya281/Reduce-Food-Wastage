const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
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
      return !this.googleId; // Required only if not a Google user
    },
    select: false, // Prevent password from being returned in queries
  },

  role: {
    type: String,
    enum: {
      values: ['Donor', 'NGOs', 'Volunteer'],
      message: '{VALUE} is not a valid role',
    },
    required: [true, 'Role is required'],
  },

  googleId: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  versionKey: false,
});

module.exports = mongoose.model('User', userSchema);
