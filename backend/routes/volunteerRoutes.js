// File: src/pages/Volunteer.jsx
import React, { useEffect, useState } from 'react';

const Volunteer = () => {
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const volunteerId = localStorage.getItem('donorId') || 'REPLACE_WITH_VALID_VOLUNTEER_ID';

  const fetchDonations = async () => {
    const res = await fetch('http://localhost:5000/api/donations');
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
    <div className="pt-24 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Welcome, Volunteer!</h1>
      <p className="text-gray-700 mb-8">This is your dashboard to manage pickups and deliveries.</p>

      <h2 className="text-2xl font-semibold mb-4">Available Donations</h2>
      {volunteerTasks.length === 0 ? (
        <p className="text-gray-500">No available donations right now.</p>
      ) : (
        <ul className="space-y-4">
          {volunteerTasks.map((donation) => (
            <li key={donation._id} className="p-4 border rounded bg-white shadow-sm">
              <h3 className="font-bold text-green-700">{donation.foodItem}</h3>
              <p>Quantity: {donation.quantity}</p>
              <p>Location: {donation.location}</p>
              <p>Expiry: {new Date(donation.expiryDate).toLocaleDateString()}</p>
              <button
                onClick={() => handleAccept(donation._id)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Accept Pickup
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-semibold mt-10 mb-4">My Pickups</h2>
      {myPickups.length === 0 ? (
        <p className="text-gray-500">You have not accepted any pickups yet.</p>
      ) : (
        <ul className="space-y-4">
          {myPickups.map((pickup) => (
            <li key={pickup._id} className="p-4 border rounded bg-white shadow-sm">
              <h3 className="font-bold text-green-700">{pickup.foodItem}</h3>
              <p>Quantity: {pickup.quantity}</p>
              <p>Location: {pickup.location}</p>
              <p>Status: {pickup.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Volunteer;