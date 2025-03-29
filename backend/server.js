const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// ✅ Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000', // for local development
  'https://reduce-food-wastage.vercel.app' // for deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true // allow cookies (if you need it)
  })
);

app.use(express.json());

// ✅ Health check or root route
app.get('/', (req, res) => {
  res.send('Welcome to the Food Wastage Reduction API!');
});

// ✅ API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));

// ✅ Serve static frontend in production (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
}

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));