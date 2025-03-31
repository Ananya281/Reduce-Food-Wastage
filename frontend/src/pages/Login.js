// File: frontend/src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from '../assets/savefood.jpeg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const showSuccess = () => toast.success('🎉 Welcome to your Dashboard!');
  const showError = (msg) => toast.error(`❌ ${msg}`);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userRole', data.user.role);

        showSuccess();
        navigateToDashboard(data.user.role);
      } else {
        showError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      showError('Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userRole', data.user.role);

        showSuccess();
        navigateToDashboard(data.user.role);
      } else {
        showError(data.error || 'Google login failed');
      }
    } catch (err) {
      console.error(err);
      showError('Error during Google login');
    }
  };

  const navigateToDashboard = (role) => {
    if (role === 'Donor') navigate('/donor');
    else if (role === 'NGOs') navigate('/ngo');
    else if (role === 'Volunteer') navigate('/volunteer');
  };

  const handleGoogleError = () => {
    showError('Google Sign In failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 via-white to-green-50">
      <div className="absolute top-5 right-5 cursor-pointer text-2xl" onClick={() => navigate('/')}>✕</div>

      <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden w-full max-w-4xl bg-white mx-4 sm:mx-auto">
        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center items-center bg-green-100 p-8 w-full md:w-1/2">
          <img src={loginImage} alt="Illustration" className="w-64 mb-6" />
          <p className="text-center text-gray-700 font-medium">“Don’t waste food, feed a soul.”</p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Welcome Back</h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition"
          >
            Sign In
          </button>

          <div className="my-4 text-center text-gray-500">or</div>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>

          <p className="mt-4 text-sm text-center">
            New here? <Link to="/register" className="text-green-700 font-semibold">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;