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
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ],
  },

  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    required: function () {
      return !this.googleId;
    },
    select: false,
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

  contactNumber: {
    type: String,
    trim: true,
  },

  location: {
    type: String,
    trim: true,
  },

  address: {
    type: String,
    trim: true,
  },

  // Volunteer specific
  vehicleAvailable: {
    type: String,
    enum: ['Yes', 'No'],
  },
  availableStartTime: {
    type: String,
  },
  availableEndTime: {
    type: String,
  },

  // NGO specific
  ngoRegNumber: {
    type: String,
    trim: true,
  },
  ngoType: {
    type: String,
    trim: true,
  },
  dailyFoodNeed: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  versionKey: false,
});

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('A user with this email already exists.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
