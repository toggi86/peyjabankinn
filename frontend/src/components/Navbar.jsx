import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('accessToken');

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/matches" className="hover:underline">Matches</Link>

        {token && (
          <>
            <Link to="/scores" className="hover:underline">Leaderboard</Link>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              }}
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
