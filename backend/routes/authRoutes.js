const express = require('express');
const {
  register,
  login,
  googleRegister,
  googleLogin,
} = require('../controllers/authController');

const router = express.Router();

// Normal Auth
router.post('/register', register);
router.post('/login', login);

// ✅ Google Auth Routes
router.post('/google-register', googleRegister);
router.post('/google-login', googleLogin);

module.exports = router;
