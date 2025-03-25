// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Donor from './pages/Donor';
import Volunteer from './pages/Volunteer';
import NGO from './pages/NGO';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/ngo" element={<NGO />} />
      </Routes>
    </Router>
  );
}

export default App;