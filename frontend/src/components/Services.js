import React from 'react';
import { FaTruck, FaClock, FaRobot } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <section id="services" className="py-16 px-6 bg-gray-100 text-center">
      <h2 className="text-4xl font-bold text-green-700 mb-10">Our Services</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-105 transform transition-all duration-300">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <FaTruck className="text-green-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Food Pickup & Delivery</h3>
          <p className="text-gray-600">
            Seamless coordination between donors, volunteers, and receivers for timely food delivery.
          </p>
          <Link to="/services/food-pickup" className="mt-4 inline-block text-green-700 font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-105 transform transition-all duration-300">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <FaClock className="text-green-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
          <p className="text-gray-600">
            Track pickups and deliveries live on the map for better transparency and efficiency.
          </p>
          <Link to="/services/real-time-tracking" className="mt-4 inline-block text-green-700 font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-105 transform transition-all duration-300">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <FaRobot className="text-green-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">AI-based Expiry Detection</h3>
          <p className="text-gray-600">
            Smart AI models help identify food nearing expiry, optimizing redistribution.
          </p>
          <Link to="/services/expiry-detection" className="mt-4 inline-block text-green-700 font-medium hover:underline">
            Learn More →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
