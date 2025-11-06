const mongoose = require('mongoose');

const ngoRequestSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, 
  ref: 'Volunteer', required: true },
  donation: { type: mongoose.Schema.Types.ObjectId, 
  ref: 'Donation', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
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

ngoRequestSchema.index({ ngo: 1 });        
ngoRequestSchema.index({ volunteer: 1 });
ngoRequestSchema.index({ donation: 1 });

module.exports = mongoose.model('NgoRequest', ngoRequestSchema);



//Not USEFUL
//For Future Reference Only
//When NGO Request <-> Specific Donation Feature is needed
//NGO requests specific donations checked from Donation list available
//Till now, according to current flow, not have NGOs selecting donations