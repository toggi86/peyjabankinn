import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { token, login, loading } = useAuth();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token && !loading) {
      navigate("/", { replace: true });
    }
  }, [token, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("auth/login/", {
        username,
        password,
      });
      login(res.data.access, res.data.refresh);
    } catch (err) {
      setError(t("auth.login.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

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
          {t("auth.login.title")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t("auth.login.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
          />

          <input
            type="password"
            placeholder={t("auth.login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
          />
          <div className="text-right text-sm mt-1">
            <Link
              to="/reset-password"
              className="text-blue-600 hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>

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
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting
              ? t("auth.login.loggingIn")
              : t("auth.login.submit")}
          </button>
        </form>

        <p className="text-sm text-center mt-5">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            {t("auth.login.register")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
