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
    foodItem: '', // ✅ Add this line
    foodType: '',
    quantity: '',
    urgency: 'Normal',
    preferredDate: '',
    specialNotes: ''
  });
  const [selectedTab, setSelectedTab] = useState('requests');
  const [recommendedDonations, setRecommendedDonations] = useState([]);
  const uniqueRecommendations = recommendedDonations.filter(
    (value, index, self) =>
      index === self.findIndex((v) => v._id === value._id)
  );  
  

  const navigate = useNavigate();
  const receiverId = localStorage.getItem('userId');
  const [statusFilter, setStatusFilter] = useState('');
const [urgencyFilter, setUrgencyFilter] = useState('');
const [sortOrder, setSortOrder] = useState('newest');


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

  const fetchRecommendedDonations = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/recommended?ngo=${receiverId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecommendedDonations(data);  // This now includes pending + confirmed
      }
    } catch (error) {
      console.error('❌ Error fetching volunteer recommended donations:', error);
      toast.error('Failed to load volunteer recommendations.');
    }
  };
  

  useEffect(() => {
    if (receiverId) {
      fetchRequests();
      fetchRecommendedDonations(); // 🔥 Add this line!
    }
  }, [receiverId]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('❌ Geolocation is not supported by your browser.');
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
  
        try {
          const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY;
  
          if (!apiKey) {
            throw new Error("OpenCage API key is missing");
          }
  
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
          );
  
          if (!res.ok) throw new Error('Failed to fetch address');
  
          const data = await res.json();
          const address = data.results[0]?.formatted || `${latitude}, ${longitude}`;
  
          setFormData(prev => ({ ...prev, location: address }));
  
          toast.success("📍 NGO Location auto-filled!");
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("❌ Failed to fetch location.");
        }
      },
      (error) => {
        console.warn("Location access denied:", error.message);
        toast.error("❌ Unable to access your location.");
      }
    );
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/requests${isEditing ? `/${editRequestId}` : ''}`;
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const { location, ...restFormData } = formData;
      const payload = { ...restFormData, foodItem: formData.foodItem, receiver: receiverId };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });          

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      toast.success(`✅ Request ${isEditing ? 'updated' : 'submitted'} successfully!`);
      setFormData({
        foodItem: '',
        foodType: '',
        quantity: '',
        urgency: 'Normal',
        preferredDate: '',
        specialNotes: ''
      });
      setIsEditing(false);
      setEditRequestId(null);
      fetchRequests();
    } catch (error) {
      toast.error(`❌ ${error.message}`);
      console.error('Submission error:', error);
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
      foodItem: req.foodItem,
      foodType: req.foodType,
      quantity: req.quantity,
      urgency: req.urgency,
      preferredDate: req.preferredDate?.split('T')[0] || '',
      specialNotes: req.specialNotes
    });
    setEditRequestId(req._id);
    setIsEditing(true);
  };

  const handleClone = (req) => {
    setFormData({
      foodItem: req.foodItem,
      foodType: req.foodType,
      quantity: req.quantity,
      urgency: req.urgency,
      preferredDate: '',
      specialNotes: req.specialNotes
    });
    setIsEditing(false);
    setEditRequestId(null);
  };

  const handleAcceptRecommendation = async (donationId) => {
    try {
      const ngoId = localStorage.getItem('userId');
  
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/accept-recommendation/${donationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ngoId })
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success('✅ Recommendation Accepted!');
        fetchRecommendedDonations();
        fetchRequests();
      } else {
        toast.error(data.error || '❌ Failed to accept recommendation');
      }
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      toast.error('❌ Server error while accepting');
    }
  };
  
  
  const handleRejectRecommendation = async (donationId) => {
    try {
      const ngoId = localStorage.getItem('userId');
  
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/reject-recommendation/${donationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ngoId })
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success('❌ Recommendation Rejected');
        fetchRecommendedDonations();
      } else {
        toast.error(data.error || '❌ Failed to reject recommendation');
      }
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
      toast.error('❌ Server error while rejecting');
    }
  };
  

  const filteredRequests = requests
  .filter(req =>
    (!statusFilter || req.status === statusFilter) &&
    (!urgencyFilter || req.urgency === urgencyFilter)
  )
  .sort((a, b) => {
    const dateA = new Date(a.preferredDate || a.requestedAt);
    const dateB = new Date(b.preferredDate || b.requestedAt);
    return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
  });

  const markAsDelivered = async (donationId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/mark-delivered/${donationId}`, {
        method: 'PATCH'
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success('✅ Marked as Delivered!');
        fetchRequests(); // Refresh pickup list
      } else {
        toast.error(data.error || '❌ Failed to mark as delivered');
      }
    } catch (err) {
      console.error('Error marking delivered:', err);
      toast.error('❌ Error updating delivery status');
    }
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
            <input name="foodItem" value={formData.foodItem} onChange={handleChange} placeholder="Food Item" required className="p-3 border rounded" />
            <select name="foodType" value={formData.foodType} onChange={handleChange} className="p-3 border rounded" required>
              <option value="">Select Food Type</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Cooked">Cooked</option>
              <option value="Canned">Canned</option>
              <option value="Packaged">Packaged</option>
              <option value="Raw">Raw</option>
              <option value="Other">Other</option>
            </select>
            <input name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="p-3 border rounded" />
            <select name="urgency" value={formData.urgency} onChange={handleChange} className="p-3 border rounded">
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input name="preferredDate" type="date" value={formData.preferredDate} onChange={handleChange} className="p-3 border rounded" />
            <textarea name="specialNotes" value={formData.specialNotes} onChange={handleChange} placeholder="Special Notes" className="p-3 border rounded md:col-span-2" rows={3} />
            <button type="submit" className="bg-green-600 text-white py-3 rounded col-span-1 md:col-span-2 hover:bg-green-700">{isEditing ? 'Update Request' : 'Submit Request'}</button>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-4 mb-8">
            <button onClick={() => setSelectedTab('requests')} className={`px-4 py-2 rounded-full ${selectedTab === 'requests' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>📋 My Requests</button>
            <button onClick={() => setSelectedTab('recommendations')} className={`px-4 py-2 rounded-full ${selectedTab === 'recommendations' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              🔔 Volunteer Notifications {uniqueRecommendations.filter(d => d.status === 'Pending').length > 0 && (
  <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
    {uniqueRecommendations.filter(d => d.status === 'Pending').length}
  </span>
)}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All Urgencies</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 border rounded">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <button onClick={() => { setStatusFilter(''); setUrgencyFilter(''); setSortOrder('newest'); }} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">🔄 Reset Filters</button>
          </div>
        </div>

        {/* Tabs Content */}
        {selectedTab === 'recommendations' ? (
          <>
  <h2 className="text-2xl font-bold text-green-700 mb-4">🔔 Volunteer Recommendations</h2>
  {loading ? (
    <p className="text-gray-500">Loading volunteer notifications...</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {uniqueRecommendations.filter(d => d.status === 'Pending').map((donation) => (
        <div key={donation._id} className="card bg-white p-5 rounded-xl shadow border hover:shadow-lg transition">
          <div className="text-gray-700 space-y-1 mb-2">
            <h3 className="text-xl font-semibold text-green-700">{donation.foodItem}</h3>
            <p className="flex items-center gap-2">🍽️ Quantity: {donation.quantity}</p>
            <p className="flex items-center gap-2">📦 Food Type: {donation.foodType}</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => handleAcceptRecommendation(donation._id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">✅ Accept</button>
            <button onClick={() => handleRejectRecommendation(donation._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm">❌ Reject</button>
          </div>
        </div>
      ))}
    </div>
  )}

  <h2 className="text-2xl font-bold text-green-700 mt-10 mb-4">🚚 My Pickups</h2>
  {uniqueRecommendations.filter(d => d.status === 'Accepted' || d.status === 'Delivered').length === 0 ? (
    <p className="text-gray-500">No pickups yet.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {uniqueRecommendations
        .filter((donation) => donation.status === 'Accepted' || donation.status === 'Delivered')
        .map((donation) => (
          <div key={donation._id} className="bg-white p-5 rounded-xl shadow border hover:shadow-lg transition">
            <div className="text-gray-700 space-y-1 mb-2">
              <h3 className="text-xl font-semibold text-green-700">{donation.foodItem}</h3>
              <p className="flex items-center gap-2">🍽️ Quantity: {donation.quantity}</p>
              <p className="flex items-center gap-2">📦 Food Type: {donation.foodType}</p>
              <p className="flex items-center gap-2">📌 Status: {donation.status}</p>
            </div>
            {donation.status === 'Accepted' && (
              <button onClick={() => markAsDelivered(donation._id)} className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">✅ Mark as Delivered</button>
            )}
          </div>
        ))}
    </div>
  )}
</>

        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Submitted Requests</h2>
            {loading ? (
              <p className="text-gray-500">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-gray-500">No requests found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRequests.map((req) => (
                  <div key={req._id} className="bg-white p-5 rounded-xl shadow border hover:shadow-lg transition">
                  {req.status === 'Pending' && (
    <div className="flex justify-end gap-4 mb-2 text-sm font-medium">
      <button onClick={() => handleEdit(req)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
        ✏️ Edit
      </button>
      <button onClick={() => handleDelete(req._id)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
        🗑️ Delete
      </button>
    </div>
  )}


                    <div className="text-gray-700 space-y-1 mb-2">
                      <div className="flex items-center gap-2 text-xl font-semibold text-green-700">
                        <FaBoxOpen /> {req.foodType || 'N/A'}
                      </div>
                      <p className="flex items-center gap-2">🍽️ <span className="font-medium">Food Item:</span> {req.foodItem}</p>
                      <p className="flex items-center gap-2">🕒 <span className="font-medium">Quantity:</span> {req.quantity}</p>
                      <p className={`flex items-center gap-2 ${req.urgency === 'Urgent' ? 'text-red-600 font-semibold' : ''}`}>🚩 <span className="font-medium">Urgency:</span> {req.urgency}</p>
                      {req.preferredDate && (<p className="flex items-center gap-2">📅 <span className="font-medium">Preferred:</span> {new Date(req.preferredDate).toLocaleDateString()}</p>)}
                      {req.specialNotes && (<p className="flex items-start gap-2 text-gray-500 italic">📝 {req.specialNotes}</p>)}
                    </div>
                    {req.ngoDetails?.address && (<p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {req.ngoDetails.address}</p>)}
                    {req.ngoDetails?.name && (<p className="text-gray-700 font-medium">NGO: {req.ngoDetails.name}</p>)}
                    <span className={`inline-block px-3 py-1 rounded-full text-white text-sm mt-3 ${req.status === 'Pending' ? 'bg-blue-500' : req.status === 'Picked' ? 'bg-yellow-500' : req.status === 'Delivered' ? 'bg-green-600' : 'bg-gray-400'}`}>{req.status}</span>
                    {req.status === 'Accepted' && req.donation && (
                      <button onClick={() => markAsDelivered(req._id)} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">✅ Mark as Delivered</button>
                    )}
                    <button onClick={() => handleClone(req)} className="text-green-600 hover:text-green-800 mt-2 text-sm block">🔁 Request Again</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NGO;
