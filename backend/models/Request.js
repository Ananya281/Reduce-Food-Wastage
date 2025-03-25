const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  urgencyLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  message: String,
  requestedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
