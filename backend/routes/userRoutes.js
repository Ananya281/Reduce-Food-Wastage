const express = require('express');
const router = express.Router();
const { getUserById } = require('../controllers/authController'); // ✅ This must be correct

// ✅ Define route properly
router.get('/:id', getUserById);

module.exports = router;
