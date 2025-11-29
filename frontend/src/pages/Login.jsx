import React, { useState } from 'react';
import api from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) {
      navigate('/matches', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('auth/login/', { username, password });
      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      navigate('/matches');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="border p-2 rounded"/>
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded"/>
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      <p className="mt-3 text-sm">Don't have an account? <Link to="/register" className="text-blue-600">Register</Link></p>
    </div>
  );
};

export default Login;
