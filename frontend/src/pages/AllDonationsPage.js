import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck,
  FaBuilding, FaExclamationCircle, FaUtensils
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const AllDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('ngo'); // 'ngo', 'general', 'expired'
  const [loadingId, setLoadingId] = useState(null);
  const [filters, setFilters] = useState({
    status: '', foodType: '', ngoType: '', urgency: '', pickupSlot: '', sort: ''
  });

  const volunteerId = localStorage.getItem('userId')?.trim();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonations();
  }, []);//render component ui, blank initially 
  //side effect to fetch donations data from backend
  
  const fetchDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`);
      const data = await res.json();
      if (!Array.isArray(data)) return toast.error("Invalid donation data");
      setDonations(data);
    } catch (error) {
      toast.error('❌ Failed to load donations');
    }
  };

  const handleAccept = async (donationId) => {
    try {
      setLoadingId(donationId);
      const res = await fetch(`${BACKEND_URL}/api/volunteers/accept/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer: volunteerId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('✅ Pickup accepted!');
        fetchDonations();
      } else {
        toast.error(data?.error || '❌ Could not accept donation');
      }
    } catch (error) {
      toast.error('❌ Network error while accepting');
    } finally {
      setLoadingId(null);
    }
  };

  const filterDonations = () => {
    const now = new Date();
    let filtered = [...donations];

if (activeTab === 'ngo') {
  filtered = filtered.filter(d =>
    (d.ngoDetails?.ngoId || d.ngoDetails?.name || d.ngoRequestId) &&
    (!d.volunteer || d.volunteer === volunteerId)
  );
}


else if (activeTab === 'general') {
  filtered = filtered.filter(
    d =>
      d.status === 'Available' &&
      !d.ngoDetails?.ngoId &&              // not linked via ID
      !d.ngoRequestId &&                   // not created via request
      !d.ngoDetails?.name &&               // NEW: exclude manual NGO donations
      (!d.volunteer || d.volunteer === volunteerId)
  );
}
 else if (activeTab === 'expired') {
      filtered = filtered.filter(d => new Date(d.expiryDate) < now);
    }

    if (filters.status) filtered = filtered.filter(d => d.status === filters.status);
    if (filters.foodType) filtered = filtered.filter(d => d.foodType === filters.foodType);
    if (filters.ngoType) filtered = filtered.filter(d => d.ngoRequest?.receiver?.ngoType === filters.ngoType);
    if (filters.urgency) filtered = filtered.filter(d => d.urgency === filters.urgency);
    if (filters.pickupSlot) filtered = filtered.filter(d => d.pickupTimeSlot === filters.pickupSlot);

    if (filters.sort === 'expirySooner') filtered.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    if (filters.sort === 'expiryLater') filtered.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    if (filters.sort === 'createdNewest') {
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

if (filters.sort === 'createdOldest') {
  filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}
    return filtered;
  };

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/volunteer')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-green-700 mb-6">All Donations</h1>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('ngo')} className={`px-4 py-2 rounded ${activeTab === 'ngo' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
            <FaBuilding className="inline mr-2" /> NGO Requests
          </button>
          <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded ${activeTab === 'general' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
            <FaUtensils className="inline mr-2" /> General Donations
          </button>
          <button onClick={() => setActiveTab('expired')} className={`px-4 py-2 rounded ${activeTab === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
            <FaExclamationCircle className="inline mr-2" /> Expired Donations
          </button>
        </div>

        {/* Filters for NGO tab */}
        {activeTab === 'ngo' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <select onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="p-2 border rounded">
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Picked">Picked</option>
              <option value="Delivered">Delivered</option>
            </select>
            <select onChange={(e) => setFilters({ ...filters, foodType: e.target.value })} className="p-2 border rounded">
              <option value="">All Food Types</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Cooked">Cooked</option>
              <option value="Packaged">Packaged</option>
            </select>
            <select onChange={(e) => setFilters({ ...filters, ngoType: e.target.value })} className="p-2 border rounded">
              <option value="">All NGO Types</option>
              <option value="Relief NGO">Relief NGO</option>
              <option value="Orphanage">Orphanage</option>
              <option value="Old Age Home">Old Age Home</option>
            </select>
            <select onChange={(e) => setFilters({ ...filters, urgency: e.target.value })} className="p-2 border rounded">
              <option value="">All Urgencies</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select onChange={(e) => setFilters({ ...filters, pickupSlot: e.target.value })} className="p-2 border rounded">
              <option value="">All Slots</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
            <select onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="p-2 border rounded">
  <option value="">Default</option>
  <option value="expirySooner">Sooner Expiry</option>
  <option value="expiryLater">Later Expiry</option>
  <option value="createdNewest">Newest First</option> 
  <option value="createdOldest">Oldest First</option> 
</select>
          </div>
        )}

        {filterDonations().length === 0 ? (
          <p className="text-gray-500">No donations in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterDonations().map(donation => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition relative">
                {activeTab === 'expired' && (
                  <div className="absolute top-3 right-3 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                    ❌ Expired
                  </div>
                )}

                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {donation.foodItem}
                </h3>

                <p className="text-gray-700 flex items-center gap-2"><FaTruck /> Quantity: {donation.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {donation.location}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleDateString()}</p>

                {activeTab === 'ngo' && donation.ngoRequest?.receiver && (
                  <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                    <p><strong>NGO:</strong> {donation.ngoRequest.receiver.ngoName}</p>
                    <p><strong>Type:</strong> {donation.ngoRequest.receiver.ngoType}</p>
                    <p><strong>Address:</strong> {donation.ngoRequest.receiver.ngoAddress}</p>
                    <p className="mt-2 text-blue-700 font-semibold">📦 Status: {donation.status}</p>
                  </div>
                )}

                {(activeTab === 'general' || activeTab === 'ngo') && (
                  <>
                    {donation.status === 'Available' ? (
                      <button
                        onClick={() => handleAccept(donation._id)}
                        disabled={loadingId === donation._id}
                        className={`mt-4 w-full ${loadingId === donation._id ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded transition`}
                      >
                        {loadingId === donation._id ? 'Accepting...' : 'Accept Pickup'}
                      </button>
                    ) : donation.volunteer === volunteerId ? (
                      <p className="mt-4 text-green-600 font-semibold text-center">✅ Already Picked</p>
                    ) : (
                      <p className="mt-4 text-gray-500 text-sm text-center">🚫 Picked by another volunteer</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllDonationsPage;