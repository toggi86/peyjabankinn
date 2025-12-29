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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(); // separate ref for desktop dropdown

  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate("/login"), 0);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentCompetitionName =
    competitions.find((c) => c.id === selectedCompetition)?.name || "Select Competition";

  if (hideNavbar) return <div />;

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center relative">
      {/* LEFT SIDE: Logo + Desktop Links */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center">
          <img
            src="/peyjabanki-bw-logo.png"
            alt="Logo"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-4 items-center">
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
      </div>

      {/* RIGHT SIDE: Desktop Competition + Auth + Mobile Hamburger */}
      <div className="flex items-center space-x-4">
        {/* Desktop Competition + Auth */}
        <div className="hidden md:flex items-center space-x-4" ref={dropdownRef}>
          {token && competitions.length > 0 && (
            <div className="relative">
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden bg-gray-700 px-3 py-1 rounded"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-800 text-white p-4 space-y-3 md:hidden z-40">
          <Link to="/matches" onClick={() => setMobileMenuOpen(false)} className="block">Matches</Link>
          {token && <Link to="/scores" onClick={() => setMobileMenuOpen(false)} className="block">Leaderboard</Link>}
          <Link to="/bonus" onClick={() => setMobileMenuOpen(false)} className="block">Bonus</Link>
          {token && user?.is_staff && (
            <>
              <Link to="/adminscores" onClick={() => setMobileMenuOpen(false)} className="block">Admin Scores</Link>
              <Link to="/admin/bonus" onClick={() => setMobileMenuOpen(false)} className="block">Admin Bonus</Link>
            </>
          )}

          {token && competitions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-gray-700 text-white px-3 py-1 rounded w-full text-left"
              >
                {currentCompetitionName}
              </button>

              {dropdownOpen && (
                <div className="mt-1 w-full bg-white text-black border rounded shadow-lg z-50">
                  {competitions.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCompetition(c.id);
                        setDropdownOpen(false);
                        setMobileMenuOpen(false);
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
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="block w-full text-left hover:underline"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
