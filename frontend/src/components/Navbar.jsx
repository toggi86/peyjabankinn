import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Navbar() {
  const token = localStorage.getItem('accessToken');
  const [user, setUser] = useState(null);

  // Fetch current user if logged in
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await api.get('auth/me/');
        setUser(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/matches" className="hover:underline">Matches</Link>

        {token && (
          <>
            <Link to="/scores" className="hover:underline">Leaderboard</Link>

            {/* Only show Adminscores if user is staff or superuser */}
            {user && (user.is_staff || user.is_superuser) && (
              <Link to="/adminscores" className="hover:underline">Adminscores</Link>
            )}

            <button
              onClick={handleLogout}
              className="hover:underline"
            >
              Logout
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
