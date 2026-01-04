import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/matches", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("auth/register/", form);
      navigate("/login");
    } catch (err) {
      setError(t("auth.register.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/peyjabanki-bw-logo.png"
            alt={t("common.brandName")}
            className="h-14 w-auto"
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          {t("auth.register.title")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            value={form.username}
            placeholder={t("auth.register.username")}
            onChange={handleChange}
            autoComplete="username"
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            placeholder={t("auth.register.email")}
            onChange={handleChange}
            autoComplete="email"
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            placeholder={t("auth.register.password")}
            onChange={handleChange}
            autoComplete="new-password"
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none"
          />

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              submitting
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting
              ? t("auth.register.submitting")
              : t("auth.register.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
