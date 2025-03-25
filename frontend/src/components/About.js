import React from 'react';
import { FaHandsHelping } from 'react-icons/fa';

const About = () => {
  return (
    <section id="about" className="py-16 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <FaHandsHelping className="text-green-600 text-5xl" />
        </div>
        <h2 className="text-4xl font-bold text-green-700 mb-4 relative inline-block">
          About Us
          <div className="h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full"></div>
        </h2>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto mt-4">
          At <span className="font-semibold text-green-700">FoodSaver</span>, we bridge the gap between surplus and need.
          Our platform connects event organizers, NGOs, orphanages, and selfless volunteers to ensure that excess food 
          is quickly and safely delivered to those who need it most — reducing waste and spreading kindness.
        </p>
      </div>
    </section>
  );
};

export default About;
