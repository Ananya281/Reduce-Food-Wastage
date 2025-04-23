const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const User = require('../models/User'); // ✅ Make sure this is at the top if not already

const router = express.Router();

// ============================
// 🆕 Create a New Request
// ============================
router.post('/', async (req, res) => {
  try {
    const {
      foodItem,
      foodType,
      quantity,
      urgency,
      receiver,
      preferredDate,
      contactNumber,
      specialNotes
    } = req.body;

    console.log('📦 New request received:', req.body);

    if (!foodItem || !foodType || !quantity || !urgency || !receiver) {
      return res.status(400).json({
        error: 'Missing required fields.',
        missingFields: {
          foodItem: !!foodItem,
          foodType: !!foodType,
          quantity: !!quantity,
          urgency: !!urgency,
          receiver: !!receiver
        }
      });
    }

    // 🧠 Fetch NGO user to store snapshot of their details
    const ngoUser = await User.findById(receiver);
    if (!ngoUser || ngoUser.role !== 'NGOs') {
      return res.status(400).json({ error: 'Receiver must be a valid NGO' });
    }

    // ✅ Safely assign location from NGO profile
    const location = ngoUser.ngoAddress || 'Location not specified';

    const newRequest = await Request.create({
      foodItem,
      foodType,
      quantity,
      urgency,
      receiver,
      location,
      preferredDate: preferredDate || null,
      contactNumber: contactNumber || '',
      specialNotes: specialNotes || '',
      status: 'Pending',

      ngoDetails: {
        name: ngoUser.ngoName,
        address: ngoUser.ngoAddress,
        contactNumber: ngoUser.contactNumber,
        type: ngoUser.ngoType,
        dailyFoodNeed: ngoUser.dailyFoodNeed,
        operatingDays: ngoUser.ngoOperatingDays,
        operatingHours: {
          start: ngoUser.ngoStartTime,
          end: ngoUser.ngoEndTime
        }
      }
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

// ============================
// ❌ Delete Request by ID
// ============================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  console.log('🗑️ DELETE request received for ID:', id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('❌ Invalid ID');
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const found = await Request.findById(id);
    if (!found) {
      console.log('❌ Request not found');
      return res.status(404).json({ error: 'Request not found' });
    }

    if (found.status !== 'Pending') {
      console.log('⚠️ Request cannot be deleted because status is:', found.status);
      return res.status(403).json({ error: 'Only pending requests can be cancelled' });
    }

    await Request.findByIdAndDelete(id);
    console.log('✅ Request deleted successfully:', id);
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting request:', err.message);
    res.status(500).json({ error: 'Server error while deleting request' });
  }
});

// ============================
// ✏️ Update Request by ID
// ============================
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const existing = await Request.findById(id);
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    if (existing.status !== 'Pending') {
      return res.status(403).json({ error: 'Only pending requests can be updated' });
    }

    const updateData = {
      foodItem: req.body.foodItem, // ✅ Add this line
      foodType: req.body.foodType,
      quantity: req.body.quantity,
      location: req.body.location,
      urgency: req.body.urgency,
      preferredDate: req.body.preferredDate || null,
      contactNumber: req.body.contactNumber || '',
      specialNotes: req.body.specialNotes || '',
      receiver: req.body.receiver
    };

    const updated = await Request.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    console.log('✏️ Request updated:', updated._id);
    res.status(200).json({ success: true, updated });
  } catch (err) {
    console.error('❌ Error updating request:', err.message);
    res.status(500).json({ error: 'Server error while updating request' });
  }
});


// ============================
// ✏️ Mark as Delivered
// ============================
router.patch('/mark-delivered/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const request = await Request.findById(id).populate('donation');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Completed';
    await request.save();

    // Optional: also mark donation as delivered
    if (request.donation) {
      request.donation.status = 'Delivered';
      request.donation.deliveredAt = new Date();
      await request.donation.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error marking as delivered:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
