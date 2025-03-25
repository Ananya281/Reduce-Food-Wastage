import React from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contact" className="bg-green-700 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold mb-4 border-b border-white pb-1 w-max">Contact Us</h3>
          <p className="flex items-center gap-2 mb-2">
            <FaEnvelope className="text-sm" /> support@foodsaver.org
          </p>
          <p className="flex items-center gap-2 mb-2">
            <FaPhoneAlt className="text-sm" /> +91 98765 43210
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-sm" /> New Delhi, India
          </p>
        </div>

        {/* Inspirational Quotes */}
        <div>
          <h3 className="text-xl font-bold mb-4 border-b border-white pb-1 w-max">Quote</h3>
          <p className="italic mb-2">“Don't waste food, feed a soul.”</p>
          <p className="italic">“Small efforts can lead to big change.”</p>
        </div>

        {/* Quick Links */}
        <div className="md:text-right text-left">
          <h3 className="text-xl font-bold mb-4 border-b border-white pb-1 w-max md:ml-auto">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#about" className="hover:underline hover:text-green-200 transition">About</a>
            </li>
            <li>
              <a href="#services" className="hover:underline hover:text-green-200 transition">Services</a>
            </li>
            <li>
              <a href="#contact" className="hover:underline hover:text-green-200 transition">Contact</a>
            </li>
            <li>
              <Link to="/login" className="hover:underline hover:text-green-200 transition">Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:underline hover:text-green-200 transition">Register</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm mt-10 border-t border-green-500 pt-4">
        &copy; 2025 <span className="font-semibold">FoodSaver</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
