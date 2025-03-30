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
  });

  const [googleCredential, setGoogleCredential] = useState(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [googleSelectedRole, setGoogleSelectedRole] = useState('Donor');

  const showSuccess = () => toast.success('🎉 Welcome to your Dashboard!');
  const showError = (msg) => toast.error(`❌ ${msg}`);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data._id) {
        localStorage.setItem('userId', data._id);
        localStorage.setItem('userRole', formData.role);

        showSuccess();
        if (formData.role === 'Donor') navigate('/donor');
        else if (formData.role === 'NGOs') navigate('/ngo');
        else if (formData.role === 'Volunteer') navigate('/volunteer');
      } else {
        showError('Registration failed');
      }
    } catch (error) {
      console.error(error);
      showError('Error during registration');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleCredential(credentialResponse.credential);
    setShowRoleSelect(true);
  };

  const handleGoogleError = () => {
    showError('Google Sign Up failed');
  };

  const handleGoogleRoleSubmit = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: googleCredential,
          role: googleSelectedRole
        })
      });

      const data = await res.json();

      if (data.user) {
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userRole', googleSelectedRole);

        showSuccess();
        if (googleSelectedRole === 'Donor') navigate('/donor');
        else if (googleSelectedRole === 'NGOs') navigate('/ngo');
        else if (googleSelectedRole === 'Volunteer') navigate('/volunteer');
      } else {
        showError('Google Sign-Up failed');
      }
    } catch (err) {
      console.error(err);
      showError('Error during Google Sign-Up');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 via-white to-green-50">
      <div className="absolute top-5 right-5 cursor-pointer text-2xl" onClick={() => navigate('/')}>✕</div>

      <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden w-full max-w-4xl bg-white mx-4 sm:mx-auto">
        {/* Left Side Image */}
        <div className="hidden md:flex flex-col justify-center items-center bg-green-100 p-8 w-full md:w-1/2">
          <img src={loginImage} alt="Illustration" className="w-64 mb-6" />
          <p className="text-center text-gray-700 font-medium">“Don’t waste food, feed a soul.”</p>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Create Account</h2>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 mb-4 border rounded"
            required
          >
            <option value="Donor">Donor</option>
            <option value="NGOs">NGOs</option>
            <option value="Volunteer">Volunteer</option>
          </select>

          <input name="fullName" type="text" placeholder="Full Name" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />

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

      {/* Role selection for Google Sign Up */}
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
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
