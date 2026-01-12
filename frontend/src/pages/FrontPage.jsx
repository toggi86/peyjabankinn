import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";

export default function Frontpage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center pt-16 px-4">
      {/* Logo */}
      <img
        src="/peyjabanki-bw-logo.png"
        alt={t("common.brandName")}
        className="h-28 mb-6 drop-shadow-md"
      />

      {/* Welcome */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        {user
          ? t("frontpage.welcomeUser", { username: user.username })
          : t("frontpage.welcome")}
      </h1>

      {/* Intro / payment info */}
      <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-xl p-5 mb-10 text-sm text-gray-700">
        <p className="font-semibold mb-1">
          {t("frontpage.info.title")}
        </p>
        <p className="mb-3">
          {t("frontpage.info.description")}
        </p>

        <p className="font-semibold mb-1">
          {t("frontpage.info.paymentTitle")}
        </p>
        <p>
          {t("frontpage.info.paymentDescription")}
        </p>
        {/* Bank details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-gray-800">
          <div>
            <strong>{t("frontpage.info.amount")}:</strong> 3.000 ISK
          </div>
          <div>
            <strong>{t("frontpage.info.ssn")}:</strong> 120777-4759
          </div>
          <div>
            <strong>{t("frontpage.info.account")}:</strong> 0582-26-000763
          </div>
          {user && (
            <div>
              <strong>{t("frontpage.info.reference")}:</strong>{" "}
              <span className="font-mono">{user.username}</span>
            </div>
          )}
        </div>
      </div>
      {/* Rules / scoring */}
      <div className="w-full max-w-2xl bg-white border rounded-xl p-5 mb-10 text-sm text-gray-700 shadow-sm">
        <p className="font-semibold mb-3">
          {t("frontpage.rules.title")}
        </p>

        <ul className="space-y-1">
          <li>• {t("frontpage.rules.bonus")}</li>
          <li>• {t("frontpage.rules.exact")}</li>
          <li>• {t("frontpage.rules.resultPlusOne")}</li>
          <li>• {t("frontpage.rules.result")}</li>
        </ul>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          to="/matches"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border text-center"
        >
          <h2 className="text-xl font-semibold mb-2">
            {t("frontpage.cards.matches.title")}
          </h2>
          <p className="text-gray-600">
            {t("frontpage.cards.matches.description")}
          </p>
        </Link>

        <Link
          to="/scores"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border text-center"
        >
          <h2 className="text-xl font-semibold mb-2">
            {t("frontpage.cards.leaderboard.title")}
          </h2>
          <p className="text-gray-600">
            {t("frontpage.cards.leaderboard.description")}
          </p>
        </Link>

        <Link
          to="/bonus"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border text-center"
        >
          <h2 className="text-xl font-semibold mb-2">
            {t("frontpage.cards.bonus.title")}
          </h2>
          <p className="text-gray-600">
            {t("frontpage.cards.bonus.description")}
          </p>
        </Link>
      </div>
    </div>
  );
}
