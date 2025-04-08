const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// =============================
// 🌟 POST: Submit Feedback for a Donation
// =============================
router.post('/', async (req, res) => {
  try {
    const { donation, volunteer, rating, comment } = req.body;

    if (!donation || !volunteer || typeof rating !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // ✅ Prevent duplicate feedback (based on compound index)
    const existing = await Feedback.findOne({ donation, volunteer });
    if (existing) {
      return res.status(409).json({ error: 'Feedback already submitted for this donation by this volunteer.' });
    }

    const feedback = await Feedback.create({
      donation,
      volunteer,
      rating,
      comment: comment || ''
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('❌ Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// =============================
// 📥 GET: Feedback by Donation ID
// =============================
router.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;

    const feedback = await Feedback.find({ donation: donationId })
      .populate('volunteer', 'fullName email') // Optional: show volunteer email too
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (err) {
    console.error('❌ Error fetching feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
