import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaMapMarkerAlt, FaClock, FaFlag, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NGO = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRequestId, setEditRequestId] = useState(null);
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
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests?receiver=${receiverId}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('❌ Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receiverId) fetchRequests();
    getCurrentLocation();
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
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/requests${isEditing ? `/${editRequestId}` : ''}`;
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, receiver: receiverId })
      });

      const data = await res.json();
      if (data._id || data.success) {
        toast.success(`✅ Request ${isEditing ? 'updated' : 'submitted'} successfully!`);
        setFormData({
          foodType: '',
          quantity: '',
          location: '',
          urgency: 'Normal',
          preferredDate: '',
          contactNumber: '',
          specialNotes: ''
        });
        setIsEditing(false);
        setEditRequestId(null);
        fetchRequests();
      } else {
        toast.error(`❌ Failed to ${isEditing ? 'update' : 'submit'} request`);
      }
    } catch (error) {
      toast.error(`❌ Error during ${isEditing ? 'update' : 'submission'}`);
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to cancel this request?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🗑️ Request cancelled successfully');
        fetchRequests();
      } else {
        toast.error('❌ Failed to cancel request');
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      toast.error('❌ Error while cancelling request');
    }
  };

  const handleEdit = (req) => {
    setFormData({
      foodType: req.foodType,
      quantity: req.quantity,
      location: req.location,
      urgency: req.urgency,
      preferredDate: req.preferredDate?.split('T')[0] || '',
      contactNumber: req.contactNumber,
      specialNotes: req.specialNotes
    });
    setEditRequestId(req._id);
    setIsEditing(true);
  };

  const handleClone = (req) => {
    setFormData({
      foodType: req.foodType,
      quantity: req.quantity,
      location: req.location,
      urgency: req.urgency,
      preferredDate: '',
      contactNumber: req.contactNumber,
      specialNotes: req.specialNotes
    });
    setIsEditing(false);
    setEditRequestId(null);
  };

  return (
    <div className="pt-24 px-6 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-700">NGO Dashboard</h1>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">← Home</button>
        </div>

        {/* Request Form */}
        <div className="bg-gray-50 p-6 rounded-xl shadow mb-10">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">{isEditing ? 'Edit Request' : 'Submit a Food Request'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="foodType" value={formData.foodType} onChange={handleChange} placeholder="Food Type" required className="p-3 border rounded" />
            <input name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="p-3 border rounded" />
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required className="p-3 border rounded" />
            <select name="urgency" value={formData.urgency} onChange={handleChange} className="p-3 border rounded">
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input name="preferredDate" type="date" value={formData.preferredDate} onChange={handleChange} className="p-3 border rounded" />
            <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" className="p-3 border rounded" />
            <textarea name="specialNotes" value={formData.specialNotes} onChange={handleChange} placeholder="Special Notes" className="p-3 border rounded md:col-span-2" rows={3} />
            <button type="submit" className="bg-green-600 text-white py-3 rounded col-span-1 md:col-span-2 hover:bg-green-700">
              {isEditing ? 'Update Request' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Request List */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">Submitted Requests</h2>
        {loading ? (
          <p className="text-gray-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-500">No requests found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="bg-white p-5 rounded-xl shadow border hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2"><FaBoxOpen /> {req.foodType || 'N/A'}</h3>
                  {req.status === 'Pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(req)} className="text-blue-600 hover:text-blue-800" title="Edit Request">✏️</button>
                      <button onClick={() => handleDelete(req._id)} className="text-red-600 hover:text-red-800" title="Cancel Request">
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 flex items-center gap-2"><FaClock /> Quantity: {req.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaFlag /> Urgency: {req.urgency}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {req.location}</p>
                {req.preferredDate && <p className="text-gray-700">Preferred: {new Date(req.preferredDate).toLocaleDateString()}</p>}
                {req.contactNumber && <p className="text-gray-700">Contact: {req.contactNumber}</p>}
                {req.specialNotes && <p className="text-gray-500 italic">Note: {req.specialNotes}</p>}
                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm mt-2 ${
                  req.status === 'Pending' ? 'bg-blue-500' :
                  req.status === 'Picked' ? 'bg-yellow-500' :
                  req.status === 'Delivered' ? 'bg-green-600' : 'bg-gray-400'
                }`}>
                  {req.status}
                </span>
                <button onClick={() => handleClone(req)} className="text-green-600 hover:text-green-800 mt-2 text-sm">
                  🔁 Request Again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGO;
