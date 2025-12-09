import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCompetition } from "../context/CompetitionContext";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { competitions = [], selectedCompetition, setSelectedCompetition } = useCompetition();

  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef();

  // ❌ DO NOT return early — breaks hooks
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate("/login"), 0);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentCompetitionName =
    competitions.find((c) => c.id === selectedCompetition)?.name || "Select Competition";

  // ✔️ Safe: all hooks have already executed
  if (hideNavbar) {
    return <div />; // lightweight placeholder
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* LEFT SIDE: Logo + Nav Links */}
      <div className="flex items-center space-x-6">

        {/* Logo → FRONT PAGE */}
        <Link to="/" className="flex items-center">
          <img
            src="/peyjabanki-bw-logo.png"
            alt="Logo"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>

        {/* Matches tab */}
        <Link to="/matches" className="hover:underline">Matches</Link>

        {token && <Link to="/scores" className="hover:underline">Leaderboard</Link>}
        <Link to="/bonus" className="hover:underline">Bonus</Link>

        {token && user?.is_staff && (
          <>
            <Link to="/adminscores" className="hover:underline">Admin Scores</Link>
            <Link to="/admin/bonus" className="hover:underline">Admin Bonus</Link>
          </>
        )}
      </div>

      {/* RIGHT SIDE: Competition Selector + Auth */}
      <div className="flex items-center space-x-4">

        {token && competitions.length > 0 && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-gray-700 text-white px-3 py-1 rounded"
            >
              {currentCompetitionName}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white text-black border rounded shadow-lg z-50">
                {competitions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCompetition(c.id);
                      setDropdownOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                      c.id === selectedCompetition ? "font-semibold" : ""
                    }`}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {token ? (
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
