import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import BonusQuestions from "./pages/BonusQuestions.jsx";
import AdminBonus from "./pages/AdminBonus.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Matches from "./pages/Matches.jsx";
import Scores from "./pages/Scores.jsx";
import AdminScores from "./pages/AdminScores.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* Always visible */}

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Public matches page */}
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

        {/* Admin scores: staff only */}
        <Route
          path="/adminscores"
          element={
            <ProtectedRoute staffOnly={true}>
              <AdminScores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bonus"
          element={
            <ProtectedRoute>
              <BonusQuestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bonus"
          element={
            <ProtectedRoute staffOnly={true}>
              <AdminBonus />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirects to matches */}
        <Route path="*" element={<Matches />} />
      </Routes>
    </div>
  );
}

export default App;
