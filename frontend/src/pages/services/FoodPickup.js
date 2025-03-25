import React from 'react';
import { FaTruck, FaHandsHelping, FaRegClock } from 'react-icons/fa';

const FoodPickup = () => {
  return (
    <div className="pt-24 pb-16 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full shadow-md">
            <FaTruck className="text-green-700 text-5xl" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-green-700 mb-4">Food Pickup & Delivery</h1>

        {/* Intro Paragraph */}
        <p className="text-gray-700 text-lg mb-10 max-w-3xl mx-auto">
          Our food pickup and delivery service ensures that surplus food reaches the right hands before it goes to waste.
          Through the coordination of event organizers (donors), volunteers, and NGOs, we streamline the redistribution process with efficiency and compassion.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaHandsHelping className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Coordination</h3>
            <p className="text-gray-600">
              Volunteers connect donors and receivers in real-time for smooth food handovers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaRegClock className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Timely Deliveries</h3>
            <p className="text-gray-600">
              Ensuring food is picked up and delivered promptly before its expiry.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaTruck className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Optimized Routes</h3>
            <p className="text-gray-600">
              Volunteers are matched based on proximity using real-time location tracking.
            </p>
          </div>
        </div>

        {/* Optional CTA */}
        <div className="mt-12">
          <button
            onClick={() => window.location.href = '/donor'}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md"
          >
            Become a Donor Today →
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodPickup;
