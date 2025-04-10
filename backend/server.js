const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', // ✅ ADD THIS LINE
  'https://reduce-food-wastage.vercel.app'
];

// ✅ CORS middleware (with debug log)
app.use(cors({
  origin: function (origin, callback) {
    console.log("🌐 Incoming request from:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("⛔ Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('Welcome to the Food Wastage Reduction API!');
});

// ✅ All API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// ✅ Serve frontend (optional production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
}

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
