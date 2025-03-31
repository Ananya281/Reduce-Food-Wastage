const express = require('express');
const Request = require('../models/Request');

const router = express.Router();

// ✅ Create a new request
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

    // ✅ Log for debugging
    console.log('📦 New request received:', req.body);

    // ✅ Validate required fields
    if (!foodType || !quantity || !location || !urgency || !receiver) {
      return res.status(400).json({
        error: 'All fields (foodType, quantity, location, urgency, receiver) are required.',
        missingFields: {
          foodType: !!foodType,
          quantity: !!quantity,
          location: !!location,
          urgency: !!urgency,
          receiver: !!receiver
        }
      });
    }

    const request = await Request.create({
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

    res.status(201).json(request);
  } catch (err) {
    console.error('❌ Error creating request:', err.message);
    res.status(500).json({ error: 'Server error while creating request.' });
  }
});

// ✅ Get all requests OR requests filtered by receiver ID
// Usage: /api/requests?receiver=NGO_ID
router.get('/', async (req, res) => {
  try {
    const { receiver } = req.query;
    const filter = receiver ? { receiver } : {};
    const requests = await Request.find(filter)
      .populate('receiver')
      .populate('donation')
      .sort({ requestedAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching requests:', error.message);
    res.status(500).json({ error: 'Server error while fetching requests.' });
  }
});

module.exports = router;
