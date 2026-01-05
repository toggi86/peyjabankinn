import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";

export default function ResetPasswordConfirm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError(t("auth.resetPasswordConfirm.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      await api.post("auth/password-reset-confirm/", {
        uid,
        token,
        new_password: password
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.detail || t("auth.resetPasswordConfirm.error")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white text-center">
        <p className="text-red-700">{t("auth.resetPasswordConfirm.invalidLink")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold mb-4">{t("auth.resetPasswordConfirm.title")}</h1>

      {success ? (
        <div className="text-green-700 bg-green-50 p-3 rounded mb-4">
          {t("auth.resetPasswordConfirm.success")}
          <br />
          {t("auth.resetPasswordConfirm.redirecting")}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-700 bg-red-50 p-3 rounded">{error}</div>
          )}

          <div>
            <label className="block mb-1 font-medium">
              {t("auth.resetPasswordConfirm.newPassword")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.resetPasswordConfirm.newPasswordPlaceholder")}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              {t("auth.resetPasswordConfirm.confirmPassword")}
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder={t("auth.resetPasswordConfirm.confirmPasswordPlaceholder")}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? t("auth.resetPasswordConfirm.saving") : t("auth.resetPasswordConfirm.submit")}
          </button>
        </form>
      )}
    </div>
  );
}
