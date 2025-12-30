// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, staffOnly = false }) => {
  const { token, user, loading } = useAuth();

  if (loading || (token && !user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  if (staffOnly && !user?.is_staff) return <Navigate to="/matches" replace />;

  return children;
};

export default ProtectedRoute;
