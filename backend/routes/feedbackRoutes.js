const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { request, receiver, rating, comment } = req.body;

    const existing = await Feedback.findOne({ request });
    if (existing) return res.status(400).json({ error: 'Feedback already submitted' });

    const feedback = await Feedback.create({ request, receiver, rating, comment });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('❌ Feedback error:', err.message);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
