const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// POST /api/email/notify-ngo
router.post('/notify-ngo', async (req, res) => {
  const { ngoEmail, ngoName, foodItem, volunteerId, volunteerName, donorEmail, donorName } = req.body;

  if (!ngoEmail || !ngoName || !foodItem || !volunteerId) {
    console.log('❌ Missing fields:', { ngoEmail, ngoName, foodItem, volunteerId, donorEmail, donorName });
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

    // Email to NGO
    const ngoMailOptions = {
      from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
      to: ngoEmail,
      subject: '✅ Good news! Your food request has been accepted 🎉',
      html: `
        <h3>Hello ${ngoName},</h3>
        <p>Your request for <strong>${foodItem}</strong> has been accepted by a volunteer.</p>
        <p><strong>Volunteer Name:</strong> ${volunteerName}</p>
        <p><strong>Volunteer ID:</strong> <code>${volunteerId}</code></p>
        <p>They are on the way to deliver your food donation.</p>
        <br/>
        <p>Thank you for being a part of the mission!</p>
        <p><i>Reduce Food Waste Team</i></p>
      `
    };

    await transporter.sendMail(ngoMailOptions);
    console.log(`📩 Email sent to NGO: ${ngoName} (${ngoEmail}) for food item: ${foodItem}`);

    // If donor details are provided, send email to donor too
    if (donorEmail && donorName) {
      const donorMailOptions = {
        from: `"Reduce Food Waste" <${process.env.GMAIL_USER}>`,
        to: donorEmail,
        subject: '🚚 Your donation has been picked up!',
        html: `
          <h3>Hello ${donorName},</h3>
          <p>Good news! Your donation of <strong>${foodItem}</strong> has been picked up by a volunteer.</p>
          <p><strong>Volunteer Name:</strong> ${volunteerName}</p>
          <p>Thank you so much for your contribution in reducing food waste! 🙌</p>
          <br/>
          <p><i>Reduce Food Waste Team</i></p>
        `
      };

      await transporter.sendMail(donorMailOptions);
      console.log(`📩 Email also sent to Donor: ${donorName} (${donorEmail}) for food item: ${foodItem}`);
    }

    res.status(200).json({ success: true, message: 'Emails sent to NGO (and Donor if available)' });

  } catch (err) {
    console.error(`❌ Failed to send emails. Error:`, err.message);
    res.status(500).json({ error: 'Failed to send emails', details: err.message });
  }
});

module.exports = router;