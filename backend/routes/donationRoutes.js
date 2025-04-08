const express = require('express');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');

const router = express.Router();

const STATUS = {
  AVAILABLE: 'Available',   // ← capital A
  PICKED: 'Picked',         // ← lowercase
  DELIVERED: 'Delivered'    // ← lowercase ✅
};

// ============================
// 🥗 Create a New Donation
// ============================
router.post('/', async (req, res) => {
  console.log("📦 Incoming donation payload:", req.body);

  try {
    const {
      donor,
      foodItem,
      foodType,
      quantity,
      packaging,
      location,
      foodPreparedDate,
      donationAvailableDate,
      expiryDate,
      pickupStartTime,
      pickupEndTime,
      servings,
      contactNumber,
      storageInstructions,
      specialNotes,
      isRefrigerated
    } = req.body;

    if (!donor || !foodItem || !quantity || !location || !expiryDate || !foodPreparedDate || !donationAvailableDate) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const donation = await Donation.create({
      donor,
      foodItem,
      foodType,
      quantity,
      packaging,
      location,
      preparedAt: foodPreparedDate,
      availableFrom: donationAvailableDate,
      expiryDate,
      pickupStartTime,
      pickupEndTime,
      servings,
      contactNumber,
      storageInstructions,
      specialNotes,
      isRefrigerated: isRefrigerated === 'Yes'
    });

    console.log('✅ Donation successfully created:', donation._id);
    res.status(201).json(donation);
  } catch (err) {
    console.error('❌ Error creating donation:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ============================
// 📥 Get All Donations (optional filter by status)
// ============================
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const donations = await Donation.find(query).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching donations' });
  }
});

// ============================
// 📥 Get Donations by Donor ID
// ============================
router.get('/donor/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await Donation.find({ donor: donorId }).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching donor donations' });
  }
});

// ============================
// 📍 Get Unique Previous Locations
// ============================
router.get('/locations/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await Donation.find({ donor: donorId }).select('location').sort({ createdAt: -1 });
    const uniqueLocations = [...new Set(donations.map(d => d.location?.trim()).filter(Boolean))];
    res.status(200).json(uniqueLocations);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching donor locations' });
  }
});

// ============================
// 📍 Get Nearby Donations for Volunteer
// ============================
router.post('/nearby', async (req, res) => {
  try {
    const { userId, location, filters } = req.body;
    const query = { status: STATUS.AVAILABLE };

    if (filters?.foodType) query.foodType = filters.foodType;
    if (filters?.quantity) query.quantity = { $regex: filters.quantity, $options: 'i' };

    const donations = await Donation.find(query).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching nearby donations' });
  }
});

// ============================
// ✅ Mark Donation as Delivered + Save Feedback
// ============================
router.patch('/complete/:id', async (req, res) => {
  const donationId = req.params.id;
  const { feedback, volunteer } = req.body;

  if (!donationId || !feedback || typeof feedback.rating !== 'number') {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.status = STATUS.DELIVERED; // ✅ use constant
    donation.deliveredAt = new Date();
    await donation.save();

    const existingFeedback = await Feedback.findOne({ donation: donationId, volunteer });
    if (existingFeedback) {
      return res.status(409).json({ error: 'Feedback already submitted for this donation by this volunteer.' });
    }

    await Feedback.create({
      volunteer,
      donation: donation._id,
      rating: feedback.rating,
      comment: feedback.comment || ''
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ============================
// 📊 Get All Feedbacks with Populated Info
// ============================
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('donation')
      .populate('volunteer', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

module.exports = router;
