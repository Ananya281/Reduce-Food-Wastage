import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaMapMarkerAlt, FaCalendarAlt, FaClipboardCheck } from 'react-icons/fa';

const Donor = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: '',
    location: '',
    expiryDate: ''
  });

  const navigate = useNavigate();
  const donorId = localStorage.getItem('donorId'); // ✅ Get logged-in donor's ID

  const fetchDonations = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/donor/${donorId}`);
      const data = await res.json();
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching donor donations:', err);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, donor: donorId }) // ✅ Send donor ID
      });
      const data = await res.json();
      if (data._id) {
        alert('Donation created!');
        setFormData({ foodItem: '', quantity: '', location: '', expiryDate: '' });
        fetchDonations(); // ✅ Refresh list
      } else {
        alert('Failed to create donation');
      }
    } catch (error) {
      console.error(error);
      alert('Error during donation creation');
    }
  };

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Home
        </button>

        <h1 className="text-4xl font-bold text-green-700 mb-2">Welcome, Donor!</h1>
        <p className="text-gray-700 mb-10">
          Thank you for contributing to a better world. Use the form below to donate food and track your contributions.
        </p>

        {/* Donation Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Create a Donation</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="foodItem"
              value={formData.foodItem}
              onChange={handleChange}
              placeholder="Food Item"
              className="p-3 border rounded"
              required
            />
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity (e.g. 10kg, 5 packets)"
              className="p-3 border rounded"
              required
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="p-3 border rounded"
              required
            />
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="p-3 border rounded"
              required
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded mt-2 transition"
              >
                Submit Donation
              </button>
            </div>
          </form>
        </div>

        {/* Donations List */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">Your Donations</h2>
        {!Array.isArray(donations) || donations.length === 0 ? (
          <p className="text-gray-500">You haven’t made any donations yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {donations.map((donation) => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaUtensils /> {donation.foodItem}
                </h3>
                <p className="text-gray-700 flex items-center gap-2"><FaClipboardCheck /> Quantity: {donation.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {donation.location}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleDateString()}</p>
                <p className="text-gray-600 mt-2"><strong>Status:</strong> {donation.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donor;
