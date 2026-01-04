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

      {/* Welcome message */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {user
          ? t("frontpage.welcomeUser", { username: user.username })
          : t("frontpage.welcome")}
      </h1>

      <p className="text-gray-600 text-center max-w-md mb-10">
        {t("frontpage.subtitle")}
      </p>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* MATCHES */}
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

        {/* LEADERBOARD */}
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

        {/* BONUS QUESTIONS */}
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
