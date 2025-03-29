import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import loginImage from '../assets/savefood.jpeg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Donor',
  });

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
        localStorage.setItem('donorId', data._id);
        localStorage.setItem('userRole', formData.role);

        if (formData.role === 'Donor') navigate('/donor');
        else if (formData.role === 'NGOs') navigate('/ngo');
        else if (formData.role === 'Volunteer') navigate('/volunteer');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error during registration');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Sign Up Success:', credentialResponse);
    // Optional: Send credentialResponse.credential to backend to register user
  };

  const handleGoogleError = () => {
    console.error('Google Sign Up Failed');
    alert('Google Sign Up failed');
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

        {/* Right Side Register Form */}
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

          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            className="w-full p-3 mb-4 border rounded"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded"
            onChange={handleChange}
            required
          />

          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition"
          >
            Register
          </button>

          <div className="my-4 text-center text-gray-500">or</div>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="100%" // optional: auto size
            />
          </div>

          <p className="mt-4 text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
