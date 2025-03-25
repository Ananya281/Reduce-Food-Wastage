const express = require('express');
const Donation = require('../models/Donation');

const router = express.Router();

// Create a new donation
router.post('/', async (req, res) => {
  try {
    const { donor, foodItem, quantity, location, expiryDate } = req.body;

    // Check for required fields
    if (!donor || !foodItem || !quantity || !location || !expiryDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const donation = await Donation.create({
      donor,
      foodItem,
      quantity,
      location,
      expiryDate,
    });

    res.status(201).json(donation);
  } catch (err) {
    console.error('Error creating donation:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().populate('donor');
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
