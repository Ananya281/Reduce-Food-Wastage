const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================
// Helper: Generate JWT Token
// ============================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// ============================
// 📥 Normal Register
// ============================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser);
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("❌ Registration Error:", err.message || err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ============================
// 🔐 Normal Login
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login Error:', err.message || err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ============================
// 🔓 Google Register
// ============================
exports.googleRegister = async (req, res) => {
  const { credential, role } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email || !name || !googleId || !role) {
      return res.status(400).json({ error: 'Incomplete Google user data' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        password: '', // empty password since it's a Google user
        role,
        googleId,
      });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Google Register Error:', error.message || error);
    res.status(500).json({ error: 'Google register failed. Please try again later.' });
  }
};

// ============================
// 🔓 Google Login
// ============================
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    if (!email) return res.status(400).json({ error: 'Invalid Google token' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not registered' });

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Google Login Error:', error.message || error);
    res.status(500).json({ error: 'Google login failed. Please try again.' });
  }
};
