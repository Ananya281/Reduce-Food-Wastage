import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck } from 'react-icons/fa';

const Volunteer = () => {
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const navigate = useNavigate();
  const volunteerId = localStorage.getItem('donorId') || 'REPLACE_WITH_VALID_VOLUNTEER_ID';

  const fetchDonations = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setVolunteerTasks(data.filter(d => d.status === 'Available'));
      setMyPickups(data.filter(d => d.status === 'In Transit'));
    } else {
      setVolunteerTasks([]);
      setMyPickups([]);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAccept = async (donationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/volunteers/accept/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer: volunteerId })
      });
      const data = await res.json();
      if (data._id) {
        alert('Pickup accepted!');
        fetchDonations();
      } else {
        alert('Failed to accept pickup');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating pickup');
    }
  };

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Home
        </button>

        <h1 className="text-4xl font-bold text-green-700 mb-2">Welcome, Volunteer!</h1>
        <p className="text-gray-700 mb-10">
          Help bridge the gap between donors and the needy. Accept pickups and manage deliveries below.
        </p>

        {/* Available Donations */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">Available Donations</h2>
        {volunteerTasks.length === 0 ? (
          <p className="text-gray-500">No available donations right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteerTasks.map((donation) => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {donation.foodItem}
                </h3>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaTruck /> Quantity: {donation.quantity}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> Location: {donation.location}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleAccept(donation._id)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                >
                  Accept Pickup
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Pickups */}
        <h2 className="text-2xl font-bold text-green-700 mt-12 mb-4">My Pickups</h2>
        {myPickups.length === 0 ? (
          <p className="text-gray-500">You have not accepted any pickups yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPickups.map((pickup) => (
              <div key={pickup._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {pickup.foodItem}
                </h3>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaTruck /> Quantity: {pickup.quantity}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> Location: {pickup.location}
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Status:</strong> {pickup.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteer;
