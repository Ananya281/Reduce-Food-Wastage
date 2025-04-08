const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodItem: {
    type: String,
    required: true,
    trim: true
  },
  foodType: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Canned', 'Cooked', 'Packaged', 'Raw', 'Other'],
    default: 'Veg'
  },
  quantity: {
    type: String,
    required: true
  },
  packaging: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  preparedAt: {
    type: Date,
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  pickupTimeStart: {
    type: String,
    trim: true
  },
  pickupTimeEnd: {
    type: String,
    trim: true
  },
  servings: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    match: /^\d{10}$/,
    required: false
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  specialNotes: {
    type: String,
    trim: true
  },
  isRefrigerated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Available', 'Picked', 'Delivered'],
    default: 'Available'
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

donationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
