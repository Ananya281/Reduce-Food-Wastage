const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ['Donor', 'NGOs', 'Volunteer'], required: true },
});

module.exports = mongoose.model('User', userSchema);
