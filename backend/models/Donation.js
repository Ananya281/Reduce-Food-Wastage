const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foodItem: String,
  quantity: String,
  location: String,
  expiryDate: Date,
  status: { type: String, enum: ['Available', 'In Transit', 'Delivered'], default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
