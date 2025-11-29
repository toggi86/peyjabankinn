import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <Link to="/matches" className="font-bold">Peyjabankinn</Link>
      <button className="bg-red-500 px-3 py-1 rounded" onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
