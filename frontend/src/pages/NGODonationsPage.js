import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';

const NGODonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [ngoTypeFilter, setNgoTypeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [timeSlotFilter, setTimeSlotFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [loadingDonationId, setLoadingDonationId] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const fetchNGODonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`);
      const data = await res.json();
      console.log('🚚 All donations:', data);
            if (!Array.isArray(data)) return toast.error('Invalid donation data');

      const ngoSpecific = data.filter(d => d.ngoRequest && d.ngoRequest.receiver
      );
      setDonations(ngoSpecific);
    } catch (error) {
      toast.error('❌ Failed to load NGO donations');
    }
  };

  const handleAcceptPickup = async (donationId, ngoDetails) => {
    try {
      const volunteerId = localStorage.getItem('userId');
      if (!volunteerId) {
        toast.error('❌ Please login again');
        return;
      }
      
      setLoadingDonationId(donationId);
  
      const res = await fetch(`${BACKEND_URL}/api/volunteers/accept/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer: volunteerId })
      });
  
      const data = await res.json();
  
      if (res.ok && data.status === 'Picked') {
        toast.success('✅ Pickup accepted successfully!');
        
        setDonations(prev =>
          prev.map(d => d._id === donationId ? { ...d, status: 'Picked' } : d)
        );
  
        if (ngoDetails?.email) {
          const emailRes = await fetch(`${BACKEND_URL}/api/email/notify-ngo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ngoEmail: ngoDetails.email,
              ngoName: ngoDetails.ngoName,
              foodItem: data.foodItem,
              volunteerId
            })
          });
  
          if (emailRes.ok) {
            toast.success('📩 Email successfully sent to NGO!');
          } else {
            toast.error('❌ Failed to send email to NGO.');
          }
        }
      } else {
        toast.error(data.error || '❌ Failed to accept pickup');
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Something went wrong');
    } finally {
      setLoadingDonationId(null);
    }
  };  
  

  useEffect(() => {
    fetchNGODonations();
  }, []);

  const sortDonations = (donations) => {
    if (sortOption === 'expirySooner') return [...donations].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    if (sortOption === 'expiryLater') return [...donations].sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    if (sortOption === 'newest') return [...donations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return donations;
  };

  const applyFilters = (donations) => {
    return donations.filter(d =>
      (!statusFilter || d.status === statusFilter) &&
      (!foodTypeFilter || d.foodType === foodTypeFilter) &&
      (!ngoTypeFilter || (d.ngoDetails && d.ngoDetails.type === ngoTypeFilter)) &&
      (!urgencyFilter || d.urgency === urgencyFilter) &&
      (!timeSlotFilter || d.pickupTimeSlot === timeSlotFilter)
    );
  };

  const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        <button onClick={() => navigate('/volunteer')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-green-700 mb-4">NGO Requested Donations</h1>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Picked">Picked</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Food Type</label>
            <select value={foodTypeFilter} onChange={(e) => setFoodTypeFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
              <option value="Packaged">Packaged</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">NGO Type</label>
            <select value={ngoTypeFilter} onChange={(e) => setNgoTypeFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All</option>
              <option value="Orphanage">Orphanage</option>
              <option value="Old Age Home">Old Age Home</option>
              <option value="Shelter">Shelter</option>
              <option value="Food Bank">Food Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Urgency</label>
            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pickup Slot</label>
            <select value={timeSlotFilter} onChange={(e) => setTimeSlotFilter(e.target.value)} className="p-2 border rounded">
              <option value="">All</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded">
              <option value="">Default</option>
              <option value="expirySooner">Expiry Date (Sooner)</option>
              <option value="expiryLater">Expiry Date (Later)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Donations List */}
        {donations.length === 0 ? (
          <p className="text-gray-500">No NGO-linked donations available currently.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortDonations(applyFilters(donations)).map(donation => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition relative">
                <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold shadow">
                  🏢 NGO Request
                </div>

                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {donation.foodItem}
                </h3>

                <p className="text-gray-700 flex items-center gap-2"><FaTruck /> Quantity: {donation.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {donation.location}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleDateString()}</p>

                {donation.ngoRequest && donation.ngoRequest.receiver && (
  <div className="mt-3 p-3 bg-green-50 rounded">
    <h4 className="font-semibold text-green-700 mb-1 flex items-center gap-2">
      <FaBuilding /> NGO Details
    </h4>
    <p className="text-gray-700 text-sm">🏠 {donation.ngoRequest.receiver.ngoName}</p>
    <p className="text-gray-700 text-sm">📍 {donation.ngoRequest.receiver.ngoAddress}</p>
    <p className="text-gray-700 text-sm">🗂️ {donation.ngoRequest.receiver.ngoType}</p>
  </div>
)}


                {donation.status === 'Available' ? (
                  isExpired(donation.expiryDate) ? (
                    <div className="mt-3 px-3 py-2 bg-red-100 text-red-800 rounded text-center font-semibold">
                      ❌ Expired (Cannot Accept)
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptPickup(donation._id, donation.ngoRequest.receiver)}
                      disabled={loadingDonationId === donation._id}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 flex justify-center items-center gap-2"
                    >
                      {loadingDonationId === donation._id ? 'Processing...' : '✅ Accept & Notify NGO'}
                    </button>
                  )
                ) : (
                  <div className="mt-3 px-3 py-2 bg-yellow-100 text-yellow-800 rounded text-center font-semibold">
                    🟡 {donation.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default NGODonationsPage;
