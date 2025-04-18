const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const {
      fullName,
      email,
      password,
      role,
      contactNumber,
      location,
      address,
      vehicleAvailable,
      availableStartTime,
      availableEndTime,
      ngoRegNumber,
      ngoType,
      dailyFoodNeed,
      ngoName,
      ngoAddress,
      operatingHours,
      website,
      ngoOperatingDays, // ✅ new
      ngoStartTime,      // ✅ new
      ngoEndTime         // ✅ new
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Full name, email, password, and role are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (role === 'NGOs') {
      if (!ngoRegNumber || !ngoType || !dailyFoodNeed || !ngoName || !ngoAddress || !operatingHours || !ngoOperatingDays || !ngoStartTime || !ngoEndTime) {
        return res.status(400).json({ error: 'Please fill all required NGO details' });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      contactNumber,
      location,
      address,
      vehicleAvailable,
      availableStartTime,
      availableEndTime,
      ngoRegNumber,
      ngoType,
      dailyFoodNeed,
      ngoName,
      ngoAddress,
      operatingHours,
      website,
      ngoOperatingDays,
      ngoStartTime,
      ngoEndTime
    });

    const token = generateToken(newUser);
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
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

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login Error:', err);
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

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        password: undefined,
        role,
        googleId
      });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Google Register Error:', error);
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

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not registered. Please sign up first.' });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Google Login Error:', error);
    res.status(500).json({ error: 'Google login failed. Please try again.' });
  }
};