const express = require('express');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');
require('../models/Request'); // ✅ ensure Request model is registered

const router = express.Router();

const STATUS = {
  AVAILABLE: 'Available',
  PICKED: 'Picked',
  DELIVERED: 'Delivered'
};

// ============================
// 🥗 Create a New Donation
// ============================
router.post('/', async (req, res) => {
  console.log("📦 Incoming donation payload:", req.body);

  try {
    const {
      donor, foodItem, foodType, quantity, packaging, location,
      foodPreparedDate, donationAvailableDate, expiryDate,
      pickupStartTime, pickupEndTime, servings, contactNumber,
      storageInstructions, specialNotes, isRefrigerated, coordinates,
      ngoRequestId // ✅ Add this line
    } = req.body;

    if (!donor || !foodItem || !quantity || !location || !expiryDate || !foodPreparedDate || !donationAvailableDate) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    let ngoDetails;
    let ngoRequest;
    if (ngoRequestId && mongoose.Types.ObjectId.isValid(ngoRequestId)) {
      ngoRequest = await mongoose.model('Request').findById(ngoRequestId);
      if (ngoRequest) {
        ngoDetails = ngoRequest.ngoDetails;
      }
    }

// ✅ Now create donation FIRST
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
  isRefrigerated: isRefrigerated === true || isRefrigerated === 'Yes',
  coordinates,
  ngoRequest: ngoRequestId || null,
  ngoDetails: ngoDetails || null
});


// ✅ THEN update NGO request status and link donation
if (ngoRequest) {
  ngoRequest.status = 'Accepted';
  ngoRequest.donation = donation._id;
  await ngoRequest.save();
}

    console.log('🔍 ngoRequestId:', ngoRequestId);
console.log('📌 ngoDetails from request:', ngoDetails);

    console.log('✅ Donation successfully created:', donation._id);
    res.status(201).json(donation);
  } catch (err) {
    console.error('❌ Error creating donation:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ============================
// 🌍 Reverse Geocoding via OpenStreetMap
// ============================
const fetch = require('node-fetch'); // Ensure this is installed

router.get('/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: {
        'User-Agent': 'reduce-food-waste-app/1.0 (your@email.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding API error');
    }

    const data = await response.json();
    const address = data.display_name || `${lat}, ${lng}`;

    res.status(200).json({ address });
  } catch (err) {
    console.error('❌ Reverse geocoding failed:', err);
    res.status(500).json({ error: 'Failed to fetch address' });
  }
});

// ============================
// ✏️ Update a Donation (Edit)
// ============================
router.patch('/:donationId', async (req, res) => {
  const { donationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    return res.status(400).json({ error: 'Invalid donation ID' });
  }

  try {
    const updateFields = {
      ...req.body,
      preparedAt: req.body.foodPreparedDate,
      availableFrom: req.body.donationAvailableDate,
      isRefrigerated: req.body.isRefrigerated === true || req.body.isRefrigerated === 'Yes',
      updatedAt: new Date()
    };

    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.status(200).json(updatedDonation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update donation', details: err.message });
  }
});

// ============================
// 🗑️ Delete a Donation
// ============================
router.delete('/:donationId', async (req, res) => {
  const { donationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    return res.status(400).json({ error: 'Invalid donation ID' });
  }

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    if (donation.status !== STATUS.AVAILABLE) {
      return res.status(400).json({ error: 'Cannot delete donation. It has already been picked or delivered.' });
    }

    await Donation.findByIdAndDelete(donationId);
    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete donation' });
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
    if (!mongoose.Types.ObjectId.isValid(donorId)) {
      return res.status(400).json({ error: 'Invalid donor ID' });
    }

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
    if (filters?.urgency) query.urgency = filters.urgency;
    if (filters?.vehicleAvailable !== '') {
      query.vehicleAvailable = filters.vehicleAvailable === 'true';
    }
    if (filters?.timeSlot) {
      query.pickupStartTime = { $regex: filters.timeSlot, $options: 'i' };
    }

    let donations = await Donation.find(query).populate('donor');

    const toRad = (val) => (val * Math.PI) / 180;
    const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    if (location?.length === 2) {
      donations = donations.map(d => {
        if (d.coordinates?.lat && d.coordinates?.lng) {
          const dist = getDistanceInKm(location[0], location[1], d.coordinates.lat, d.coordinates.lng);
          return { ...d._doc, distance: dist.toFixed(2) };
        }
        return null;
      }).filter(Boolean);

      if (filters?.maxDistance) {
        donations = donations.filter(d => parseFloat(d.distance) <= parseFloat(filters.maxDistance));
      }

      donations.sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json(donations);
  } catch (err) {
    console.error('❌ Error in nearby donations:', err.message);
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

    donation.status = STATUS.DELIVERED;
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
