const express = require('express');
const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');

const router = express.Router();

/**
 * 🔐 Register or update a volunteer
 */
router.post('/', async (req, res) => {
  try {
    const { user, assignedDonations = [] } = req.body;

    if (!user || !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: 'Valid user ID is required.' });
    }

    let volunteer = await Volunteer.findOne({ user });

    if (volunteer) {
      volunteer.assignedDonations = assignedDonations.length
        ? assignedDonations
        : volunteer.assignedDonations;
      await volunteer.save();
    } else {
      volunteer = await Volunteer.create({ user, assignedDonations });
    }

    res.status(201).json(volunteer);
  } catch (err) {
    console.error('❌ Volunteer register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📋 Get all volunteers (admin/debug route)
 */
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('user', 'fullName email')
      .populate('assignedDonations', 'foodItem location status')
      .lean();

    res.status(200).json(volunteers);
  } catch (err) {
    console.error('❌ Error fetching volunteers:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🚚 Accept a donation by a volunteer
 */
router.patch('/accept/:id', async (req, res) => {
  try {
    const donationId = req.params.id;
    const { volunteer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(donationId) || !mongoose.Types.ObjectId.isValid(volunteer)) {
      return res.status(400).json({ error: 'Invalid donation or volunteer ID' });
    }

    // Check if already picked up
    const existingPickup = await Pickup.findOne({ volunteer, donation: donationId });
    if (existingPickup) {
      return res.status(409).json({ error: 'Already accepted this pickup' });
    }

    // Update the donation
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { status: 'In Transit', volunteer },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Update volunteer document
    const vol = await Volunteer.findOne({ user: volunteer });
    if (vol && !vol.assignedDonations.includes(donationId)) {
      vol.assignedDonations.push(donationId);
      await vol.save();
    }

    // Save pickup with timestamp
    const pickupDoc = await Pickup.create({
      volunteer,
      donation: donationId,
      acceptedAt: new Date()
    });

    res.status(200).json(updatedDonation);
  } catch (err) {
    console.error('❌ Accept donation error:', err.message);
    res.status(500).json({ error: 'Failed to accept donation' });
  }
});

/**
 * 📦 Get all pickups for a specific volunteer
 */
router.get('/:id/pickups', async (req, res) => {
  const volunteerId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID' });
  }

  try {
    const pickups = await Pickup.find({ volunteer: volunteerId }).populate({
      path: 'donation',
      select: 'foodItem quantity location expiryDate status'
    });

    const formatted = pickups
      .filter(p => p.donation)
      .map(p => ({
        ...p.donation._doc,
        pickupId: p._id,
        acceptedAt: p.acceptedAt
      }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ Error fetching volunteer pickups:', err.message);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
});

module.exports = router;
