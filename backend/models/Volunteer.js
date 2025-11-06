const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  currentLocation: { type: String },

  vehicleAvailable: { type: Boolean, default: false },

  availableStartTime: { type: String },
  availableEndTime: { type: String },
  availability: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

volunteerSchema.index({ user: 1 });
volunteerSchema.index({ availability: 1 });
volunteerSchema.index({ vehicleAvailable: 1 });

module.exports = mongoose.model('Volunteer', volunteerSchema);


//Optional or Partially Useful