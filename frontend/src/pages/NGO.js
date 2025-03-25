// File: src/pages/NGO.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="pt-24 p-6">
      <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 underline">← Back to Home</button>
      <h1 className="text-3xl font-bold text-green-700 mb-4">Welcome, NGO!</h1>
      <p className="text-gray-700 mb-8">This is your dashboard to request and receive food donations.</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Request Food</h2>
        <input
          type="text"
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
          placeholder="Food Type"
          className="w-full p-2 mb-4 border"
          required
        />
        <input
          type="text"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Quantity"
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
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          className="w-full p-2 mb-4 border"
        >
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Submit Request</button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Your Requests</h2>
      {!Array.isArray(requests) || requests.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req._id} className="p-4 border rounded bg-white shadow-sm">
              <h3 className="font-bold text-green-700">{req.foodType}</h3>
              <p>Quantity: {req.quantity}</p>
              <p>Location: {req.location}</p>
              <p>Urgency: {req.urgency}</p>
              <p>Status: {req.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NGO;
