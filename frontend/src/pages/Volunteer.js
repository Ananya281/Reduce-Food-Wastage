// Volunteer.js
// Updated: Includes display of additional donation details for pickup cards

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaCheckCircle, FaRoute, FaStar, FaBoxes, FaClock, FaSnowflake, FaStickyNote } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'react-toastify/dist/ReactToastify.css';

const Volunteer = () => {
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [availability, setAvailability] = useState(true);
  const [volunteerLocation, setVolunteerLocation] = useState([28.6139, 77.2090]);
  const [filters, setFilters] = useState({ foodType: '', quantity: '', urgency: '' });
  const [showModal, setShowModal] = useState(false);
  const [currentPickupId, setCurrentPickupId] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });

  const mapRef = useRef();
  const routingRef = useRef();
  const navigate = useNavigate();
  const volunteerId = localStorage.getItem('userId');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const fetchAvailableDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: volunteerId, location: volunteerLocation, filters })
      });
      const data = await res.json();
      setVolunteerTasks(Array.isArray(data) ? data : []);
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
        method: 'PATCH'
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
        body: JSON.stringify({ volunteer: volunteerId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Pickup accepted!");
        fetchAvailableDonations();
        fetchVolunteerPickups();
      } else {
        toast.error(data.error || "❌ Failed to accept pickup");
      }
    } catch (error) {
      toast.error("❌ Error accepting pickup");
    }
  };

  const handleMarkDelivered = (donationId) => {
    setCurrentPickupId(donationId);
    setShowModal(true);
  };

  const submitFeedback = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations/complete/${currentPickupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Marked as delivered!");
        setShowModal(false);
        fetchVolunteerPickups();
      } else {
        toast.error("❌ Failed to mark as delivered");
      }
    } catch (error) {
      toast.error("❌ Error submitting feedback");
    }
  };

  const showRouteToDonation = (donation) => {
    if (!donation.coordinates) return;
    const map = mapRef.current;
    if (!map) return;

    if (routingRef.current) routingRef.current.remove();

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(volunteerLocation[0], volunteerLocation[1]),
        L.latLng(donation.coordinates.lat, donation.coordinates.lng)
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false
    }).addTo(map);
  };

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    localStorage.setItem('volunteerFilters', JSON.stringify(newFilters));
  };

  useEffect(() => {
    const saved = localStorage.getItem('volunteerFilters');
    if (saved) setFilters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (volunteerId) {
      fetchAvailability();
      fetchVolunteerPickups();
      navigator.geolocation.getCurrentPosition(
        (pos) => setVolunteerLocation([pos.coords.latitude, pos.coords.longitude]),
        () => toast.warn("⚠️ Using default location")
      );
    }
  }, [volunteerId]);

  useEffect(() => {
    if (volunteerLocation) fetchAvailableDonations();
  }, [volunteerLocation]);

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-sm text-blue-600 hover:underline">← Back</button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">Volunteer Dashboard</h1>
          <button onClick={toggleAvailability} className={`px-4 py-1 rounded-full text-white ${availability ? 'bg-green-600' : 'bg-red-500'}`}>
            {availability ? 'Available' : 'Unavailable'}
          </button>
        </div>

        <div className="mb-6">
          <Link to="/volunteer/all-donations" className="text-blue-600 underline text-sm">
            👉 View all available donations as cards
          </Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input name="foodType" value={filters.foodType} onChange={handleFilterChange} placeholder="Food Type" className="p-2 border rounded" />
            <input name="quantity" value={filters.quantity} onChange={handleFilterChange} placeholder="Min Qty" type="number" className="p-2 border rounded" />
            <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Urgency</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
            <button onClick={fetchAvailableDonations} className="bg-blue-600 text-white rounded px-4 py-2">Apply</button>
          </div>
        </div>

        <MapContainer center={volunteerLocation} zoom={13} className="h-96 rounded-xl mb-10" whenCreated={(map) => mapRef.current = map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {volunteerTasks.map((donation, idx) => (
            donation.coordinates && (
              <Marker key={idx} position={[donation.coordinates.lat, donation.coordinates.lng]}>
                <Popup>
                  <strong>{donation.foodItem}</strong><br />
                  Qty: {donation.quantity}<br />
                  <button onClick={() => { showRouteToDonation(donation); handleAccept(donation._id); }} className="text-sm bg-blue-600 text-white px-2 py-1 rounded mt-2">
                    Accept & Navigate
                  </button>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>

        <h2 className="text-2xl font-bold text-green-700 mb-4">My Pickups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myPickups.map((pickup) => (
            <div key={pickup._id} className="bg-white p-5 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2"><FaHandHoldingHeart /> {pickup.foodItem}</h3>
              <p className="text-gray-700"><FaTruck className="inline mr-1" /> Qty: {pickup.quantity}</p>
              <p className="text-gray-700"><FaBoxes className="inline mr-1" /> Type: {pickup.foodType}</p>
              <p className="text-gray-700"><FaMapMarkerAlt className="inline mr-1" /> {pickup.location}</p>
              <p className="text-gray-700"><FaCalendarAlt className="inline mr-1" /> Prepared: {pickup.foodPreparedAt ? new Date(pickup.foodPreparedAt).toLocaleString() : 'N/A'}</p>
              <p className="text-gray-700"><FaCalendarAlt className="inline mr-1" /> Available: {pickup.foodAvailableFrom ? new Date(pickup.foodAvailableFrom).toLocaleString() : 'N/A'}</p>
              <p className="text-gray-700"><FaCalendarAlt className="inline mr-1" /> Expiry: {pickup.expiryDate ? new Date(pickup.expiryDate).toLocaleString() : 'N/A'}</p>
              {pickup.pickupTimeStart && pickup.pickupTimeEnd && (
                <p className="text-gray-700"><FaClock className="inline mr-1" /> Pickup Time: {pickup.pickupTimeStart} - {pickup.pickupTimeEnd}</p>
              )}
              {pickup.servings && <p className="text-gray-700">Servings: {pickup.servings}</p>}
              {pickup.isRefrigerated && <p className="text-gray-700"><FaSnowflake className="inline mr-1" /> Refrigerated</p>}
              {pickup.specialNotes && <p className="text-gray-700"><FaStickyNote className="inline mr-1" /> Notes: {pickup.specialNotes}</p>}
              {pickup.donor && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Donor:</strong> {pickup.donor.fullName}</p>
                  <p><strong>Contact:</strong> {pickup.donor.contactNumber}</p>
                </div>
              )}
              <p className="text-gray-600 mt-2"><FaCheckCircle className="inline mr-1" /> Status: {pickup.status}</p>
              {pickup.status === 'picked' && (
                <button onClick={() => handleMarkDelivered(pickup._id)} className="mt-4 w-full bg-green-600 text-white py-2 rounded">Mark as Delivered</button>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
              <h3 className="text-xl font-bold mb-4">Leave Feedback</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <FaStar
                    key={num}
                    onClick={() => setFeedback({ ...feedback, rating: num })}
                    className={`cursor-pointer ${feedback.rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <textarea
                placeholder="Write your comment..."
                className="w-full border p-2 mb-4 rounded"
                rows={3}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              ></textarea>
              <button onClick={submitFeedback} className="bg-green-600 text-white px-4 py-2 rounded w-full">Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteer;
