const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodItem: {
    type: String,
    required: true
  },
  foodType: {
    type: String,
    enum: ['Cooked', 'Packaged', 'Raw'],
    default: 'Cooked'
  },
  quantity: {
    type: String,
    required: true
  },
  packaging: {
    type: String // e.g., 'Plastic Box', 'Paper Bag', etc.
  },
  location: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  contactNumber: {
    type: String // Optional, for delivery coordination
  },
  storageInstructions: {
    type: String // Optional, e.g., "Keep refrigerated", etc.
  },
  status: {
    type: String,
    enum: ['Available', 'In Transit', 'Delivered'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
