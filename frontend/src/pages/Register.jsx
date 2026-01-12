import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await api.post("auth/register/", form);
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        setErrors(data); // DRF field errors
      } else {
        setErrors({ general: t("auth.register.error") });
      }
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
            className="h-14"
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          {t("auth.register.title")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <input
              name="username"
              value={form.username}
              placeholder={t("auth.register.username")}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none"
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">
                {errors.username[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              name="email"
              type="email"
              value={form.email}
              placeholder={t("auth.register.email")}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              name="password"
              type="password"
              value={form.password}
              placeholder={t("auth.register.password")}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none"
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password[0]}
              </p>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <div className="text-sm text-red-600 text-center">
              {errors.general}
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
}
