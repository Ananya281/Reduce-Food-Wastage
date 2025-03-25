import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaBrain, FaRecycle } from 'react-icons/fa';

const ExpiryDetection = () => {
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
            <FaRobot className="text-green-700 text-5xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-green-700 mb-4">AI-based Expiry Detection</h1>

        {/* Description */}
        <p className="text-gray-700 text-lg mb-10 max-w-3xl mx-auto">
          Leveraging the power of Artificial Intelligence, our system identifies food nearing expiry and helps prioritize its redistribution.
          This ensures timely usage, minimizes waste, and maximizes the impact of every donation.
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaBrain className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Smart Predictions</h3>
            <p className="text-gray-600">
              AI models analyze patterns to predict food expiry with high accuracy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaRecycle className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Waste Reduction</h3>
            <p className="text-gray-600">
              Enables faster redistribution, ensuring food is consumed before spoilage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <FaRobot className="text-green-600 text-3xl mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Automated Alerts</h3>
            <p className="text-gray-600">
              Notifies volunteers and NGOs when food items are at risk of expiration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiryDetection;
