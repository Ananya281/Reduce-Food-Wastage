const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { // one-to-one
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  contactNumber: { type: String, match: /^\d{10}$/, required: true },
  currentLocation: { type: String },
  coordinates: { // 📍 for future features
    lat: Number,
    lng: Number
  },
  vehicleAvailable: { type: Boolean, default: false },

  availableStartTime: { type: String },
  availableEndTime: { type: String },
  availability: { type: Boolean, default: true },

  totalPickupsCompleted: { type: Number, default: 0 },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
