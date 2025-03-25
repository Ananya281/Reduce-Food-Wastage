// File: src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="p-10 bg-green-600 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-2">Contact Us</h3>
          <p>Email: support@foodsaver.org</p>
          <p>Phone: +91 98765 43210</p>
          <p>Location: New Delhi, India</p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2">Quote</h3>
          <p>“Don't waste food, feed a soul.”</p>
          <p>“Small efforts can lead to big change.”</p>
        </div>
        <div className="text-center md:text-right">
          <h3 className="font-bold text-xl mb-2">Quick Links</h3>
          <p><a href="#about" className="hover:underline">About</a></p>
          <p><a href="#services" className="hover:underline">Services</a></p>
          <p><a href="#contact" className="hover:underline">Contact</a></p>
        </div>
      </div>
      <div className="text-center mt-6 text-sm">&copy; 2025 FoodSaver. All rights reserved.</div>
    </footer>
  );
};

export default Footer;