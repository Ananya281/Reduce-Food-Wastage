const express = require('express');
const router = express.Router();

const {
  register,
  login,
  googleRegister,
  googleLogin,
} = require('../controllers/authController');

// ============================
// 🔐 Authentication Routes
// ============================

// 📥 Normal Email/Password Auth
router.post('/register', register);             // ➕ Register user
router.post('/login', login);                   // 🔑 Login user

// 🔐 Google OAuth Routes
router.post('/google-register', googleRegister); // ➕ Google Sign-Up
router.post('/google-login', googleLogin);       // 🔓 Google Sign-In

// (Optional) 🔍 Token Verification for Protected Routes
// router.get('/verify-token', verifyToken); // → You can add JWT middleware if needed

// (Optional) 🚪 Logout Placeholder (handled on frontend usually)
// router.post('/logout', (req, res) => res.clearCookie('token').json({ message: "Logged out" }));

module.exports = router;
