import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Donor from './pages/Donor';
import Volunteer from './pages/Volunteer';
import NGO from './pages/NGO';
import AllDonationsPage from './pages/AllDonationsPage';
import NGORequests from './pages/NGORequests'; // ✅ Added NGO Requests Page
import NGODonationsPage from './pages/NGODonationsPage'; // ✅
import ExpiredDonationsPage from './pages/ExpiredDonationsPage';

// Service detail pages
import FoodPickup from './pages/services/FoodPickup';
import RealTimeTracking from './pages/services/RealTimeTracking';
import ExpiryDetection from './pages/services/ExpiryDetection';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/volunteer/alldonations" element={<AllDonationsPage />} />
        <Route path="/ngo" element={<NGO />} />
        <Route path="/ngo-requests" element={<NGORequests />} /> {/* ✅ New Route */}
        <Route path="/volunteer/ngodonations" element={<NGODonationsPage />} />
        <Route path="/volunteer/expired-donations" element={<ExpiredDonationsPage />} />

        {/* Services Detail Routes */}
        <Route path="/services/food-pickup" element={<FoodPickup />} />
        <Route path="/services/real-time-tracking" element={<RealTimeTracking />} />
        <Route path="/services/expiry-detection" element={<ExpiryDetection />} />
      </Routes>
    </Router>
  );
}

export default App;
