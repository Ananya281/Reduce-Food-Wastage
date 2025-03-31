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
    console.error("❌ Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ============================
// 🔐 Normal Login
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        password: '',  // Not needed for Google OAuth
        role,
        googleId,
      });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Google Register Error:', error.message);
    res.status(500).json({ error: 'Google register failed' });
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not registered' });

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Google Login Error:', error.message);
    res.status(500).json({ error: 'Google login failed' });
  }
};
