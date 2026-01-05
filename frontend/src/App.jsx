import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import FrontPage from "./pages/FrontPage.jsx";
import BonusQuestions from "./pages/BonusQuestions.jsx";
import AdminBonus from "./pages/AdminBonus.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Matches from "./pages/Matches.jsx";
import Scores from "./pages/Scores.jsx";
import AdminScores from "./pages/AdminScores.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm.jsx"

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* Always visible */}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
        {/* Front page: logged-in users only */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FrontPage />
            </ProtectedRoute>
          }
        />

        {/* Matches page: public */}
        <Route path="/matches" element={<Matches />} />

        {/* Leaderboard: logged-in users only */}
        <Route
          path="/scores"
          element={
            <ProtectedRoute>
              <Scores />
            </ProtectedRoute>
          }
        />

        {/* Admin-only scores */}
        <Route
          path="/adminscores"
          element={
            <ProtectedRoute staffOnly={true}>
              <AdminScores />
            </ProtectedRoute>
          }
        />

        {/* Bonus Questions */}
        <Route
          path="/bonus"
          element={
            <ProtectedRoute>
              <BonusQuestions />
            </ProtectedRoute>
          }
        />

        {/* Admin bonus questions */}
        <Route
          path="/admin/bonus"
          element={
            <ProtectedRoute staffOnly={true}>
              <AdminBonus />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect to front page */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <FrontPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
