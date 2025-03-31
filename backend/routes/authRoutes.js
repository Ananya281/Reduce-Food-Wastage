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

// 📥 Email/Password Authentication
router.post('/register', register);   // ➕ Register user
router.post('/login', login);         // 🔑 Login user

// 🔐 Google OAuth Routes
router.post('/google-register', googleRegister);  // ➕ Google Sign-Up
router.post('/google-login', googleLogin);        // 🔓 Google Sign-In

// ============================
// (Optional) Token Verification (protected routes)
// ============================
// const { verifyToken } = require('../middleware/authMiddleware');
// router.get('/verify-token', verifyToken, (req, res) => res.json({ success: true }));

// ============================
// (Optional) Logout (handled on frontend via token removal)
// ============================
// router.post('/logout', (req, res) => res.json({ message: "Logged out successfully" }));

module.exports = router;
