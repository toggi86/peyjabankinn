import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCompetition } from "../context/CompetitionContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();

  const { token, user, logout } = useAuth();
  const { competitions = [], selectedCompetition, setSelectedCompetition } = useCompetition();

  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate("/login"), 0);
  };

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
    competitions.find((c) => c.id === selectedCompetition)?.name || t("select_competition");

  if (hideNavbar) return <div />;

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center relative">
      {/* LEFT SIDE */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center">
          <img src="/peyjabanki-bw-logo.png" alt={t("common.brandName")} className="h-10 w-auto cursor-pointer" />
        </Link>

        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/matches" className="hover:underline">{t("matches.title")}</Link>
          {token && <Link to="/scores" className="hover:underline">{t("leaderboard.title")}</Link>}
          <Link to="/bonus" className="hover:underline">{t("bonus.title")}</Link>
          {token && user?.is_staff && (
            <>
              <Link to="/adminscores" className="hover:underline">{t("admin_scores")}</Link>
              <Link to="/admin/bonus" className="hover:underline">{t("admin_bonus")}</Link>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-4" ref={dropdownRef}>
          <LanguageSwitcher />
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
            <button onClick={handleLogout} className="hover:underline">{t("logout")}</button>
          ) : (
            <>
              <Link to="/login" className="hover:underline">{t("auth.login.title")}</Link>
              <Link to="/register" className="hover:underline">{t("auth.register.title")}</Link>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
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
          <Link to="/matches" onClick={() => setMobileMenuOpen(false)} className="block">{t("matches.title")}</Link>
          {token && <Link to="/scores" onClick={() => setMobileMenuOpen(false)} className="block">{t("leaderboard.title")}</Link>}
          <Link to="/bonus" onClick={() => setMobileMenuOpen(false)} className="block">{t("bonus.title")}</Link>
          {token && user?.is_staff && (
            <>
              <Link to="/adminscores" onClick={() => setMobileMenuOpen(false)} className="block">{t("admin_scores")}</Link>
              <Link to="/admin/bonus" onClick={() => setMobileMenuOpen(false)} className="block">{t("admin_bonus")}</Link>
            </>
          )}
          <LanguageSwitcher />
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
              {t("logout")}
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">{t("auth.login.title")}</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">{t("auth.register.title")}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
