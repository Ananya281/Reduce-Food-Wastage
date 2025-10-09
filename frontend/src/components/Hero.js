import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleGetInvolved = () => {
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId'); // Only check this

    if (!role || !userId) {
      navigate('/login'); //Not logged in
    } else if (role === 'Donor') {
      navigate('/donor');
    } else if (role === 'Volunteer') {
      navigate('/volunteer');
    } else if (role === 'NGOs') {
      navigate('/ngo');
    } else {
      navigate('/login'); // Fallback
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-r from-green-100 via-white to-green-50 h-[100vh] flex items-center justify-center text-center px-6">
      <div className="max-w-4xl mx-auto z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-4 leading-tight">
          Reduce Food Wastage, <br /> Feed the Needy
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Connecting donors, NGOs, and volunteers to deliver surplus food where it’s needed most.
        </p>
        <button
          onClick={handleGetInvolved}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg shadow-md transition duration-300"
        >
          Get Involved →
        </button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;
