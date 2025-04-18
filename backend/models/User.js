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
    required: function () {
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters'],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
      'Password must include uppercase, lowercase, number, and special character'
    ],
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
    required: function () {
      return this.role === 'Volunteer' || this.role === 'NGOs';
    },
  },

  // Fields specific to NGOs only
  ngoRegNumber: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  ngoType: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  dailyFoodNeed: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  ngoName: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  ngoAddress: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  ngoOperatingDays: {
    type: [String],
    required: function () {
      return this.role === 'NGOs';
    },
  },
  ngoStartTime: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  ngoEndTime: {
    type: String,
    trim: true,
    required: function () {
      return this.role === 'NGOs';
    },
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  versionKey: false,
});

// Handle duplicate email error
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('A user with this email already exists.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
