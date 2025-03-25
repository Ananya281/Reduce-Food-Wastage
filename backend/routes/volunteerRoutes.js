// File: backend/routes/volunteerRoutes.js
const express = require('express');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');

const router = express.Router();

// Register or update volunteer profile
router.post('/', async (req, res) => {
  try {
    const { user, assignedDonations } = req.body;
    let volunteer = await Volunteer.findOne({ user });

    if (volunteer) {
      volunteer.assignedDonations = assignedDonations || volunteer.assignedDonations;
      await volunteer.save();
    } else {
      volunteer = await Volunteer.create({ user, assignedDonations });
    }

    res.status(201).json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user').populate('assignedDonations');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a donation by volunteer
router.patch('/accept/:id', async (req, res) => {
  try {
    const donationId = req.params.id;
    const { volunteer } = req.body;

    // Update donation to set status and assigned volunteer
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { status: 'In Transit', volunteer },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Add donation to volunteer profile (optional)
    let vol = await Volunteer.findOne({ user: volunteer });
    if (vol) {
      if (!vol.assignedDonations.includes(donationId)) {
        vol.assignedDonations.push(donationId);
        await vol.save();
      }
    }

    res.json(updatedDonation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept donation' });
  }
});

module.exports = router;
