const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ✅ NGO users stored in User model

// 📍 Fetch Nearby NGOs based on volunteer's pickup location
router.post('/nearby', async (req, res) => {
    try {
      const { location } = req.body;
  
      if (!location || location.length !== 2) {
        return res.status(400).json({ error: 'Invalid location' });
      }
  
      const [latitude, longitude] = location;
  
      let nearbyNGOs = await User.find({
        role: 'NGOs',
        locationCoordinates: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] },
            $maxDistance: 10000, // 10 km
          },
        },
      }).select('ngoName ngoAddress ngoOperatingDays ngoStartTime ngoEndTime locationCoordinates');
  
      const today = new Date();
      const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
      const currentMinutes = today.getHours() * 60 + today.getMinutes();
  
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + (minutes || 0);
      };
  
      nearbyNGOs = nearbyNGOs.filter(ngo => {
        if (!ngo.ngoOperatingDays?.includes(currentDay)) return false;
        const startMinutes = parseTime(ngo.ngoStartTime);
        const endMinutes = parseTime(ngo.ngoEndTime);
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      });
  
      res.json(nearbyNGOs);
    } catch (error) {
      console.error('Error fetching nearby NGOs:', error);
      res.status(500).json({ error: 'Failed to fetch nearby NGOs' });
    }
  });  

module.exports = router;
