import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';

const Volunteer = () => {
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [availability, setAvailability] = useState(true);
  const [volunteerLocation, setVolunteerLocation] = useState([28.6139, 77.2090]);
  const navigate = useNavigate();

  const volunteerId = localStorage.getItem('userId');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Ensure volunteer document exists
  const createVolunteerIfNotExists = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: volunteerId })
      });
    } catch (error) {
      console.error('Volunteer creation error:', error);
    }
  };

  const fetchAvailableDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`);
      const data = await res.json();
      setVolunteerTasks(Array.isArray(data) ? data.filter(d => d.status === 'Available') : []);
    } catch (error) {
      toast.error("❌ Failed to fetch donations");
    }
  };

  const fetchVolunteerPickups = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/${volunteerId}/pickups`);
      const data = await res.json();
      setMyPickups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch pickups error:", error);
      toast.error("❌ Failed to fetch pickups");
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/${volunteerId}`);
      const data = await res.json();
      if (typeof data.availability === 'boolean') setAvailability(data.availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/${volunteerId}/toggleAvailability`, {
        method: 'PATCH',
      });
      const data = await res.json();
      setAvailability(data.availability);
    } catch (error) {
      toast.error("❌ Could not update availability");
    }
  };

  const handleAccept = async (donationId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/accept/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer: volunteerId }),
      });

      const data = await res.json();

      if (data._id) {
        toast.success("✅ Pickup accepted!");
        setVolunteerTasks(prev => prev.filter(d => d._id !== donationId));
        fetchVolunteerPickups(); // refresh pickups from DB
      } else {
        toast.error("❌ Failed to accept pickup");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Error accepting pickup");
    }
  };

  useEffect(() => {
    if (volunteerId) {
      createVolunteerIfNotExists();
      fetchAvailability();
      fetchAvailableDonations();
      fetchVolunteerPickups();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVolunteerLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        console.warn("Using default location");
      }
    );
  }, [volunteerId]);

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 hover:underline">
          ← Back to Home
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-700 mb-2">Welcome, Volunteer!</h1>
            <p className="text-gray-700">
              Help bridge the gap between donors and the needy. Accept pickups and manage deliveries below.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm mb-1">Availability:</p>
            <button
              onClick={toggleAvailability}
              className={`px-4 py-1 rounded-full text-white ${availability ? 'bg-green-600' : 'bg-red-500'}`}
            >
              {availability ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        {/* Map with Nearby Donations */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">Nearby Donations Map</h2>
        <MapContainer center={volunteerLocation} zoom={12} className="h-96 rounded-xl mb-10">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {volunteerTasks.map((donation, idx) => (
            donation.coordinates && (
              <Marker key={idx} position={[donation.coordinates.lat, donation.coordinates.lng]}>
                <Popup>
                  <strong>{donation.foodItem}</strong><br />
                  Qty: {donation.quantity}<br />
                  <button
                    onClick={() => handleAccept(donation._id)}
                    className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>

        {/* Available Donations */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">Available Donations</h2>
        {volunteerTasks.length === 0 ? (
          <p className="text-gray-500">No available donations right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteerTasks.map((donation) => (
              <div key={donation._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {donation.foodItem}
                </h3>
                <p className="text-gray-700 flex items-center gap-2"><FaTruck /> Quantity: {donation.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {donation.location}</p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt /> Expiry: {new Date(donation.expiryDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleAccept(donation._id)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                >
                  Accept Pickup
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Pickups */}
        <h2 className="text-2xl font-bold text-green-700 mt-12 mb-4">My Pickups</h2>
        {myPickups.length === 0 ? (
          <p className="text-gray-500">You have not accepted any pickups yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPickups.map((pickup) => (
              <div key={pickup._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaHandHoldingHeart /> {pickup.foodItem}
                </h3>
                <p className="text-gray-700 flex items-center gap-2"><FaTruck /> Quantity: {pickup.quantity}</p>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Location: {pickup.location}</p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt /> Expiry: {new Date(pickup.expiryDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaCheckCircle /> <strong>Status:</strong> {pickup.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteer;
