import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginImage from '../assets/savefood.jpeg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.user) {
        localStorage.setItem('donorId', data.user._id);
        localStorage.setItem('userRole', data.user.role);

        if (data.user.role === 'Donor') navigate('/donor');
        else if (data.user.role === 'NGOs') navigate('/ngo');
        else if (data.user.role === 'Volunteer') navigate('/volunteer');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
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

        {/* Right Side Login Form */}
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

          <button className="w-full flex items-center justify-center border p-2 rounded hover:bg-gray-100">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>

          <p className="mt-4 text-sm text-center">
            New here?{' '}
            <Link to="/register" className="text-green-700 font-semibold">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;