const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const User = require('../models/User');
const NgoRequest = require('../models/NgoRequest'); 
const nodemailer = require('nodemailer');

const router = express.Router();

//create a new request
router.post('/', verifyToken, async (req, res) => {
    try {
    const {
      foodItem,
      foodType,
      quantity,
      urgency,
      receiver,
      preferredDate,
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
      specialNotes: specialNotes || '',
      status: 'Pending',
      locationCoordinates: {
        type: 'Point',
        coordinates: [ngoUser.locationCoordinates.coordinates[0], ngoUser.locationCoordinates.coordinates[1]] // longitude, latitude
      },
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
        },
        locationCoordinates: {     // ✨ Add this
          type: 'Point',
          coordinates: [ngoUser.locationCoordinates.coordinates[0], ngoUser.locationCoordinates.coordinates[1]]
        }
      }
    });    

    res.status(201).json(newRequest);
  } catch (err) {
    console.error('❌ Error creating request:', err.message);
    res.status(500).json({ error: 'Server error while creating request.' });
  }
});

//fetch all requests of NGO
router.get('/', verifyToken, async (req, res) => {
  try {
    const { receiver } = req.query;

    const filter = receiver ? { receiver } : {};
    if (receiver && !mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({ error: 'Invalid receiver ID format.' });
    }

    const requests = await Request.find(filter)
    .populate('receiver', 'ngoName ngoType contactNumber')
    .populate('donation', 'foodItem quantity location status')
      .sort({ requestedAt: -1 })
      .lean();

    res.status(200).json(requests);
  } catch (error) {
    console.error('❌ Error fetching requests:', error.message);
    res.status(500).json({ error: 'Server error while fetching requests.' });
  }
});

//fetch NGO's previous unique locations
router.get('/locations/:receiverId', verifyToken, async (req, res) => {
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

//delete request
router.delete('/:id', verifyToken, async (req, res) => {
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

//update request
router.patch('/:id', verifyToken, async (req, res) => {
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


//mark request as delivered and send emails
router.patch('/mark-delivered/:donationId', verifyToken, async (req, res) => {
    try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate('donor')
      .populate('volunteer');

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // ✅ Mark donation as delivered
    donation.status = 'Delivered';
    await donation.save();

    // ✅ Find and mark the linked NGO request as completed
    const ngoRequest = await NgoRequest.findOne({ donation: donation._id });

    if (!ngoRequest) {
      return res.status(404).json({ error: 'Linked NGO Request not found' });
    }

    await Request.findByIdAndUpdate(ngoRequest.request, { status: 'Completed' });

    // ✅ Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // ✅ Send email to volunteer
    if (donation.volunteer?.email) {
      await transporter.sendMail({
        from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
        to: donation.volunteer.email,
        subject: '🎉 Your Pickup Delivered Successfully!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2e7d32;">Thank You, ${donation.volunteer.fullName || 'Volunteer'}! 🙌</h2>
            <p>Your pickup for <strong>${donation.foodItem}</strong> has been <strong>successfully delivered</strong> to the NGO.</p>
            <hr><p style="font-size: 12px; color: gray;">— Reduce Food Waste Team</p>
          </div>`
      });
    }

    // ✅ Send email to donor
    if (donation.donor?.email) {
      await transporter.sendMail({
        from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
        to: donation.donor.email,
        subject: '🎉 Your Donation Reached Safely!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1976d2;">Thank You, ${donation.donor.fullName || 'Donor'}! 🎁</h2>
            <p>Your donation of <strong>${donation.foodItem}</strong> has been <strong>successfully delivered</strong> to the NGO.</p>
            <hr><p style="font-size: 12px; color: gray;">— Reduce Food Waste Team</p>
          </div>`
      });
    }

    res.status(200).json({ success: true, message: 'Donation and request marked as delivered. Emails sent.' });

  } catch (error) {
    console.error('❌ Error marking delivered:', error.message);
    res.status(500).json({ error: 'Server error while marking as delivered' });
  }
});


// NGO Accepts the volunteer recommendation
router.patch('/accept-recommendation/:donationId', verifyToken, async (req, res) => {
    try {
    const { donationId } = req.params;
    const { ngoId } = req.body;

    console.log('🔍 Accepting Recommendation:', { donationId, ngoId });

    if (!mongoose.Types.ObjectId.isValid(donationId) || !mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ error: 'Invalid donationId or ngoId' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.status = 'Accepted';
    await donation.save();

    const ngoRequest = await NgoRequest.findOne({ donation: donation._id, ngo: ngoId });

    if (!ngoRequest) {
      console.warn('⚠️ No NgoRequest found for donation:', donation._id, 'and ngo:', ngoId);
      return res.status(404).json({ error: 'No matching NGO request found' });
    }

    ngoRequest.status = 'Accepted';
    await ngoRequest.save();

    console.log('✅ Recommendation accepted for NGO:', ngoId);
    return res.status(200).json({ success: true, message: 'Recommendation accepted' });
  } catch (error) {
    console.error('❌ Error in accept-recommendation:', error);
    res.status(500).json({ error: 'Failed to accept recommendation' });
  }
});


// NGO Rejects the volunteer recommendation
router.patch('/reject-recommendation/:donationId', verifyToken, async (req, res) => {
    try {
    const { donationId } = req.params;
    const { ngoId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(donationId) || !mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ error: 'Invalid donationId or ngoId' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.ngoDetails = undefined;
    donation.status = 'Available';
    await donation.save();

    const ngoRequest = await NgoRequest.findOne({ donation: donation._id, ngo: ngoId });

    if (!ngoRequest) {
      console.warn('⚠️ No NgoRequest found for this donation and NGO');
      return res.status(404).json({ error: 'No matching NGO request found' });
    }

    ngoRequest.status = 'Rejected';
    await ngoRequest.save();

    return res.status(200).json({ success: true, message: 'Recommendation rejected' });
  } catch (error) {
    console.error('❌ Error in reject-recommendation:', error.message);
    res.status(500).json({ error: 'Failed to reject recommendation' });
  }
});

module.exports = router;