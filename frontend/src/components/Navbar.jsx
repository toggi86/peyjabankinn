import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true }); // redirect after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/matches" className="hover:underline">
          Matches
        </Link>

        {token && (
          <Link to="/scores" className="hover:underline">
            Leaderboard
          </Link>
        )}
        <Link to="/bonus" className="hover:underline">Bonus</Link>

        {token && user?.is_staff && (
          <Link to="/adminscores" className="hover:underline">
            Admin Scores
          </Link>
        )}
        {token && user?.is_staff && (
          <Link to="/admin/bonus" className="hover:underline">Admin Bonus</Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {token ? (
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
