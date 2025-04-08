import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUtensils, FaMapMarkerAlt, FaCalendarAlt, FaClipboardCheck,
  FaPhone, FaArchive, FaInfoCircle, FaBoxes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Donor = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    foodItem: '',
    foodType: '',
    quantity: '',
    packaging: '',
    location: '',
    foodPreparedDate: '',
    donationAvailableDate: '',
    expiryDate: '',
    pickupStartTime: '',
    pickupEndTime: '',
    servings: '',
    contactNumber: '',
    storageInstructions: '',
    specialNotes: '',
    isRefrigerated: 'No'
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const donorId = localStorage.getItem('userId');
  const [showWelcome, setShowWelcome] = useState(false);
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
    getCurrentLocation();
    fetchDonations();
    fetchPreviousLocations();
  }, []);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: { 'User-Agent': 'food-donation-app/1.0' }
          });
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setFormData(prev => ({ ...prev, location: address }));
        } catch {
          toast.error("❌ Failed to auto-fill location.");
        }
      }, () => toast.error("❌ Unable to access your location."));
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { foodItem, quantity, location, expiryDate } = formData;
    if (!foodItem || !quantity || !location || !expiryDate) {
      toast.warn("⚠️ Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          donor: donorId,
          preparedAt: formData.foodPreparedDate,
          availableFrom: formData.donationAvailableDate,
          isRefrigerated: formData.isRefrigerated === 'Yes'
        })
      });
      const data = await res.json();
      if (data._id) {
        toast.success('✅ Donation created!');
        setFormData({ foodItem: '', foodType: '', quantity: '', packaging: '', location: '',
          foodPreparedDate: '', donationAvailableDate: '', expiryDate: '',
          pickupStartTime: '', pickupEndTime: '', servings: '', contactNumber: '',
          storageInstructions: '', specialNotes: '', isRefrigerated: 'No' });
        fetchDonations();
        fetchPreviousLocations();
      } else toast.error('❌ Failed to create donation');
    } catch {
      toast.error('❌ Error during donation creation');
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
        <p className="text-gray-700 mb-10">Use the form below to donate food and track your contributions.</p>

        {/* Donation Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Create a Donation</h2>
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

            <div className="md:col-span-2">
              <input name="location" list="locationOptions" value={formData.location} onChange={handleChange} placeholder="Pickup Location" className="p-3 border rounded w-full" required />
              <datalist id="locationOptions">
                {locationSuggestions.map((loc, i) => <option key={i} value={loc} />)}
              </datalist>
            </div>

            {/* Date and Time Fields with Labels */}
            {[
              { label: 'When was the food prepared?', name: 'foodPreparedDate' },
              { label: 'When will it be available for donation?', name: 'donationAvailableDate' },
              { label: 'When does the food expire?', name: 'expiryDate' }
            ].map(({ label, name }) => (
              <div key={name} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 items-center gap-4 text-green-700">
                <label className="text-center font-medium">{label}</label>
                <input
                  type="datetime-local"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="p-3 border rounded w-full text-black"
                  required
                />
              </div>
            ))}

            {[
              { label: 'Pickup window starts at', name: 'pickupStartTime' },
              { label: 'Pickup window ends at', name: 'pickupEndTime' }
            ].map(({ label, name }) => (
              <div key={name} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 items-center gap-4 text-green-700">
                <label className="text-center font-medium">{label}</label>
                <input
                  type="time"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="p-3 border rounded w-full text-black"
                />
              </div>
            ))}

            <input name="servings" value={formData.servings} onChange={handleChange} placeholder="Servings (e.g., 20 people)" className="p-3 border rounded" />
            <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" className="p-3 border rounded" />
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
                Submit Donation
              </button>
            </div>
          </form>
        </div>

        {/* My Donations */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">My Donations</h2>
        {!donations.length ? (
          <p className="text-gray-500">You haven’t made any donations yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {donations.map((donation) => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaUtensils /> {donation.foodItem || 'Not Provided'}
                </h3>
                <p className="text-gray-700 flex items-center gap-2"><FaClipboardCheck /> Quantity: {donation.quantity}</p>
                {donation.foodType && <p className="text-gray-700 flex items-center gap-2"><FaBoxes /> Food Type: {donation.foodType}</p>}
                {donation.packaging && <p className="text-gray-700 flex items-center gap-2"><FaArchive /> Packaging: {donation.packaging}</p>}
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {donation.location}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleString()}</p>
                {donation.pickupStartTime && donation.pickupEndTime && <p className="text-gray-700">Pickup Time: {donation.pickupStartTime} - {donation.pickupEndTime}</p>}
                {donation.servings && <p className="text-gray-700">Servings: {donation.servings}</p>}
                {donation.contactNumber && <p className="text-gray-700 flex items-center gap-2"><FaPhone /> Contact: {donation.contactNumber}</p>}
                {donation.storageInstructions && <p className="text-gray-600 mt-2 flex items-center gap-2"><FaInfoCircle /> {donation.storageInstructions}</p>}
                {donation.specialNotes && <p className="text-gray-600">Notes: {donation.specialNotes}</p>}
                <p className="text-gray-600">Refrigerated: {donation.isRefrigerated ? 'Yes' : 'No'}</p>
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