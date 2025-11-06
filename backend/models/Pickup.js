const mongoose = require('mongoose'); // ✅ ADD THIS LINE

const pickupSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  acceptedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Accepted', 'In Transit', 'Delivered'],
    default: 'Accepted'
  }
});

pickupSchema.index({ volunteer: 1 });      
pickupSchema.index({ donation: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);
