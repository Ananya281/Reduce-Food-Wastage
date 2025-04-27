const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const User = require('../models/User'); // ✅ Make sure this is at the top if not already
const NgoRequest = require('../models/NgoRequest'); // ✅ If you are using NgoRequest model
const nodemailer = require('nodemailer');

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
router.patch('/mark-delivered/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: 'Completed' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!request.donation) {
      return res.status(400).json({ error: 'No linked donation found' });
    }

    const donation = await Donation.findByIdAndUpdate(
      request.donation,
      { status: 'Delivered' },
      { new: true }
    ).populate('donor').populate('volunteer');  // ✨ FIX here: populate separately

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Send email to Volunteer
    if (donation.volunteer?.email) {  // ✅ Check if volunteer exists and has email
      await transporter.sendMail({
        from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
        to: donation.volunteer.email,
        subject: '🎉 Your Pickup Delivered Successfully!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2e7d32;">Thank You, ${donation.volunteer.fullName || 'Volunteer'}! 🙌</h2>
            <p>Your pickup for <strong>${donation.foodItem}</strong> has been <strong>successfully delivered</strong> to the NGO.</p>
            <p style="margin-top: 10px;">We appreciate your efforts in fighting food wastage and making a positive impact! 🚚🎯</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: gray;">Keep volunteering with us to create a hunger-free world.</p>
            <p style="font-size: 12px; color: gray;"><i>— Reduce Food Waste Team</i></p>
          </div>
        `
      });      
      console.log(`📩 Email sent to Volunteer: ${donation.volunteer.email}`);
    }

    // Send email to Donor
    if (donation.donor?.email) {  // ✅ Check if donor exists and has email
      await transporter.sendMail({
        from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
        to: donation.donor.email,
        subject: '🎉 Your Donation Reached Safely!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1976d2;">Thank You, ${donation.donor.fullName || 'Donor'}! 🎁</h2>
            <p>Your donation of <strong>${donation.foodItem}</strong> has been <strong>successfully delivered</strong> to the NGO.</p>
            <p style="margin-top: 10px;">Your kindness is making a difference! 🌟</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: gray;">Stay connected for more donation opportunities.</p>
            <p style="font-size: 12px; color: gray;"><i>— Reduce Food Waste Team</i></p>
          </div>
        `
      });      
      console.log(`📩 Email sent to Donor: ${donation.donor.email}`);
    }

    res.status(200).json({ success: true, message: 'Request and Donation marked as delivered. Emails sent.' });

  } catch (error) {
    console.error('❌ Error marking delivered:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// ============================
// ✨ NGO Reviews Volunteer Recommended Donation
// ============================
router.patch('/review-recommended/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const { action, ngoDetails } = req.body; // action = 'accept' or 'reject'

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "accept" or "reject".' });
  }

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ error: 'Invalid Request ID.' });
  }

  try {
    const request = await Request.findById(requestId).populate('donation');

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (!request.donation) {
      return res.status(400).json({ error: 'No linked donation found for this request.' });
    }

    const donation = await Donation.findById(request.donation._id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found.' });
    }

    if (action === 'accept') {
      donation.ngoDetails = {
        ...donation.ngoDetails,
        name: ngoDetails.name,
        address: ngoDetails.address,
        type: ngoDetails.type,
        contactEmail: ngoDetails.contactEmail,
      };
      donation.status = 'AcceptedByNGO';  // ✅ Optional: mark that NGO approved it
    } else if (action === 'reject') {
      donation.ngoDetails = undefined;
      donation.status = 'Available'; // Put donation back as free if rejected
    }

    await donation.save();

    res.status(200).json({ success: true, message: `Donation successfully ${action}ed by NGO.` });

  } catch (error) {
    console.error('❌ Error reviewing recommended donation:', error.message);
    res.status(500).json({ error: 'Server error while reviewing recommendation.' });
  }
});


// 🛠 NGO Accepts the volunteer recommendation
router.patch('/accept-recommendation/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    donation.status = 'Confirmed';  // ✅ Update status (You can name it 'Confirmed for Delivery' etc.)
    await donation.save();

    return res.json({ success: true, message: 'Recommendation accepted' });
  } catch (error) {
    console.error('Error accepting recommendation:', error);
    res.status(500).json({ error: 'Failed to accept recommendation' });
  }
});

// 🛠 NGO Rejects the volunteer recommendation
router.patch('/reject-recommendation/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // If rejected ➔ Clear NGO link and set back to Available
    donation.ngoDetails = undefined;
    donation.status = 'Available'; // again make it available for volunteers
    await donation.save();

    return res.json({ success: true, message: 'Recommendation rejected' });
  } catch (error) {
    console.error('Error rejecting recommendation:', error);
    res.status(500).json({ error: 'Failed to reject recommendation' });
  }
});


module.exports = router;
