const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedDonations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
  availability: { type: Boolean, default: true }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
