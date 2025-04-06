const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // one-to-one mapping
  },
  availability: {
    type: Boolean,
    default: true
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
      default: [0, 0]
    }
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

// Index for geospatial filtering (e.g., nearby donations)
volunteerSchema.index({ locationCoordinates: '2dsphere' });

// Auto-update updatedAt
volunteerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
