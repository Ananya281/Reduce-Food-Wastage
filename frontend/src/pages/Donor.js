import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUtensils, FaMapMarkerAlt, FaCalendarAlt, FaClipboardCheck,
  FaPhone, FaArchive, FaInfoCircle, FaBoxes, FaTrash, FaEdit, FaFlag, FaLocationArrow
} from 'react-icons/fa';


import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Donor = () => {
  const [donations, setDonations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    foodItem: '', foodType: '', quantity: '', packaging: '', location: '',
    foodPreparedDate: '', donationAvailableDate: '', expiryDate: '',
    pickupStartTime: '', pickupEndTime: '', servings: '',
    storageInstructions: '', specialNotes: '', isRefrigerated: 'No',
    coordinates: { lat: null, lng: null },
    ngoRequestId: null // ✅ Add this line
  });
  const [ngoRequests, setNgoRequests] = useState([]);

  const [sortBy, setSortBy] = useState('createdAt'); // default sort by createdAt

  const [isLocating, setIsLocating] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const donorId = localStorage.getItem('userId');
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchText, setSearchText] = useState('');
const [filterType, setFilterType] = useState('');
const [filterStatus, setFilterStatus] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!donorId) {
      toast.error('⚠️ Please login again. User ID missing.');
      navigate('/');
      return;
    }
  
    if (routeLocation.state?.welcome) {
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3000);
    }
  
    if (routeLocation.state?.prefillRequest) {
      const req = routeLocation.state.prefillRequest;
      setFormData(prev => ({
        ...prev,
        foodItem: req.foodItem || '',
        foodType: req.foodType || '',
        quantity: req.quantity || '',
        location: req.location || '',
        contactNumber: req.contactNumber || '',
        specialNotes: req.specialNotes || '',
        ngoRequestId: req._id  // ✅ Add this line
      }));
      toast.info('📝 NGO request prefilled. Please complete the donation form.');
    }
  
    handleAutoFillLocation(); // ✅ FIXED: this now invokes the function
    fetchDonations();
    fetchPreviousLocations();
    fetchNGORequests();
  }, []);
  

  const handleAutoFillLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('❌ Geolocation is not supported by your browser.');
    }
  
    setIsLocating(true);
  
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
  
          setFormData(prev => ({
            ...prev,
            location: address,
            ngoAddress: address,
            coordinates: { lat: latitude, lng: longitude }
          }));
  
          toast.success("📍 Location auto-filled!");
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("❌ Failed to fetch address.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Location access denied:", error);
        toast.error("❌ Unable to access your location.");
        setIsLocating(false);
      }
    );
  };
  
  
  

  const fetchDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations/donor/${donorId}`);
      const data = await res.json();
      setDonations(Array.isArray(data) ? data : []);
    } catch {
      toast.error("❌ Failed to load your donations.");
    }
  };

  const fetchPreviousLocations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations/locations/${donorId}`);
      const data = await res.json();
      setLocationSuggestions(data || []);
    } catch (err) {
      console.error('Error fetching previous locations:', err);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("❌ Geolocation is not supported by your browser.");
      return;
    }
  
    setIsLocating(true); // ✅ Start spinner
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'food-donation-app/1.0',
                'Accept': 'application/json'
              }
            }
          );
  
          if (!res.ok) throw new Error('Failed to fetch address');
  
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
  
          setFormData(prev => ({
            ...prev,
            location: address,
            coordinates: { lat: latitude, lng: longitude }
          }));
  
          toast.success("📍 Location auto-filled!");
        } catch (error) {
          toast.error("❌ Failed to auto-fill location.");
          console.error("Reverse geocoding error:", error);
        } finally {
          setIsLocating(false); // ✅ Stop spinner
        }
      },
      (error) => {
        toast.error("❌ Unable to access your location.");
        setIsLocating(false); // ✅ Stop spinner
      }
    );
  };
  
  

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { foodItem, quantity, location, expiryDate, foodPreparedDate, donationAvailableDate, coordinates } = formData;

    if (!foodItem || !quantity || !location || !expiryDate || !foodPreparedDate || !donationAvailableDate) {
      toast.warn("⚠️ Please fill all required fields");
      return;
    }

    if (!coordinates.lat || !coordinates.lng) {
      toast.error("❌ Location coordinates missing");
      return;
    }

    try {
      const url = editingId
        ? `${BACKEND_URL}/api/donations/${editingId}`
        : `${BACKEND_URL}/api/donations`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          donor: donorId,
          ngoRequestId: formData.ngoRequestId || null, // ✅ Add this
          preparedAt: formData.foodPreparedDate,
          availableFrom: formData.donationAvailableDate,
          isRefrigerated: formData.isRefrigerated === 'Yes',
          coordinates: formData.coordinates
        })
      });

      const data = await res.json();

      if (data._id || data.modifiedCount) {
        toast.success(editingId ? '✏️ Donation updated!' : '✅ Donation created!');
        setEditingId(null);
        setFormData({
          foodItem: '', foodType: '', quantity: '', packaging: '', location: '',
          foodPreparedDate: '', donationAvailableDate: '', expiryDate: '',
          pickupStartTime: '', pickupEndTime: '', 
          servings: '',
          storageInstructions: '', specialNotes: '', isRefrigerated: 'No',
          coordinates: { lat: null, lng: null }
        });
        fetchDonations();
        fetchPreviousLocations();
      } else toast.error('❌ Failed to save donation');
    } catch {
      toast.error('❌ Error during donation save');
    }
  };

  const handleDelete = async (donationId) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/donations/${donationId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('🗑️ Donation deleted!');
        setDonations(prev => prev.filter(d => d._id !== donationId));
      } else {
        toast.error(data.error || '❌ Could not delete donation.');
      }
    } catch {
      toast.error('❌ Error deleting donation.');
    }
  };

  const handleEdit = (donation) => {
    setEditingId(donation._id);
    setFormData({
      ...donation,
      foodPreparedDate: donation.preparedAt?.slice(0, 16) || '',
      donationAvailableDate: donation.availableFrom?.slice(0, 16) || '',
      expiryDate: donation.expiryDate?.slice(0, 16) || '',
      isRefrigerated: donation.isRefrigerated ? 'Yes' : 'No',
      coordinates: donation.coordinates || { lat: null, lng: null }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDonateAgain = (donation) => {
    setEditingId(null); // Ensure it's treated as a new donation
    setFormData({
      ...donation,
      foodPreparedDate: '',
      donationAvailableDate: '',
      expiryDate: '',
      pickupStartTime: '',
      pickupEndTime: '',
      coordinates: donation.coordinates || { lat: null, lng: null },
      isRefrigerated: donation.isRefrigerated ? 'Yes' : 'No'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };  

  const fetchNGORequests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/requests`);
      const data = await res.json();
      setNgoRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load NGO requests:", error);
    }
  };  

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {showWelcome && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded mb-6 text-center text-lg font-medium shadow">
            🎉 Welcome to your Dashboard!
          </div>
        )}

        <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 hover:underline">← Back to Home</button>
        <h1 className="text-4xl font-bold text-green-700 mb-2">Welcome, Donor!</h1>
        <p className="text-gray-700 mb-10">Use the form below to {editingId ? 'update' : 'create'} a donation and track your contributions.</p>

        <button
  onClick={() => navigate('/ngo-requests')}
  className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
>
  📋 View NGO Requests
</button>


        {/* Donation Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">{editingId ? 'Edit Donation' : 'Create a Donation'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="foodItem" value={formData.foodItem} onChange={handleChange} placeholder="Food Item" className="p-3 border rounded" required />
            <select name="foodType" value={formData.foodType} onChange={handleChange} className="p-3 border rounded" required>
              <option value="" disabled>Select Food Type</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Canned">Canned</option>
              <option value="Cooked">Cooked</option>
              <option value="Packaged">Packaged</option>
              <option value="Raw">Raw</option>
              <option value="Other">Other</option>
            </select>
            <input name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity (e.g., 10kg)" className="p-3 border rounded" required />
            <input name="packaging" value={formData.packaging} onChange={handleChange} placeholder="Packaging Type" className="p-3 border rounded" />
 {/* Address field + auto location button */}
 <div className="mb-4">
 <label htmlFor="location" className="text-sm font-medium block mb-1">Donor Address/Location</label>
 <div className="flex items-center gap-2">
  <input
  name="location"
  id="location"
  placeholder="Donor Address/Location"
  value={formData.location}
  className="flex-1 p-3 border rounded"
  onChange={handleChange}
/>
    <button
  type="button"
  disabled={isLocating}
  onClick={handleAutoFillLocation}
  className={`text-sm px-3 py-2 border rounded transition ${
    isLocating
      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
      : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
  }`}
>
  {isLocating ? 'Fetching...' : '📍 Use Location'}
</button>

  </div>
</div>



            {[
              { label: 'When was the food prepared?', name: 'foodPreparedDate' },
              { label: 'When will it be available for donation?', name: 'donationAvailableDate' },
              { label: 'When does the food expire?', name: 'expiryDate' }
            ].map(({ label, name }) => (
              <div key={name} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 items-center gap-4 text-green-700">
                <label className="text-center font-medium">{label}</label>
                <input type="datetime-local" name={name} value={formData[name]} onChange={handleChange} className="p-3 border rounded w-full text-black" required />
              </div>
            ))}

            {[{ label: 'Pickup window starts at', name: 'pickupStartTime' },
              { label: 'Pickup window ends at', name: 'pickupEndTime' }]
              .map(({ label, name }) => (
                <div key={name} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 items-center gap-4 text-green-700">
                  <label className="text-center font-medium">{label}</label>
                  <input type="time" name={name} value={formData[name]} onChange={handleChange} className="p-3 border rounded w-full text-black" />
                </div>
              ))}

            <input name="servings" value={formData.servings} onChange={handleChange} placeholder="Servings (e.g., 20 people)" className="p-3 border rounded" />
            <textarea name="storageInstructions" value={formData.storageInstructions} onChange={handleChange} placeholder="Storage Instructions" rows="3" className="p-3 border rounded col-span-1 md:col-span-2" />
            <textarea name="specialNotes" value={formData.specialNotes} onChange={handleChange} placeholder="Allergens / Special Notes" rows="2" className="p-3 border rounded col-span-1 md:col-span-2" />

            <div className="flex items-center gap-2">
              <label>Is Refrigerated?</label>
              <select name="isRefrigerated" value={formData.isRefrigerated} onChange={handleChange} className="p-2 border rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded mt-2 transition">
                {editingId ? 'Update Donation' : 'Submit Donation'}
              </button>
            </div>
          </form>
        </div>
{/* Filter Controls */}
<div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="p-2 border rounded"
  >
    <option value="">All Statuses</option>
    <option value="Available">Available</option>
    <option value="Picked">Picked</option>
    <option value="Delivered">Delivered</option>
  </select>

  <select
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
    className="p-2 border rounded"
  >
    <option value="">All Food Types</option>
    <option value="Veg">Veg</option>
    <option value="Non-Veg">Non-Veg</option>
    <option value="Canned">Canned</option>
    <option value="Cooked">Cooked</option>
    <option value="Packaged">Packaged</option>
    <option value="Raw">Raw</option>
    <option value="Other">Other</option>
  </select>

  <select
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    className="p-2 border rounded"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
  </select>
  <select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="p-2 border rounded"
>
  <option value="createdAt">Sort by Created Date</option>
  <option value="expiryDate">Sort by Expiry Date</option>
</select>
</div>{/* Dashboard Summary Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-blue-100 p-5 rounded-xl shadow text-center">
    <h3 className="text-2xl font-bold text-blue-700">{donations.length}</h3>
    <p className="text-sm text-gray-600 mt-2">Total Donations</p>
  </div>
  <div className="bg-yellow-100 p-5 rounded-xl shadow text-center">
    <h3 className="text-2xl font-bold text-yellow-700">
      {donations.filter(d => d.status === 'Available' || d.status === 'Picked').length}
    </h3>
    <p className="text-sm text-gray-600 mt-2">Ongoing Donations</p>
  </div>
  <div className="bg-green-100 p-5 rounded-xl shadow text-center">
    <h3 className="text-2xl font-bold text-green-700">
      {donations.filter(d => d.status === 'Delivered').length}
    </h3>
    <p className="text-sm text-gray-600 mt-2">Completed Donations</p>
  </div>
  <div className="bg-purple-100 p-5 rounded-xl shadow text-center">
    <h3 className="text-2xl font-bold text-purple-700">{ngoRequests.length}</h3>
    <p className="text-sm text-gray-600 mt-2">Pending NGO Requests</p>
  </div>
</div>

        {/* My Donations */}
  <h2 className="text-2xl font-bold text-green-700 mb-4">My Donations</h2>

        {!donations.length ? (
          <p className="text-gray-500">You haven’t made any donations yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donations
  .filter(donation =>
    (!filterStatus || donation.status === filterStatus) &&
    (!filterType || donation.foodType === filterType)
  )
  .sort((a, b) => {
  const dateA = new Date(sortBy === 'createdAt' ? a.createdAt : a.expiryDate);
  const dateB = new Date(sortBy === 'createdAt' ? b.createdAt : b.expiryDate);
  return searchText === 'oldest' ? dateA - dateB : dateB - dateA;
})
  .map((donation) => (
    <div key={donation._id} className="relative bg-white p-5 rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out border border-gray-200">

{/* Edit/Delete Icons */}
{donation?.status === 'Available' && (
  <div className="absolute top-3 right-3 flex space-x-3">
    <FaEdit
      onClick={() => handleEdit(donation)}
      className="text-yellow-500 hover:text-yellow-600 cursor-pointer"
      title="Edit"
      size={18}
    />
    <FaTrash
      onClick={() => handleDelete(donation._id)}
      className="text-red-600 hover:text-red-700 cursor-pointer"
      title="Delete"
      size={18}
    />
  </div>
)}

{/* Top Badge */}
<div className="mb-4">
  {donation.ngoDetails ? (
    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
      🎯 Donated to NGO : {donation.ngoDetails.name || 'NGO'}
    </span>
  ) : (
    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
      🍱 General Donation
    </span>
  )}
</div>

{/* Food Item */}
<h3 className="text-xl md:text-2xl font-bold text-green-700 mb-2 flex items-center gap-2">
  <FaUtensils /> {donation.foodItem || 'Not Provided'}
</h3>

{/* Main Details */}
<div className="space-y-2 text-gray-700 text-sm md:text-base">
  <p><FaClipboardCheck className="inline-block mr-2" /> <strong>Quantity:</strong> {donation.quantity}</p>
  {donation.foodType && (
    <p><FaBoxes className="inline-block mr-2" /> <strong>Food Type:</strong> {donation.foodType}</p>
  )}
  {donation.packaging && (
    <p><FaArchive className="inline-block mr-2" /> <strong>Packaging:</strong> {donation.packaging}</p>
  )}
  <p><FaMapMarkerAlt className="inline-block mr-2" /> <strong>Location:</strong> {donation.location}</p>
  <p><FaCalendarAlt className="inline-block mr-2" /> <strong>Expiry:</strong> {new Date(donation.expiryDate).toLocaleString()}</p>

  {donation.pickupStartTime && donation.pickupEndTime && (
    <p><strong>Pickup Time:</strong> {donation.pickupStartTime} - {donation.pickupEndTime}</p>
  )}

  {donation.servings && (
    <p><strong>Servings:</strong> {donation.servings}</p>
  )}

  {donation.storageInstructions && (
    <p><FaInfoCircle className="inline-block mr-2" /> <strong>Storage:</strong> {donation.storageInstructions}</p>
  )}

  {donation.specialNotes && (
    <p><strong>Notes:</strong> {donation.specialNotes}</p>
  )}

  <p><strong>Refrigerated:</strong> {donation.isRefrigerated ? 'Yes' : 'No'}</p>

  {/* Status */}
  <p className="mt-2"><strong>Status:</strong> 
  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
    donation.status === 'Available'
      ? 'bg-green-100 text-green-700'
      : donation.status === 'Picked'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-blue-100 text-blue-700'
  }`}>
    {donation.status}
  </span>
</p>

</div>

{/* Donate Again Button */}
{donation.status !== 'Available' && (
  <button
    onClick={() => handleDonateAgain(donation)}
    className="mt-4 px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded transition"
  >
    ♻️ Donate Again
  </button>
)}

</div>

            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donor;
