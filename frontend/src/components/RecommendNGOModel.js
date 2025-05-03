import React, { useEffect, useState } from 'react';

const RecommendNGOModal = ({ pickup, onClose, onNgoSelected }) => {
  const [nearbyNgos, setNearbyNgos] = useState([]);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const volunteerId = localStorage.getItem('userId'); // ✅ Fetch volunteer id

  useEffect(() => {
    const fetchNearbyNgos = async () => {
      try {
        const [lng, lat] = pickup.coordinates?.coordinates || [];
        console.log('📍 Sending coordinates:', lat, lng); // Debug log
  
        const res = await fetch(`${BACKEND_URL}/api/volunteers/nearby-ngos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates: { lat, lng } // ✅ Correct structure expected by backend
          })
        });
  
        const data = await res.json();
        if (Array.isArray(data)) {
          setNearbyNgos(data);
        } else {
          console.warn('Unexpected response for NGOs:', data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch nearby NGOs', error);
      }
    };
  
    if (Array.isArray(pickup?.coordinates?.coordinates) && pickup.coordinates.coordinates.length === 2) {
      fetchNearbyNgos();
    } else {
      console.warn('⚠️ No valid pickup coordinates found:', pickup?.coordinates);
    }
  }, [pickup, BACKEND_URL]);
  

  const handleSubmit = async () => {
    if (!selectedNgoId) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/request-ngo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId,
          donationId: pickup._id,
          ngoId: selectedNgoId
        })
      });
      if (res.ok) {
        onNgoSelected(); // ✅ Success callback
      } else {
        console.error('Failed to recommend NGO');
      }
    } catch (error) {
      console.error('Error recommending NGO:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-green-700">
          Recommend NGO for "{pickup.foodItem}"
        </h2>

        {nearbyNgos.length === 0 ? (
          <p>No nearby NGOs found.</p>
        ) : (
          <select
            value={selectedNgoId}
            onChange={(e) => setSelectedNgoId(e.target.value)}
            className="border rounded p-2 w-full mb-4"
          >
            <option value="">Select an NGO</option>
            {nearbyNgos.map((ngo) => (
              <option key={ngo._id} value={ngo._id}>
                {ngo.ngoName}
              </option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedNgoId}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendNGOModal;
