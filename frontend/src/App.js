import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Donor from './pages/Donor';
import Volunteer from './pages/Volunteer';
import NGO from './pages/NGO';

// Service detail pages
import FoodPickup from './pages/services/FoodPickup';
import RealTimeTracking from './pages/services/RealTimeTracking';
import ExpiryDetection from './pages/services/ExpiryDetection';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/ngo" element={<NGO />} />

        {/* Services Detail Routes */}
        <Route path="/services/food-pickup" element={<FoodPickup />} />
        <Route path="/services/real-time-tracking" element={<RealTimeTracking />} />
        <Route path="/services/expiry-detection" element={<ExpiryDetection />} />
      </Routes>
    </Router>
  );
}

export default App;
