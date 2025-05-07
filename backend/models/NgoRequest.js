const mongoose = require('mongoose');

const ngoRequestSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // NGO is a User
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

ngoRequestSchema.index({ ngo: 1 });        // ✅ NEW
ngoRequestSchema.index({ volunteer: 1 });  // ✅ NEW
ngoRequestSchema.index({ donation: 1 });   // ✅ NEW

module.exports = mongoose.model('NgoRequest', ngoRequestSchema);
