const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request');

const router = express.Router();

// ============================
// 🆕 Create a New Request
// ============================
router.post('/', async (req, res) => {
  try {
    const {
      foodType,
      quantity,
      location,
      urgency,
      receiver,
      preferredDate,
      contactNumber,
      specialNotes
    } = req.body;

    console.log('📦 New request received:', req.body);

    if (!foodType || !quantity || !location || !urgency || !receiver) {
      return res.status(400).json({
        error: 'Missing required fields.',
        missingFields: {
          foodType: !!foodType,
          quantity: !!quantity,
          location: !!location,
          urgency: !!urgency,
          receiver: !!receiver
        }
      });
    }

    const newRequest = await Request.create({
      foodType,
      quantity,
      location,
      urgency,
      receiver,
      preferredDate: preferredDate || null,
      contactNumber: contactNumber || '',
      specialNotes: specialNotes || '',
      status: 'Pending'
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error('❌ Error creating request:', err.message);
    res.status(500).json({ error: 'Server error while creating request.' });
  }
});

// ============================
// 📥 Get All Requests or by Receiver
// /api/requests?receiver=NGO_ID
// ============================
router.get('/', async (req, res) => {
  try {
    const { receiver } = req.query;

    const filter = receiver ? { receiver } : {};
    if (receiver && !mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({ error: 'Invalid receiver ID format.' });
    }

    const requests = await Request.find(filter)
      .populate('receiver', 'fullName email role')
      .populate('donation', 'foodItem quantity location status')
      .sort({ requestedAt: -1 })
      .lean();

    res.status(200).json(requests);
  } catch (error) {
    console.error('❌ Error fetching requests:', error.message);
    res.status(500).json({ error: 'Server error while fetching requests.' });
  }
});

// ============================
// 📍 Get Previous Unique Locations by Receiver
// /api/requests/locations/:receiverId
// ============================
router.get('/locations/:receiverId', async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: 'Invalid receiver ID format.' });
    }

    const requests = await Request.find({ receiver: receiverId }).select('location').sort({ requestedAt: -1 });

    const uniqueLocations = [...new Set(requests.map(req => req.location))];
    res.status(200).json(uniqueLocations);
  } catch (err) {
    console.error('❌ Error fetching unique locations:', err.message);
    res.status(500).json({ error: 'Server error while fetching locations.' });
  }
});

module.exports = router;
