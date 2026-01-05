import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/client";

export default function ResetPassword() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("auth/password-reset/", { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.detail || t("auth.resetPassword.error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/peyjabanki-bw-logo.png"
            alt={t("common.brandName")}
            className="h-14 w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">
          {t("auth.resetPassword.title")}
        </h1>

        {success ? (
          <div className="text-green-700 bg-green-50 p-4 rounded mb-4 text-center">
            {t("auth.resetPassword.success")}
            <br />
            <span className="text-sm text-gray-600">{t("auth.resetPassword.checkEmail")}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-700 bg-red-50 p-3 rounded text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-1 font-medium">
                {t("auth.resetPassword.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.resetPassword.emailPlaceholder")}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? t("auth.resetPassword.sending")
                : t("auth.resetPassword.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
