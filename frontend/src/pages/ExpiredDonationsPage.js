import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExpiredDonationsPage = () => {
  const [expiredDonations, setExpiredDonations] = useState([]);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const fetchExpiredDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`);
      const data = await res.json();
      if (!Array.isArray(data)) return toast.error('Invalid donation data');

      const today = new Date();
      const expired = data.filter(d => new Date(d.expiryDate) < today);
      setExpiredDonations(expired);
    } catch (error) {
      toast.error('❌ Failed to load expired donations');
    }
  };

  useEffect(() => {
    fetchExpiredDonations();
  }, []);

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/volunteer')}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-red-600 mb-6">🛑 Expired Donations</h1>

        {expiredDonations.length === 0 ? (
          <p className="text-gray-600">No expired donations found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiredDonations.map(donation => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow relative">
                <div className="absolute top-3 right-3 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                  ⚠️ Expired
                </div>

                <h3 className="text-xl font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {donation.foodItem}
                </h3>

                <p className="text-gray-700 flex items-center gap-2">
                  <FaTruck /> Quantity: {donation.quantity}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> Location: {donation.location}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt /> Expired On: {new Date(donation.expiryDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiredDonationsPage;
