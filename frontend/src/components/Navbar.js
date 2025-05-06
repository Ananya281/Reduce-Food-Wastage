import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Icons from lucide-react

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('userId'));
    setIsMenuOpen(false); // Close menu on route change
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('userId'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const loggedIn = !!localStorage.getItem('userId');
      setIsLoggedIn(loggedIn);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => navigate('/')}>
          MealBridge
        </div>

        {/* Hamburger Menu Icon */}
        <div className="md:hidden">
          {isMenuOpen ? (
            <X onClick={() => setIsMenuOpen(false)} className="h-6 w-6 cursor-pointer" />
          ) : (
            <Menu onClick={() => setIsMenuOpen(true)} className="h-6 w-6 cursor-pointer" />
          )}
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
        <li><a href="#home" className="hover:text-green-600 font-medium">Home</a></li>
        <li><a href="#about" className="hover:text-green-600 font-medium">About</a></li>
          <li><a href="#services" className="hover:text-green-600 font-medium">Services</a></li>
          <li><a href="#contact" className="hover:text-green-600 font-medium">Contact</a></li>
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
        </ul>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md px-6 pb-4">
          <ul className="flex flex-col space-y-4">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-green-600 font-medium">Home</Link></li>
            <li><a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-green-600 font-medium">About</a></li>
            <li><a href="#services" onClick={() => setIsMenuOpen(false)} className="hover:text-green-600 font-medium">Services</a></li>
            <li><a href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-green-600 font-medium">Contact</a></li>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Sign In
              </button>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
