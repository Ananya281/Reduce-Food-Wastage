const express = require('express');
const router = express.Router();

const {register,login,googleRegister,googleLogin} = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');

//Email/Password Authentication
router.post('/register', register);
router.post('/login', login);

//Google OAuth Routes
router.post('/google-register', googleRegister);
router.post('/google-login', googleLogin);

// Used by frontend to check if stored token is still valid or expired
//when user refresh the page
router.get('/verify-token', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user, // includes id and role from token payload
  });
});
//backend auto login a user if token is valid

// The frontend simply deletes the token from localStorage/cookies
//when user logout, delete JWT from browser
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully (client-side token removal)' });
});

module.exports = router;
