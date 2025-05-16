import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHandHoldingHeart, FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaCheckCircle,
  FaStar, FaBoxes, FaClock, FaSnowflake, FaStickyNote
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import ReactDOMServer from 'react-dom/server';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'react-toastify/dist/ReactToastify.css';
import RecommendNGOModal from '../components/RecommendNGOModel';  // ✅ (make sure file path is correct)

const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Volunteer = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPickup, setCurrentPickup] = useState(null);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [availability, setAvailability] = useState(true);
  const [volunteerLocation, setVolunteerLocation] = useState([30.3498687, 76.3731228]);
  const [locationName, setLocationName] = useState('');
  const [filters, setFilters] = useState({
    foodType: '', urgency: '', timeSlot: '', vehicleAvailable: '', maxDistance: '',
  });
  const [pickupFilters, setPickupFilters] = useState({
  status: '',
  foodType: '',
  search: '',
  sort: '', // 'newest' or 'oldest'
});

  const mapRef = useRef();
  const routingRef = useRef();
  const navigate = useNavigate();
  const volunteerId = localStorage.getItem('userId');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleRecommendNGO = (pickup) => {
    setCurrentPickup(pickup);
    setShowModal(true);
  };  

  const donationIcon = new L.divIcon({
    html: ReactDOMServer.renderToString(<MdLocationOn size={32} color="#e53935" />),
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

  const fetchAvailableDonations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: volunteerId, location: volunteerLocation, filters })
      });
      let data = await res.json();
      if (Array.isArray(data)) {
        data = data.map(donation => {
          if (donation.coordinates && donation.coordinates.lat && donation.coordinates.lng) {
            const dist = getDistanceInKm(
              volunteerLocation[0],
              volunteerLocation[1],
              donation.coordinates.lat,
              donation.coordinates.lng
            );
            return { ...donation, distance: dist.toFixed(2) };
          }
          return donation;
        });
        if (filters.maxDistance) {
          data = data.filter(d => parseFloat(d.distance) <= parseFloat(filters.maxDistance));
        }
        data.sort((a, b) => a.distance - b.distance);
        setVolunteerTasks(data);
        if (data.length === 0) toast.info("ℹ️ No donations found matching filters.");
      } else {
        toast.info("ℹ️ No donations found.");
        setVolunteerTasks([]);
      }
    } catch (error) {
      console.error("❌ Donation fetch failed:", error);
      toast.error("❌ Failed to fetch donations");
    }
  };
  console.log("Volunteer ID:", volunteerId);

  const fetchVolunteerPickups = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/${volunteerId}/pickups`);
      const data = await res.json();
      console.log("Fetched pickups:", data); // ✅ Add this line
      setMyPickups(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("❌ Failed to fetch pickups");
    }
  };

  const filterMyPickups = () => {
  let filtered = [...myPickups];
  console.log("Showing pickups without filter:", myPickups);

  if (pickupFilters.status) {
    filtered = filtered.filter(p => p.status === pickupFilters.status);
  }

  if (pickupFilters.foodType) {
    filtered = filtered.filter(p => p.foodType === pickupFilters.foodType);
  }

  if (pickupFilters.search) {
    filtered = filtered.filter(p =>
      p.foodItem.toLowerCase().includes(pickupFilters.search.toLowerCase())
    );
  }

  if (pickupFilters.sort === 'newest') {
    filtered.sort((a, b) => new Date(b.acceptedAt) - new Date(a.acceptedAt));
  } else if (pickupFilters.sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.acceptedAt) - new Date(b.acceptedAt));
  }

  return filtered;
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
      const res = await fetch(`${BACKEND_URL}/api/volunteers/${volunteerId}/toggleAvailability`, { method: 'PATCH' });
      const data = await res.json();
      setAvailability(data.availability);
    } catch (error) {
      toast.error("❌ Could not update availability");
    }
  };

  const [acceptedDonationId, setAcceptedDonationId] = useState(null);  // ✨ New state

  const handleAccept = async (donationId) => {
    if (!volunteerId) {
      return toast.error("❌ You must be logged in to accept.");
    }
  
    const target = volunteerTasks.find(d => d._id === donationId);
    if (target && target.status !== 'Available') {
      return toast.warning("⚠️ This donation is no longer available.");
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/accept/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer: volunteerId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Pickup accepted!");
        setAcceptedDonationId(donationId);   // ✨ Save which donation was accepted
        fetchAvailableDonations();
        fetchVolunteerPickups();
      } else {
        toast.error(data.error || "❌ Failed to accept pickup");
      }
    } catch (error) {
      console.error("❌ Error accepting pickup:", error);
      toast.error("❌ Error accepting pickup");
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
        (pos) => {
          setVolunteerLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationName(`Lat: ${pos.coords.latitude.toFixed(3)}, Lng: ${pos.coords.longitude.toFixed(3)}`);
        },
        () => {
          toast.warn("⚠️ Using default location (Patiala)");
          setLocationName("Default: Patiala");
        }
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

        <p className="text-sm text-gray-600 mb-2">📍 Your Location: {locationName}</p>

        

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            <select name="foodType" value={filters.foodType} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Food Type</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
              <option value="Packaged">Packaged</option>
            </select>
            <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Urgency</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
            <select name="timeSlot" value={filters.timeSlot} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Time Slot</option>
              <option value="Morning">Morning (6 AM - 12 PM)</option>
              <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
              <option value="Evening">Evening (4 PM - 8 PM)</option>
              <option value="Night">Night (8 PM - 12 AM)</option>
              <option value="Late Night">Late Night (12 AM - 6 AM)</option>
            </select>
            <select name="vehicleAvailable" value={filters.vehicleAvailable} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Vehicle</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
            <select name="maxDistance" value={filters.maxDistance} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Distance</option>
              <option value="2">≤ 2 km</option>
              <option value="5">≤ 5 km</option>
              <option value="10">≤ 10 km</option>
            </select>
            <button onClick={fetchAvailableDonations} className="bg-blue-600 text-white rounded px-4 py-2">Apply</button>
          </div>
        </div>

        <MapContainer center={volunteerLocation} zoom={13} className="h-96 rounded-xl mb-10" whenCreated={(map) => mapRef.current = map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {volunteerTasks.map((donation, idx) => (
            donation.coordinates?.lat && donation.coordinates?.lng && (
              <Marker key={idx} position={[donation.coordinates.lat, donation.coordinates.lng]} icon={donationIcon}>
                <Popup>
                  <strong>{donation.foodItem}</strong><br />
                  Qty: {donation.quantity}<br />
                  📍 {donation.distance} km away<br />
                  <button onClick={() => { showRouteToDonation(donation); handleAccept(donation._id); }} className="text-sm bg-blue-600 text-white px-2 py-1 rounded mt-2">
                    Accept & Navigate
                  </button>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
        <div className="text-right mt-2">
        
<div className="flex justify-end mb-6">
  <button
    onClick={() => navigate('/volunteer/alldonations')}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
  >
    📋 View All Donations
  </button>
</div>

</div>
<div className="flex flex-wrap gap-4 mb-4">
  <select
    value={pickupFilters.status}
    onChange={(e) => setPickupFilters({ ...pickupFilters, status: e.target.value })}
    className="p-2 border rounded"
  >
    <option value="">All Status</option>
    <option value="Picked">Picked</option>
    <option value="Delivered">Delivered</option>
  </select>

  <select
    value={pickupFilters.foodType}
    onChange={(e) => setPickupFilters({ ...pickupFilters, foodType: e.target.value })}
    className="p-2 border rounded"
  >
    <option value="">All Food Types</option>
    <option value="Veg">Veg</option>
    <option value="Non-Veg">Non-Veg</option>
    <option value="Snacks">Snacks</option>
    <option value="Drinks">Drinks</option>
    <option value="Packaged">Packaged</option>
  </select>

  <input
    type="text"
    placeholder="Search by food item"
    value={pickupFilters.search}
    onChange={(e) => setPickupFilters({ ...pickupFilters, search: e.target.value })}
    className="p-2 border rounded w-52"
  />

  <select
    value={pickupFilters.sort}
    onChange={(e) => setPickupFilters({ ...pickupFilters, sort: e.target.value })}
    className="p-2 border rounded"
  >
    <option value="">Sort By</option>
    <option value="newest">Newest Accepted</option>
    <option value="oldest">Oldest Accepted</option>
  </select>
</div>

{/* My Pickups Section */}
<div className="bg-white p-4 rounded-lg shadow">
  <h2 className="text-xl font-semibold mb-4 text-green-700">My Pickups</h2>
  
  {myPickups.length === 0 ? (
    <p className="text-gray-600">No pickups yet.</p>
  ) : (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{filterMyPickups().map((pickup) => (
<div key={pickup._id} className="relative bg-gray-100 rounded p-4 shadow">
  <h3 className="text-lg font-semibold text-gray-800">{pickup.foodItem}</h3>
  <p className="text-sm text-gray-600">Location: {pickup.location}</p>
  <p className="text-sm text-gray-600">Servings: {pickup.servings}</p>
  <p className="text-sm text-gray-600">
    Pickup Time: {pickup.pickupStartTime || '-'} - {pickup.pickupEndTime || '-'}
  </p>

  <span className="mt-2 inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
    Picked
  </span>

  {/* ✅ Conditionally show Recommend NGO button */}
{pickup.status === 'Picked' &&
 !pickup.ngoRequestId && !pickup.ngoDetails && (
  <button
    onClick={() => handleRecommendNGO(pickup)}
    className="mt-3 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
  >
    Recommend NGO
  </button>
)}


  {/* 🎯 Floating NGO tag */}
{(pickup.ngoRequestId || pickup.ngoDetails) && (
  <div className="absolute bottom-3 right-3">
    <span className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
      🎯 Already tagged to NGO
    </span>
  </div>
)}

</div>


        ))}
      </div>

      {/* ✨ Place the Modal outside map - only once! */}
      {showModal && currentPickup && (
        <RecommendNGOModal 
          pickup={currentPickup}
          onClose={() => setShowModal(false)}
          onNgoSelected={() => {
            setShowModal(false);
            fetchVolunteerPickups(); // Refresh pickups after NGO linked
            toast.success('✅ NGO successfully linked!');
          }}
        />
      )}
    </>
  )}
</div>
      </div>
    </div>
  );
};

export default Volunteer;
