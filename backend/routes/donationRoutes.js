const express = require('express');
const Donation = require('../models/Donation');

const router = express.Router();

// ============================
// 🥗 Create a New Donation
// ============================
router.post('/', async (req, res) => {
  console.log("📦 Incoming donation payload:", req.body);  // Add this log

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
      storageInstructions
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
      storageInstructions
    });

    res.status(201).json(donation);
  } catch (err) {
    console.error('❌ Error creating donation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================
// 📥 Get All Donations
// ============================
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().populate('donor');
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

module.exports = router;
