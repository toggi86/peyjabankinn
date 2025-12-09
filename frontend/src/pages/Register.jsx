import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (token) navigate("/matches", { replace: true });
  }, [token, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("auth/register/", form);
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 bg-white p-6 rounded-xl shadow-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src="/peyjabanki-bw-logo.png" alt="Peyjabanki" className="h-16 w-auto" />
      </div>

      <h1 className="text-2xl font-bold text-center mb-4">Register</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="border p-2 rounded focus:ring focus:ring-blue-300 outline-none"
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 rounded focus:ring focus:ring-blue-300 outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 rounded focus:ring focus:ring-blue-300 outline-none"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
