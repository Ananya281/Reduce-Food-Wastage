const express = require('express');
const Donation = require('../models/Donation');

const router = express.Router();

// ✅ Create a new donation
router.post('/', async (req, res) => {
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
    console.error('Error creating donation:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get donations by donor ID
router.get('/donor/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await Donation.find({ donor: donorId }).populate('donor');
    res.status(200).json(donations);
  } catch (err) {
    console.error('Error fetching donor-specific donations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Get unique previous locations for a donor
router.get('/locations/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await Donation.find({ donor: donorId }).sort({ createdAt: -1 });

    const uniqueLocations = [...new Set(donations.map(d => d.location))];
    res.status(200).json(uniqueLocations);
  } catch (err) {
    console.error('Error fetching donor locations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
