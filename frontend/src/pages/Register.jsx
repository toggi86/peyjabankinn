import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/matches', { replace: true });
  }, [token, navigate]);

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('auth/register/', form);
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="username" placeholder="Username" onChange={handleChange} className="border p-2 rounded"/>
        <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 rounded"/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded"/>
        <button type="submit" className="bg-green-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default Register;
