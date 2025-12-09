import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { token, login, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token && !loading) {
      navigate("/", { replace: true });
    }
  }, [token, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("auth/login/", { username, password });
      login(res.data.access, res.data.refresh);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-xl shadow-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src="/peyjabanki-bw-logo.png" alt="Peyjabanki" className="h-16 w-auto" />
      </div>

      <h1 className="text-3xl font-bold text-center mb-5">Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded focus:ring focus:ring-blue-300 outline-none"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded focus:ring focus:ring-blue-300 outline-none"
        />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className={`py-2 rounded text-white transition font-semibold ${
            submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Don't have an account?
        <Link className="text-blue-600 font-semibold ml-1" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
