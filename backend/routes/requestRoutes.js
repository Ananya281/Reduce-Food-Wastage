const express = require('express');
const Request = require('../models/Request');

const router = express.Router();

// Create a new request
router.post('/', async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().populate('receiver').populate('donation');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
