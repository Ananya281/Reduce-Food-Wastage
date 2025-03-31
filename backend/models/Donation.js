const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
foodType: {
  type: String,
  enum: ['Veg', 'Non-Veg', 'Canned', 'Cooked', 'Packaged', 'Raw', 'Other'], // ← added your used values
  default: 'Veg'
}
,
  quantity: {
    type: String,
    required: true
  },
  packaging: {
    type: String, // e.g., 'Plastic Box', 'Paper Bag', etc.
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  contactNumber: {
    type: String,
    match: /^[6-9]\d{9}$/ // Optional: Validate Indian phone format
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'In Transit', 'Delivered'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// 🔁 Update `updatedAt` before saving
donationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
