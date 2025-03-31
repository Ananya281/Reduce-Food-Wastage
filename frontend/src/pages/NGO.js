import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaMapMarkerAlt, FaClock, FaFlag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NGO = () => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    location: '',
    urgency: 'Normal',
    preferredDate: '',
    contactNumber: '',
    specialNotes: ''
  });

  const navigate = useNavigate();
  const receiverId = localStorage.getItem('userId');

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests?receiver=${receiverId}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('❌ Failed to fetch requests');
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    if (receiverId) fetchRequests();
    getCurrentLocation(); // 📍 Auto-location
  }, [receiverId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setFormData(prev => ({ ...prev, location: address }));
        } catch (err) {
          console.error("Geolocation reverse lookup failed:", err);
        }
      }, (error) => {
        console.warn("Geolocation error:", error.message);
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, receiver: receiverId })
      });

      const data = await res.json();
      if (data._id) {
        toast.success('✅ Request submitted successfully!');
        setFormData({
          foodType: '',
          quantity: '',
          location: '',
          urgency: 'Normal',
          preferredDate: '',
          contactNumber: '',
          specialNotes: ''
        });
        fetchRequests();
      } else {
        toast.error('❌ Failed to submit request');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('❌ Error during submission');
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
          Request food donations for your organization. Provide the details below and track your requests.
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
              placeholder="Food Type (e.g. Cooked, Dry, Grains)"
              className="p-3 border rounded"
              required
            />
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity (e.g. 50 meals)"
              className="p-3 border rounded"
              required
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Delivery/Pickup Location"
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
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              placeholder="Preferred Date"
              className="p-3 border rounded"
            />
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              className="p-3 border rounded"
            />
            <textarea
              name="specialNotes"
              value={formData.specialNotes}
              onChange={handleChange}
              placeholder="Special Notes (e.g. no spicy food, for children)"
              rows="3"
              className="p-3 border rounded col-span-1 md:col-span-2"
            />
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
        {requests.length === 0 ? (
          <p className="text-gray-500">You haven’t made any requests yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaBoxOpen /> {req.foodType || 'N/A'}
                </h3>
                <p className="text-gray-700 flex items-center gap-2"><FaFlag /> Urgency: {req.urgency || 'N/A'}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaClock /> Quantity: {req.quantity || 'N/A'}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {req.location || 'N/A'}</p>
                {req.preferredDate && (
                  <p className="text-gray-700"><strong>Preferred Date:</strong> {new Date(req.preferredDate).toLocaleDateString()}</p>
                )}
                {req.contactNumber && (
                  <p className="text-gray-700"><strong>Contact:</strong> {req.contactNumber}</p>
                )}
                {req.specialNotes && (
                  <p className="text-gray-600 italic"><strong>Note:</strong> {req.specialNotes}</p>
                )}
                <p className="text-gray-600 mt-2">
                  <strong>Status:</strong> {req.status || 'Pending'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGO;
