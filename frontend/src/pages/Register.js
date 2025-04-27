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
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
  
          setFormData(prev => ({
            ...prev,
            ngoAddress: address,
            locationCoordinates: {   // ✨ Add this
              type: 'Point',
              coordinates: [longitude, latitude] // Longitude first, then latitude
            }
          }));
  
          toast.success('📍 Address and Coordinates captured!');
        } catch (err) {
          toast.error('Failed to fetch address');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
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
    const { fullName, email, password, contactNumber, role } = formData;
    if (!fullName || !email || !password || !role) return showError("Fill all basic fields");
    if (!validatePassword(password)) return showError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
    if (!contactNumber) return showError("Contact number is required");
    
    if (role === 'NGOs') {
      if (
        !formData.ngoRegNumber ||
        !formData.ngoType ||
        !formData.dailyFoodNeed ||
        !formData.ngoName ||
        !formData.ngoAddress ||
        !formData.ngoOperatingDays.length ||
        !formData.ngoStartTime ||
        !formData.ngoEndTime
      ) {
        return showError("Please fill all required NGO details");
      }
    }  

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userName', data.user.fullName);
      localStorage.setItem('userRole', formData.role);
      showSuccess();
      navigateToDashboard(formData.role);
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
          {formData.role !== 'Donor' && (
            <>
              {formData.role === 'NGOs' && (
                <>
                  <input name="ngoName" placeholder="NGO Name" className="w-full p-3 mb-4 border rounded" onChange={handleChange} />
                  <input name="ngoRegNumber" placeholder="Registration Number" className="w-full p-3 mb-4 border rounded" onChange={handleChange} />

                  <select name="ngoType" className="w-full p-3 mb-4 border rounded" onChange={handleChange} value={formData.ngoType}>
                    <option value="">Select NGO Type</option>
                    <option value="Orphanage">Orphanage</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Food Bank">Food Bank</option>
                    <option value="Relief NGO">Relief NGO</option>
                    <option value="Community Kitchen">Community Kitchen</option>
                    <option value="Other">Other</option>
                  </select>

                  <div className="mb-4">
  <label htmlFor="dailyFoodNeed" className="text-sm font-medium block mb-1">
    Approx Daily Food Requirement <span className="text-gray-500 text-xs">(in meals)</span>
  </label>
  <input
    id="dailyFoodNeed"
    name="dailyFoodNeed"
    type="number"
    min="1"
    value={formData.dailyFoodNeed}
    onChange={handleChange}
    className="w-full p-3 border rounded"
    placeholder="e.g., 100"
  />
</div>

                  {/* Address field + auto location button */}
                  <div className="mb-4">
  <label htmlFor="ngoAddress" className="text-sm font-medium block mb-1">NGO Address/Location</label>
  <div className="flex items-center gap-2">
    <input
      name="ngoAddress"
      id="ngoAddress"
      placeholder="NGO Address/Location"
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


                  <input name="website" placeholder="NGO Website (optional)" className="w-full p-3 mb-4 border rounded" onChange={handleChange} />

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Operating Days</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <label key={day} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.ngoOperatingDays.includes(day)}
                            onChange={() => handleDayChange(day)}
                            className="mr-2"
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
  <label className="block text-sm font-medium mb-2">Operating Hours</label>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="text-xs text-gray-600 mb-1 block">Start Time</label>
      <input
        type="time"
        name="ngoStartTime"
        value={formData.ngoStartTime}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
    </div>
    <div>
      <label className="text-xs text-gray-600 mb-1 block">End Time</label>
      <input
        type="time"
        name="ngoEndTime"
        value={formData.ngoEndTime}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
    </div>
  </div>
</div>

                </>
              )}
            </>
          )}

          <button onClick={handleRegister} className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition">
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
