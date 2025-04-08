const express = require('express');
const Donation = require('../models/Donation');

const router = express.Router();

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
      expiryDate,
      contactNumber,
      storageInstructions,
      pickupTimeStart,
      pickupTimeEnd,
      servings,
      specialNotes,
      isRefrigerated
    } = req.body;

    if (!donor || !foodItem || !quantity || !location || !expiryDate) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const donation = await Donation.create({
      donor,
      foodItem,
      foodType,
      quantity,
      packaging,
      location,
      expiryDate,
      contactNumber,
      storageInstructions,
      pickupTimeStart,
      pickupTimeEnd,
      servings,
      specialNotes,
      isRefrigerated
    });

    res.status(201).json(donation);
  } catch (err) {
    console.error('❌ Error creating donation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================
// 📥 Get All Donations (optionally filter by status)
// ============================
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const donations = await Donation.find(query).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    console.error('❌ Error fetching all donations:', err);
    res.status(500).json({ error: 'Server error while fetching donations' });
  }
});

// ============================
// 📥 Get Donations by Donor ID
// ============================
router.get('/donor/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID required' });
    }

    const donations = await Donation.find({ donor: donorId }).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    console.error('❌ Error fetching donor-specific donations:', err);
    res.status(500).json({ error: 'Server error while fetching donor donations' });
  }
});

// ============================
// 📍 Get Unique Previous Locations
// ============================
router.get('/locations/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID required' });
    }

    const donations = await Donation.find({ donor: donorId }).select('location').sort({ createdAt: -1 });
    const uniqueLocations = [...new Set(donations.map(d => d.location?.trim()).filter(Boolean))];

    res.status(200).json(uniqueLocations);
  } catch (err) {
    console.error('❌ Error fetching donor locations:', err);
    res.status(500).json({ error: 'Server error while fetching donor locations' });
  }
});

// ============================
// 📍 Get Nearby Donations for Volunteer
// ============================
router.post('/nearby', async (req, res) => {
  try {
    const { userId, location, filters } = req.body;
    console.log('📍 Nearby route hit with:', req.body);

    const query = { status: 'Available' };

    if (filters?.foodType) {
      query.foodType = filters.foodType;
    }

    if (filters?.quantity) {
      // Optional: match only if quantity is at least the entered number
      query.quantity = { $regex: filters.quantity, $options: 'i' };
    }

    if (filters?.urgency) {
      // You can define urgency field in the future, and match here
    }

    const donations = await Donation.find(query).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    console.error('❌ Nearby donation fetch error:', err);
    res.status(500).json({ error: 'Error fetching nearby donations' });
  }
});

module.exports = router;
