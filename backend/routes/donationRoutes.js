const express = require('express');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Request = require('../models/Request');   
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const router = express.Router();

const STATUS = {
  AVAILABLE: 'Available',
  PICKED: 'Picked',
  DELIVERED: 'Delivered'
};

//create a new donation
router.post('/', async (req, res) => {
  console.log("Incoming donation payload:", req.body);

  try {
    const {
      donor, foodItem, foodType, quantity, packaging, location,
      foodPreparedDate, donationAvailableDate, expiryDate,
      pickupStartTime, pickupEndTime, servings, contactNumber,
      storageInstructions, specialNotes, isRefrigerated, coordinates,
      ngoRequestId
    } = req.body;

    console.log("donor:", donor);
    console.log("foodItem:", foodItem);
    console.log("quantity:", quantity);
    console.log("location:", location);
    console.log("foodPreparedDate:", foodPreparedDate);
    console.log("donationAvailableDate:", donationAvailableDate);
    console.log("expiryDate:", expiryDate);
    console.log("coordinates:", coordinates);

    if (!donor || !foodItem || !quantity || !location || !expiryDate || !foodPreparedDate || !donationAvailableDate) {
      console.log("Required fields missing.");
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    if (
      !coordinates ||
      typeof coordinates.lat !== 'number' ||
      typeof coordinates.lng !== 'number' ||
      isNaN(coordinates.lat) || isNaN(coordinates.lng)
    ) {
      return res.status(400).json({ error: 'Coordinates must include valid lat and lng as numbers' });
    }
     

    let ngoRequest;
    let ngoDetails = null;
    let donorDetails = null;
    
    if (ngoRequestId) {
      console.log("🔵 Fetching NGO Request:", ngoRequestId);
      ngoRequest = await Request.findById(ngoRequestId).populate('receiver');
      if (ngoRequest) {
        console.log("NGO Request found.");
        ngoDetails = {
          _id: ngoRequest.receiver?._id,
          name: ngoRequest.receiver?.ngoName || '',
          address: ngoRequest.receiver?.ngoAddress || '',
          type: ngoRequest.receiver?.ngoType || '',
          contactEmail: ngoRequest.receiver?.email || ''
        };        
      } else {
        console.log("NGO Request not found for ID:", ngoRequestId);
      }
    }

    console.log("Fetching Donor User:", donor);
    const donorUser = await User.findById(donor);
    if (donorUser) {
      console.log("Donor User found.");
      donorDetails = {
        donorName: donorUser.fullName || '',
        donorEmail: donorUser.email || '',
        donorContactNumber: donorUser.contactNumber || ''
      };
    } else {
      console.log("Donor User not found for ID:", donor);
    }

    console.log("Ready to create Donation...");

    const donation = await Donation.create({
      donor,
      foodItem,
      foodType,
      quantity,
      packaging: packaging || '',
      location,
      preparedAt: new Date(foodPreparedDate),
      availableFrom: new Date(donationAvailableDate),
      expiryDate: new Date(expiryDate),
      pickupStartTime: pickupStartTime || '',
      pickupEndTime: pickupEndTime || '',
      servings: servings || '',
      contactNumber,
      storageInstructions: storageInstructions || '',
      specialNotes: specialNotes || '',
      isRefrigerated: isRefrigerated === true || isRefrigerated === 'Yes',
coordinates: {
  type: 'Point',
  coordinates: [coordinates.lng, coordinates.lat]
},
      ngoRequest: ngoRequestId || null,
      ngoDetails: ngoDetails || null,
      donorDetails: donorDetails || null
    });
    

    console.log("Donation created successfully:", donation._id);

    if (ngoRequest) {
      console.log("Updating NGO Request with Donation ID...");
      ngoRequest.status = 'Accepted';
      ngoRequest.donation = donation._id;
      await ngoRequest.save();
      console.log("NGO Request updated.");
    }

    res.status(201).json(donation);

  } catch (err) {
    console.error('Exception occurred:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


const fetch = require('node-fetch'); 

//convert lat lng to address
//autofill address from coordinates
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

//edit a donation
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

    if (updateFields.coordinates) {
      const { lat, lng } = updateFields.coordinates;
      if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        isNaN(lat) || isNaN(lng)
      ) {
        return res.status(400).json({ error: 'Coordinates must include valid lat and lng as numbers' });
      }
    }

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
    console.error('❌ Error updating donation:', err);
    res.status(500).json({ error: 'Failed to update donation', details: err.message });
  }
});


//delete a donation
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

//fetch all donations
//filtered by status
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const donations = await Donation.find(query)
      .populate('donor')
      .populate({
        path: 'ngoRequest',
        populate: { path: 'receiver' }
      });

    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching donations' });
  }
});

//fetch donations by donor
//My Donation section, card present
router.get('/donor/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(donorId)) {
      return res.status(400).json({ error: 'Invalid donor ID' });
    }

    const donations = await Donation.find({ donor: donorId }).populate('donor').sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching donor donations' });
  }
});

//fetch unique previous locations used by donor
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

//volunteer fetching nearby donations with filters
//used in Volunteer Dashboard
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

//fetch donations assigned to a specific NGO
router.get('/assigned/:ngoId', async (req, res) => {
  const { ngoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(ngoId)) {
    return res.status(400).json({ error: 'Invalid NGO ID' });
  }

  try {
    const donations = await Donation.find({
      $or: [
        { 'ngoRequest': { $ne: null } },
        { 'ngoDetails': { $ne: null } }
      ]
    })
      .populate('ngoRequest')
      .populate({
        path: 'ngoRequest',
        populate: { path: 'receiver' }
      });

    const filtered = donations.filter(d => {
      const requestMatch = d.ngoRequest?.receiver?._id?.toString() === ngoId;
      const directMatch = d.ngoDetails?._id?.toString() === ngoId;
      return requestMatch || directMatch;
    });
      

    res.status(200).json(filtered);
  } catch (err) {
    console.error("❌ Error fetching assigned donations:", err);
    res.status(500).json({ error: 'Failed to fetch assigned donations' });
  }
});


module.exports = router;
