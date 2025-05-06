const express = require('express');
const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const NgoRequest = require('../models/NgoRequest'); // ✅ Import the new model
const nodemailer = require('nodemailer');

const User = require('../models/User'); // already exists

const router = express.Router();

router.post('/nearby-ngos', async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (
      !coordinates ||
      typeof coordinates.lat !== 'number' ||
      typeof coordinates.lng !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid or missing coordinates' });
    }

    const nearbyNGOs = await User.find({
      role: 'NGOs',
      locationCoordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat],
          },
          $maxDistance: 5000,
        },
      },
    }).select('ngoName ngoAddress contactNumber email locationCoordinates');

    res.json(nearbyNGOs);
  } catch (err) {
    console.error('❌ Error fetching nearby NGOs:', err.message);
    res.status(500).json({ error: 'Failed to fetch nearby NGOs' });
  }
});

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
      populate: [
        { path: 'donor', select: 'fullName contactNumber' }
      ],
      select: 'foodItem quantity location expiryDate status donor foodType pickupTimeStart pickupTimeEnd foodPreparedAt foodAvailableFrom servings isRefrigerated specialNotes coordinates ngoDetails'
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
 * ✨ Volunteer recommends an NGO for a donation
 */
router.patch('/recommend-ngo/:donationId', async (req, res) => {
  const { donationId } = req.params;
  const { ngoId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(donationId) || !mongoose.Types.ObjectId.isValid(ngoId)) {
    return res.status(400).json({ error: 'Invalid Donation ID or NGO ID' });
  }

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    // Update donation with selected NGO details
    donation.ngoDetails = {
      name: 'Pending NGO Approval',
      address: '',
      type: '',
      contactEmail: '',
      ngoId: ngoId  // ✅ Save the NGO ID
    };
    await donation.save();

    res.status(200).json({ success: true, message: 'NGO recommendation submitted' });
  } catch (err) {
    console.error('❌ Error recommending NGO:', err.message);
    res.status(500).json({ error: 'Failed to recommend NGO' });
  }
});



// 📍 Volunteer recommends an NGO for a donation
// Add this to volunteerRoutes.js or relevant router
router.post('/request-ngo', async (req, res) => {
  const { volunteerId, donationId, ngoId } = req.body;

  if (!volunteerId || !donationId || !ngoId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'NGOs') {
      return res.status(404).json({ error: "NGO not found." });
    }

    const donation = await Donation.findById(donationId);
    console.log("NGO:", ngo); // ✅ Good
console.log("Donation:", donation); // ✅ Good
    if (!donation) {
      return res.status(404).json({ error: "Donation not found." });
    }

    // ✅ Update donation with NGO details
    donation.ngoDetails = {
      ngoId: ngo._id,
      ngoName: ngo.ngoName,
      ngoEmail: ngo.email,
      ngoContact: ngo.contactNumber,
    };
    await donation.save();
    

    // ✅ Create a corresponding NGO Request so it appears in NGO Dashboard
    await NgoRequest.create({
      receiver: ngo._id,
      ngo: ngo._id, // ✅ REQUIRED FIELD
      volunteer: volunteerId, // ✅ REQUIRED FIELD
      foodItem: donation.foodItem,
      foodType: donation.foodType,
      quantity: donation.quantity,
      urgency: 'Medium', // You can make this dynamic if needed
      preferredDate: new Date(), // or make it flexible
      location: donation.location,
      status: 'Pending',
      createdBy: volunteerId,       // track which volunteer submitted this
      donation: donation._id        // optional back-reference
    });

    // ✅ Send Email to NGO
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Reduce Food Wastage" <${process.env.GMAIL_USER}>`,
      to: ngo.email,
      subject: `🍽️ New Donation Recommended`,
      html: `
        <p>Dear ${ngo.ngoName},</p>
        <p>A donation has been assigned to your NGO. Please check the dashboard and respond to the request.</p>
        <p>Thanks,<br/>Reduce Food Wastage Team</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /request-ngo:", err);
    res.status(500).json({ error: "Internal Server Error while recommending NGO." });
  }
});




module.exports = router;
