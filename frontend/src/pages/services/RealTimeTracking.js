import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaSatelliteDish, FaEye } from 'react-icons/fa';

const RealTimeTracking = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-16 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto text-center">
        {/* 🔙 Back to Home */}
        <div className="mb-6 text-left">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Home
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full shadow-md">
            <FaMapMarkedAlt className="text-green-700 text-5xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-green-700 mb-4">Real-Time Tracking</h1>

        {/* Description */}
        <p className="text-gray-700 text-lg mb-10 max-w-3xl mx-auto">
          Our real-time tracking system allows volunteers and recipients to monitor food donations as they move from the donor to the destination.
          This enhances transparency, accountability, and ensures quicker delivery before expiry.
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaSatelliteDish className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Live GPS Integration</h3>
            <p className="text-gray-600">
              Track donation pickups and deliveries live on an interactive map powered by Google Maps API.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaEye className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Full Transparency</h3>
            <p className="text-gray-600">
              All stakeholders are updated on donation status — picked, in transit, or delivered.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaMapMarkedAlt className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Route Optimization</h3>
            <p className="text-gray-600">
              Volunteers are guided via the shortest path to reduce time and increase efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;
