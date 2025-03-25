import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaMapMarkerAlt, FaClock, FaFlag } from 'react-icons/fa';

const NGO = () => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    location: '',
    urgency: 'Normal'
  });

  const navigate = useNavigate();

  const fetchRequests = async () => {
    const res = await fetch('http://localhost:5000/api/requests');
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : data.requests || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const receiverId = localStorage.getItem('donorId') || 'REPLACE_WITH_VALID_USER_ID';
    const res = await fetch('http://localhost:5000/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, receiver: receiverId })
    });
    const data = await res.json();
    if (data._id) {
      alert('Request submitted!');
      setFormData({ foodType: '', quantity: '', location: '', urgency: 'Normal' });
      fetchRequests();
    } else {
      alert('Failed to submit request');
    }
  };

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Home
        </button>

        <h1 className="text-4xl font-bold text-green-700 mb-2">Welcome, NGO!</h1>
        <p className="text-gray-700 mb-10">
          Request food donations for your organization and help reduce hunger. Submit a request below and track its status.
        </p>

        {/* Request Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Request Food</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="foodType"
              value={formData.foodType}
              onChange={handleChange}
              placeholder="Food Type"
              className="p-3 border rounded"
              required
            />
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
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
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="p-3 border rounded"
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded mt-2 transition"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>

        {/* Requests List */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">Your Requests</h2>
        {!Array.isArray(requests) || requests.length === 0 ? (
          <p className="text-gray-500">You haven’t made any requests yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaBoxOpen /> {req.foodType}
                </h3>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaFlag /> Urgency: {req.urgency}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaClock /> Quantity: {req.quantity}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> Location: {req.location}
                </p>
                <p className="text-gray-600 mt-2"><strong>Status:</strong> {req.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGO;
