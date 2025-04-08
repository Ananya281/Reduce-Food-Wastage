import React, { useEffect, useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const FeedbackHistory = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/donations/feedbacks`);
        const data = await res.json();
        setFeedbacks(data || []);
      } catch (error) {
        console.error('Error fetching feedback history:', error);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="pt-24 px-6 pb-16 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Volunteer Feedback History</h1>
        {feedbacks.length === 0 ? (
          <p>No feedbacks available yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((item) => (
              <div key={item._id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-green-700">{item.foodItem}</h2>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <FaStar
                        key={num}
                        className={item.feedback.rating >= num ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{item.feedback.comment}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2"><FaMapMarkerAlt /> {item.location}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2"><FaCalendarAlt /> Delivered: {new Date(item.deliveredAt).toLocaleString()}</p>
                {item.donor && <p className="text-sm text-gray-600 mt-1">Donor: <strong>{item.donor.fullName}</strong></p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackHistory;
