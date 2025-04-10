const express = require('express');
const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');

const router = express.Router();

/**
 * 🔐 Register a new volunteer
 */
router.post('/', async (req, res) => {
  try {
    const { user } = req.body;

    if (!user || !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: 'Valid user ID is required.' });
    }

    // Prevent duplicate registration
    let volunteer = await Volunteer.findOne({ user });
    if (volunteer) {
      return res.status(200).json(volunteer); // Already exists
    }

    // Create new volunteer
    volunteer = await Volunteer.create({ user });
    res.status(201).json(volunteer);
  } catch (err) {
    console.error('❌ Volunteer register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📋 Get all volunteers (admin/debug)
 */
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('user', 'fullName email')
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

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ error: 'Invalid donation ID' });
    }    

    // Prevent double acceptance
    const existingPickup = await Pickup.findOne({ volunteer, donation: donationId });
    if (existingPickup) {
      return res.status(409).json({ error: 'Already accepted this pickup' });
    }    

    // Update donation status and assign volunteer
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      {
        status: 'Picked',
        volunteer,
        pickedAt: new Date()
      },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Create pickup record
    await Pickup.create({
      volunteer,
      donation: donationId,
      acceptedAt: new Date()
    });

    res.status(200).json({
      _id: updatedDonation._id,
      status: updatedDonation.status,
      message: 'Donation accepted'
    });
  } catch (err) {
    console.error('❌ Accept donation error:', err.message);
    res.status(500).json({ error: 'Failed to accept donation' });
  }
});

/**
 * 📦 Get all pickups for a specific volunteer
 * Optionally includes donor info and location
 */
router.get('/:id/pickups', async (req, res) => {
  const volunteerId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    return res.status(400).json({ error: 'Invalid volunteer ID' });
  }

  try {
    const pickups = await Pickup.find({ volunteer: volunteerId }).populate({
      path: 'donation',
      populate: {
        path: 'donor',
        select: 'fullName contactNumber'
      },
      select: 'foodItem quantity location expiryDate status donor foodType pickupTimeStart pickupTimeEnd foodPreparedAt foodAvailableFrom servings isRefrigerated specialNotes coordinates'
    });

    const formatted = pickups
      .filter(p => p.donation)
      .map(p => ({
        ...p.donation._doc,
        pickupId: p._id,
        donationId: p.donation._id,
        acceptedAt: p.acceptedAt
      }));
  

    res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ Error fetching volunteer pickups:', err.message);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
});

/**
 * ✅ Get volunteer availability
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid volunteer ID' });
  }

  try {
    const volunteer = await Volunteer.findOne({ user: id });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    res.status(200).json({ availability: volunteer.availability });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

/**
 * 🔄 Toggle volunteer availability
 */
router.patch('/:id/toggleAvailability', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid volunteer ID' });
  }

  try {
    const volunteer = await Volunteer.findOne({ user: id });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    volunteer.availability = !volunteer.availability;
    await volunteer.save();

    res.status(200).json({ availability: volunteer.availability });
  } catch (err) {
    console.error('❌ Error toggling availability:', err.message);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

/**
 * ✅ Mark a donation as Delivered (simple status update only)
 */
router.patch('/deliver/:donationId', async (req, res) => {
  const donationId = req.params.donationId.trim(); // ✅ Trim newline/space

  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    return res.status(400).json({ error: `Invalid donation ID: ${donationId}` });
  }

  try {
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { status: 'Delivered', deliveredAt: new Date() },
      { new: true, runValidators: false }
    );

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.status(200).json({ success: true, message: 'Donation marked as delivered' });
  } catch (err) {
    console.error('❌ Error marking donation as delivered:', err.message);
    res.status(500).json({ error: 'Failed to mark donation as delivered' });
  }
});



module.exports = router;
