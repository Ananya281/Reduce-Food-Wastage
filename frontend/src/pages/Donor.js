// File: src/pages/Donor.jsx
import React, { useEffect, useState } from 'react';

const Donor = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: '',
    location: '',
    expiryDate: ''
  });

  const fetchDonations = async () => {
    const res = await fetch('http://localhost:5000/api/donations');
    const data = await res.json();
    console.log('Donation Response:', data);
    setDonations(Array.isArray(data) ? data : data.donations || []);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const donorId = localStorage.getItem('donorId') || 'YOUR_DONOR_OBJECT_ID';
    const res = await fetch('http://localhost:5000/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, donor: donorId })
    });
    const data = await res.json();
    if (data._id) {
      alert('Donation created!');
      setFormData({ foodItem: '', quantity: '', location: '', expiryDate: '' });
      fetchDonations();
    } else {
      alert('Failed to create donation');
    }
  };

  return (
    <div className="pt-24 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Welcome, Donor!</h1>
      <p className="text-gray-700 mb-8">List and manage your food donations below:</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Create Donation</h2>
        <input
          type="text"
          name="foodItem"
          value={formData.foodItem}
          onChange={handleChange}
          placeholder="Food Item"
          className="w-full p-2 mb-4 border"
          required
        />
        <input
          type="text"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Quantity (e.g. 10kg, 5 packets)"
          className="w-full p-2 mb-4 border"
          required
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 mb-4 border"
          required
        />
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="w-full p-2 mb-4 border"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Submit Donation</button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Your Donations</h2>
      {!Array.isArray(donations) || donations.length === 0 ? (
        <p className="text-gray-500">No donations yet.</p>
      ) : (
        <ul className="space-y-4">
          {donations.map((donation) => (
            <li key={donation._id} className="p-4 border rounded bg-white shadow-sm">
              <h3 className="font-bold text-green-700">{donation.foodItem}</h3>
              <p>Quantity: {donation.quantity}</p>
              <p>Location: {donation.location}</p>
              <p>Expiry: {new Date(donation.expiryDate).toLocaleDateString()}</p>
              <p>Status: {donation.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Donor;
