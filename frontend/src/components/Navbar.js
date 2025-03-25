// File: src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <div className="text-xl font-bold text-green-600">FoodSaver</div>
      <ul className="flex space-x-6">
        <li><Link to="/" className="hover:text-green-600">Home</Link></li>
        <li><a href="#about" className="hover:text-green-600">About</a></li>
        <li><a href="#services" className="hover:text-green-600">Services</a></li>
        <li><a href="#contact" className="hover:text-green-600">Contact</a></li>
      </ul>
      <button
        onClick={() => navigate('/login')}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Sign In
      </button>
    </nav>
  );
};

export default Navbar;