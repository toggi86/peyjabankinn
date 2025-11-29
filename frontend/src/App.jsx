import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import Navbar from './components/Navbar';

const App = () => {
  const token = localStorage.getItem('accessToken');

  return (
    <div className="min-h-screen bg-gray-100">
      {token && <Navbar />}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/matches"
            element={token ? <Matches /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={token ? "/matches" : "/login"} replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
