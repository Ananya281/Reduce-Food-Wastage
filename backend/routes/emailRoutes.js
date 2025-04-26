const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// POST /api/email/notify-ngo
router.post('/notify-ngo', async (req, res) => {
  const { ngoEmail, ngoName, foodItem, volunteerId } = req.body;

  if (!ngoEmail || !ngoName || !foodItem || !volunteerId) {
    return res.status(400).json({ error: 'Missing required email fields' });
  }


  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    const mailOptions = {
        from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
        to: ngoEmail,
        subject: '✅ Good news! Your food request has been accepted 🎉',
        html: `
          <h3>Hello ${ngoName},</h3>
          <p>Your request for <strong>${foodItem}</strong> has been accepted by a volunteer.</p>
          <p>Volunteer ID: <code>${volunteerId}</code></p>
          <p>They are on the way to deliver your food donation.</p>
          <br/>
          <p>Thank you for being a part of the mission!</p>
          <p><i>Reduce Food Waste Team</i></p>
        `
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent to NGO' });
  
    } catch (err) {
      console.error('❌ Email error:', err);
      res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
  });
  
  module.exports = router;