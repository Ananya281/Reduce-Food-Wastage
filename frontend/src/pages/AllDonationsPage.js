import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AllDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const volunteerId = localStorage.getItem('userId');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  const fetchAllAvailableDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`);
      const data = await res.json();
      if (!Array.isArray(data)) return toast.error("Invalid donation data");

      // Show all, including accepted, but we'll conditionally render the button
      setDonations(data.filter(d => d.status === 'Available' || (d.volunteer && d.volunteer === volunteerId)));
    } catch (error) {
      toast.error('❌ Failed to load donations');
    }
  };

  const handleAccept = async (donationId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/accept/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer: volunteerId })
      });

      const data = await res.json();
      if (data._id) {
        toast.success('✅ Donation accepted!');
        setDonations(prev => prev.map(d =>
          d._id === donationId ? { ...d, status: 'In Transit', volunteer: volunteerId } : d
        ));
      } else {
        toast.error(data.error || '❌ Could not accept donation');
      }
    } catch (error) {
      toast.error('❌ Error while accepting');
    }
  };

  useEffect(() => {
    fetchAllAvailableDonations();
  }, []);

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/volunteer')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-green-700 mb-6">All Available Donations</h1>

        {donations.length === 0 ? (
          <p className="text-gray-500">No donations available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {donation.foodItem}
                </h3>
                <p className="text-gray-700 flex items-center gap-2"><FaTruck /> Quantity: {donation.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {donation.location}</p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleDateString()}
                </p>

                {donation.status === 'Available' ? (
                  <button
                    onClick={() => handleAccept(donation._id)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  >
                    Accept Pickup
                  </button>
                ) : donation.volunteer === volunteerId ? (
                  <p className="mt-4 text-green-600 font-semibold text-center">Already Accepted</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllDonationsPage;
