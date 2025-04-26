require('dotenv').config(); // ✅ Load environment variables
const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const Request = require('./models/Request');

async function fixNgoDetails() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const donations = await Donation.find({ ngoRequest: { $ne: null }, ngoDetails: null });

  for (let donation of donations) {
    const ngoRequest = await Request.findById(donation.ngoRequest).populate('receiver');
    if (ngoRequest && ngoRequest.receiver) {
      donation.ngoDetails = {
        name: ngoRequest.receiver.ngoName,
        address: ngoRequest.receiver.ngoAddress,
        type: ngoRequest.receiver.ngoType,
        contactEmail: ngoRequest.receiver.email
      };
      await donation.save();
      console.log(`✅ Updated donation: ${donation._id}`);
    }
  }

  console.log('🎯 Fixing complete');
  process.exit(); // ✅ Exit after done
}

fixNgoDetails();
