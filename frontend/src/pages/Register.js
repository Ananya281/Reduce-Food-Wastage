
// File: src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Donor'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data._id) {
         // Save _id to localStorage
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="absolute top-5 right-5 cursor-pointer text-2xl" onClick={() => navigate('/')}>✕</div>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 mb-4 border">
          <option>Donor</option>
          <option>NGOs</option>
          <option>Volunteer</option>
        </select>
        <input name="fullName" type="text" placeholder="Full Name" className="w-full p-2 mb-4 border" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" className="w-full p-2 mb-4 border" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" className="w-full p-2 mb-4 border" onChange={handleChange} />
        <button onClick={handleRegister} className="w-full bg-green-600 text-white p-2 rounded">Register</button>
        <p className="mt-4 text-sm text-center">
          Already have an account? <Link to="/login" className="text-green-700 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;