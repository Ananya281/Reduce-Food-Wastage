import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from '../assets/savefood.jpeg';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Donor',
    contactNumber: '',
    volunteerAddress: '', // ✅ NEW
    ngoName: '',
    ngoRegNumber: '',
    ngoType: '',
    dailyFoodNeed: '',
    ngoAddress: '',
    website: '',
    ngoOperatingDays: [],
    ngoStartTime: '',
    ngoEndTime: '',
    locationCoordinates: {   // ✨ Add this
      type: 'Point',
      coordinates: []
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [googleSelectedRole, setGoogleSelectedRole] = useState('Donor');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const showSuccess = () => toast.success('🎉 Welcome to your Dashboard!');
  const showError = (msg) => toast.error(`❌ ${msg}`);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayChange = (day) => {
    setFormData(prev => {
      const updatedDays = prev.ngoOperatingDays.includes(day)
        ? prev.ngoOperatingDays.filter(d => d !== day)
        : [...prev.ngoOperatingDays, day];
      return { ...prev, ngoOperatingDays: updatedDays };
    });
  };

  const handleAutoFillLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }
  
    setIsLocating(true);
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
  
        // ✅ Strict validation check
        if (
          typeof latitude !== 'number' || typeof longitude !== 'number' ||
          isNaN(latitude) || isNaN(longitude)
        ) {
          toast.error('❌ Invalid coordinates received.');
          setIsLocating(false);
          return;
        }
  
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
  
          setFormData(prev => ({
            ...prev,
            ngoAddress: address,
            donorAddress: prev.role === 'Donor' ? address : prev.donorAddress,
            volunteerAddress: prev.role === 'Volunteer' ? address : prev.volunteerAddress, // ✅ Add this
            locationCoordinates: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          }));
  
          console.log("✅ Captured:", { lat: latitude, lon: longitude });
          toast.success('📍 Address and Coordinates captured!');
        } catch (err) {
          console.error('❌ Reverse geocode failed:', err);
          toast.error('Failed to fetch address');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        toast.error('Failed to retrieve your location');
        setIsLocating(false);
      }
    );
  };
  

  const navigateToDashboard = (role) => {
    if (role === 'Donor') navigate('/donor');
    else if (role === 'NGOs') navigate('/ngo');
    else if (role === 'Volunteer') navigate('/volunteer');
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(password);
  };  

  const handleRegister = async () => {
    let latestFormData = { ...formData };
  
    // Force-update the latest coordinates from input field if needed
    const coords = latestFormData.locationCoordinates?.coordinates;
    if (
      (latestFormData.role === 'Volunteer' || latestFormData.role === 'Donor' || latestFormData.role === 'NGOs') &&
      (!Array.isArray(latestFormData.locationCoordinates?.coordinates) ||
       latestFormData.locationCoordinates.coordinates.length !== 2 ||
       typeof latestFormData.locationCoordinates.coordinates[0] !== 'number' ||
       typeof latestFormData.locationCoordinates.coordinates[1] !== 'number')
    ) {
      return showError("📍 Please use the Use Location button to capture your coordinates.");
    }    
    else {
      const coords = latestFormData.locationCoordinates?.coordinates;
      if (
        !Array.isArray(coords) ||
        coords.length !== 2 ||
        typeof coords[0] !== 'number' ||
        typeof coords[1] !== 'number'
      ) {
        return showError("Please use the 📍 Use Location button to capture coordinates.");
      }
    }
  
    try {
      console.log("📤 Final Coordinates being sent:", coords);
      console.log("📤 Sending formData:", latestFormData);
  
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latestFormData)
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
  
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userName', data.user.fullName);
      localStorage.setItem('userRole', latestFormData.role);
  
      showSuccess();
      navigateToDashboard(latestFormData.role);
    } catch (error) {
      console.error('❌ Register Error:', error);
      showError(error.message);
    }
  };
  

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleCredential(credentialResponse.credential);
    setShowRoleSelect(true);
  };

  const handleGoogleError = () => showError('Google Sign Up failed');

  const handleGoogleRoleSubmit = async () => {
    try {
      if (!googleCredential) throw new Error('Missing Google credential');
      setIsGoogleLoading(true);

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: googleCredential, role: googleSelectedRole })
      });

      const data = await res.json();
      if (!res.ok || !data.user) throw new Error(data.error || 'Google registration failed');

      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userRole', googleSelectedRole);
      localStorage.setItem('userName', data.user.fullName);

      showSuccess();
      navigateToDashboard(googleSelectedRole);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsGoogleLoading(false);
      setShowRoleSelect(false);
    }
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gradient-to-r from-green-100 via-white to-green-50">
      <div className="absolute top-5 right-5 cursor-pointer text-2xl" onClick={() => navigate('/')}>✕</div>
      <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden w-full max-w-4xl bg-white mx-4 sm:mx-auto">
        <div className="hidden md:flex flex-col justify-center items-center bg-green-100 p-8 w-full md:w-1/2">
          <img src={loginImage} alt="Illustration" className="w-64 mb-6" />
          <p className="text-center text-gray-700 font-medium">“Don’t waste food, feed a soul.”</p>
        </div>
  
        <div className="w-full md:w-1/2 p-8">
  <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Create Account</h2>
  <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 mb-4 border rounded">
    <option value="Donor">Donor</option>
    <option value="NGOs">NGOs</option>
    <option value="Volunteer">Volunteer</option>
  </select>

  <input name="fullName" type="text" placeholder="Full Name" className="w-full p-3 mb-4 border rounded" onChange={handleChange} />
  <input name="email" type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded" onChange={handleChange} />
  <input name="password" type="password" placeholder="Password" className="w-full p-3 mb-4 border rounded" onChange={handleChange} />
  <input name="contactNumber" type="tel" placeholder="Contact Number" value={formData.contactNumber} className="w-full p-3 mb-4 border rounded" onChange={handleChange} />

  {/* ✅ Donor Location Block */}
  {formData.role === 'Donor' && (
    <div className="mb-4">
      <label htmlFor="donorAddress" className="text-sm font-medium block mb-1">Donor Address/Location</label>
      <div className="flex items-center gap-2">
        <input
          name="donorAddress"
          id="donorAddress"
          placeholder="Your Address"
          value={formData.donorAddress}
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
  )}

  {formData.role === 'Volunteer' && (
  <div className="mb-4">
    <label htmlFor="volunteerAddress" className="text-sm font-medium block mb-1">Your Address</label>
    <div className="flex items-center gap-2">
      <input
        name="volunteerAddress"
        id="volunteerAddress"
        placeholder="Your Address"
        value={formData.volunteerAddress}
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
)}

  {/* 🌐 Existing NGO fields remain unchanged below this */}
  {formData.role === 'NGOs' && (
  <>
    <input
      name="ngoName"
      placeholder="NGO Name"
      className="w-full p-3 mb-4 border rounded"
      onChange={handleChange}
    />
    <input
      name="ngoRegNumber"
      placeholder="Registration Number"
      className="w-full p-3 mb-4 border rounded"
      onChange={handleChange}
    />

    <select
      name="ngoType"
      value={formData.ngoType}
      onChange={handleChange}
      className="w-full p-3 mb-4 border rounded"
    >
      <option value="">Select NGO Type</option>
      <option value="Orphanage">Orphanage</option>
      <option value="Old Age Home">Old Age Home</option>
      <option value="Community Kitchen">Community Kitchen</option>
      <option value="Relief NGO">Relief NGO</option>
      <option value="Education Support">Education Support</option>
      <option value="Women Welfare">Women Welfare</option>
    </select>

    <input
      name="dailyFoodNeed"
      type="number"
      placeholder="Daily Food Requirement (No. of Meals)"
      className="w-full p-3 mb-4 border rounded"
      onChange={handleChange}
    />

    <div className="mb-4">
      <label htmlFor="ngoAddress" className="text-sm font-medium block mb-1">NGO Address</label>
      <div className="flex items-center gap-2">
        <input
          name="ngoAddress"
          id="ngoAddress"
          placeholder="Address"
          value={formData.ngoAddress}
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

    <div className="mb-4">
      <label className="text-sm font-medium block mb-1">Operating Days</label>
      <div className="flex flex-wrap gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <label key={day} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={formData.ngoOperatingDays.includes(day)}
              onChange={() => handleDayChange(day)}
            />
            {day}
          </label>
        ))}
      </div>
    </div>

    <div className="flex gap-4 mb-4">
      <input
        name="ngoStartTime"
        type="time"
        value={formData.ngoStartTime}
        onChange={handleChange}
        className="w-full p-3 border rounded"
        placeholder="Start Time"
      />
      <input
        name="ngoEndTime"
        type="time"
        value={formData.ngoEndTime}
        onChange={handleChange}
        className="w-full p-3 border rounded"
        placeholder="End Time"
      />
    </div>

    <input
      name="website"
      placeholder="Website (optional)"
      className="w-full p-3 mb-4 border rounded"
      onChange={handleChange}
    />
  </>
)}


  <button
  onClick={handleRegister}
  disabled={
    (['Donor', 'NGOs', 'Volunteer'].includes(formData.role) &&
     (!Array.isArray(formData.locationCoordinates.coordinates) ||
      formData.locationCoordinates.coordinates.length !== 2 ||
      typeof formData.locationCoordinates.coordinates[0] !== 'number' ||
      typeof formData.locationCoordinates.coordinates[1] !== 'number'))
  }
  className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
>
  Register
</button>


  <div className="my-4 text-center text-gray-500">or</div>
  <div className="flex justify-center mb-4">
    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
  </div>
  <p className="mt-4 text-sm text-center">
    Already have an account? <Link to="/login" className="text-green-700 font-semibold">Login</Link>
  </p>
</div>

      </div>
  
      {showRoleSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-bold text-green-700 mb-4">Select Your Role</h3>
            <select
              value={googleSelectedRole}
              onChange={(e) => setGoogleSelectedRole(e.target.value)}
              className="w-full p-3 mb-4 border rounded"
            >
              <option value="Donor">Donor</option>
              <option value="NGOs">NGOs</option>
              <option value="Volunteer">Volunteer</option>
            </select>
            <button
              onClick={handleGoogleRoleSubmit}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? 'Registering...' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Register;
