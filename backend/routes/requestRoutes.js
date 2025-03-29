const express = require('express');
const Request = require('../models/Request');

const router = express.Router();

// ✅ Create a new request
router.post('/', async (req, res) => {
  try {
    console.log("🚀 Incoming form data:", req.body); // ✅ Add this
    const { foodType, quantity, location, urgency, receiver } = req.body;

    // ✅ Log incoming request for debugging
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

    // ✅ Create and save the request
    const request = await Request.create({
      foodType,
      quantity,
      location,
      urgency,
      receiver,
      status: 'Pending' // Optional: default fallback (should be in schema too)
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
  const { receiver } = req.query;
  const filter = receiver ? { receiver } : {};
  const requests = await Request.find(filter)
    .populate('receiver')
    .populate('donation')
    .sort({ createdAt: -1 });
  res.json(requests);
});


module.exports = router;
