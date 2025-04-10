const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // one-to-one mapping with User
  },

  contactNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/, // ensures 10-digit mobile number
    trim: true
  },

  currentLocation: {
    type: String,
    trim: true,
    required: true
  },

  locationCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  vehicleAvailable: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },

  availableStartTime: {
    type: String,
    required: true
  },

  availableEndTime: {
    type: String,
    required: true
  },

  availability: {
    type: Boolean,
    default: true
  },

  totalPickupsCompleted: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
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

// 📍 Geo-index for location-based filtering
volunteerSchema.index({ locationCoordinates: '2dsphere' });

// 🕒 Auto-update `updatedAt`
volunteerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
