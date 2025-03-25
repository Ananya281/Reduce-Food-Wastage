const express = require('express');
const Volunteer = require('../models/Volunteer');

const router = express.Router();

// Register or update volunteer profile
router.post('/', async (req, res) => {
  try {
    const { user, assignedDonations } = req.body;
    let volunteer = await Volunteer.findOne({ user });

    if (volunteer) {
      volunteer.assignedDonations = assignedDonations || volunteer.assignedDonations;
      await volunteer.save();
    } else {
      volunteer = await Volunteer.create({ user, assignedDonations });
    }

    res.status(201).json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user').populate('assignedDonations');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
