// src/pages/NGORequests.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUtensils, FaMapMarkerAlt, FaCalendarAlt, FaClipboardCheck, FaPhone, FaFlag, FaBuilding
} from 'react-icons/fa'; // 🔥 Added FaBuilding for NGO icons

const NGORequests = () => {
  const [ngoRequests, setNgoRequests] = useState([]);
  const navigate = useNavigate();

  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const [urgencyFilterTemp, setUrgencyFilterTemp] = useState('');
  const [typeFilterTemp, setTypeFilterTemp] = useState('');
  const [sortOrderTemp, setSortOrderTemp] = useState('newest');

  useEffect(() => {
    const fetchNGORequests = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests`);
        const data = await res.json();
        const pendingOnly = Array.isArray(data)
          ? data.filter((req) => req.status === 'Pending')
          : [];
        setNgoRequests(pendingOnly);
      } catch (error) {
        console.error("Failed to load NGO requests:", error);
      }
    };

    fetchNGORequests();
  }, []);

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/donor')}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back to Donor Dashboard
        </button>

        <h1 className="text-4xl font-bold text-green-700 mb-6">Pending NGO Food Requests</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={urgencyFilterTemp}
            onChange={(e) => setUrgencyFilterTemp(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Urgencies</option>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            value={typeFilterTemp}
            onChange={(e) => setTypeFilterTemp(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Food Types</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Cooked">Cooked</option>
            <option value="Canned">Canned</option>
            <option value="Packaged">Packaged</option>
            <option value="Raw">Raw</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sortOrderTemp}
            onChange={(e) => setSortOrderTemp(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="newest">Newest Preferred First</option>
            <option value="oldest">Oldest Preferred First</option>
          </select>

          <button
            onClick={() => {
              setUrgencyFilter(urgencyFilterTemp);
              setTypeFilter(typeFilterTemp);
              setSortOrder(sortOrderTemp);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🔍 Apply Filters
          </button>
        </div>

        {!ngoRequests.length ? (
          <p className="text-gray-500">No pending NGO requests right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ngoRequests
              .filter(req =>
                (!urgencyFilter || req.urgency === urgencyFilter) &&
                (!typeFilter || req.foodType === typeFilter)
              )
              .sort((a, b) => {
                const dateA = new Date(a.preferredDate);
                const dateB = new Date(b.preferredDate);
                return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
              })
              .map((req) => (
                <div key={req._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
                  <div className="mb-3 flex items-center gap-2 text-green-700 text-xl font-semibold">
                    <FaUtensils /> {req.foodItem ? `${req.foodItem} (${req.foodType})` : `Requested: ${req.foodType || 'N/A'}`}
                  </div>

                  {/* 🚀 NGO Details block */}
                  {req.receiver && (
                    <div className="text-gray-700 mb-2">
                      <p className="flex items-center gap-2">
                        <FaBuilding className="text-gray-500" />
                        <span><strong>NGO Name:</strong> {req.receiver.ngoName}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <FaFlag className="text-gray-500" />
                        <span><strong>NGO Type:</strong> {req.receiver.ngoType}</span>
                      </p>
                    </div>
                  )}

                  {/* Other basic details */}
                  <div className="text-gray-700 space-y-1">
                    <p className="flex items-center gap-2"><FaClipboardCheck className="text-gray-500" /> <span className="font-medium">Quantity:</span> {req.quantity}</p>
                    <p className="flex items-center gap-2"><FaFlag className="text-gray-500" /> <span className="font-medium">Urgency:</span> {req.urgency}</p>
                    <p className="flex items-start gap-2"><FaMapMarkerAlt className="text-gray-500 mt-1" /> <span><span className="font-medium">Location:</span> {req.location}</span></p>
                    {req.preferredDate && (
                      <p className="flex items-center gap-2"><FaCalendarAlt className="text-gray-500" /> <span className="font-medium">Preferred Date:</span> {new Date(req.preferredDate).toLocaleDateString()}</p>
                    )}
                    {req.contactNumber && (
                      <p className="flex items-center gap-2"><FaPhone className="text-gray-500" /> <span className="font-medium">Contact:</span> {req.contactNumber}</p>
                    )}
                    {req.specialNotes && (
                      <p className="italic text-sm text-gray-600 mt-1">Note: {req.specialNotes}</p>
                    )}
                  </div>

                  {/* Footer button */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                      {req.status}
                    </span>
                    <button
                      onClick={() => navigate('/donor', { state: { prefillRequest: req } })}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
                    >
                      ✅ Donate to this Request
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGORequests;
