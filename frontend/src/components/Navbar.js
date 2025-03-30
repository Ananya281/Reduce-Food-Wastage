import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId'));

  // ✅ Update login status on route/path change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('userId'));
  }, [location.pathname]);

  // ✅ Listen for storage events (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('userId'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ Also update login status on mount (fresh load)
  useEffect(() => {
    const interval = setInterval(() => {
      const loggedIn = !!localStorage.getItem('userId');
      setIsLoggedIn(loggedIn);
    }, 500); // short interval for quick sync

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <div className="text-xl font-bold text-green-600">FoodSaver</div>
      <ul className="flex space-x-6">
        <li><Link to="/" className="hover:text-green-600">Home</Link></li>
        <li><a href="#about" className="hover:text-green-600">About</a></li>
        <li><a href="#services" className="hover:text-green-600">Services</a></li>
        <li><a href="#contact" className="hover:text-green-600">Contact</a></li>
      </ul>
      {isLoggedIn ? (
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign In
        </button>
      )}
    </nav>
  );
};

export default Navbar;
