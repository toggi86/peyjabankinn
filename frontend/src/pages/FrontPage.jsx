import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Frontpage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center pt-16 px-4">

      {/* Logo */}
      <img
        src="/peyjabanki-bw-logo.png"
        alt="Logo"
        className="h-20 mb-6 drop-shadow-md"
      />

      {/* Welcome message */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome{user ? `, ${user.username}` : ""}!
      </h1>

      <p className="text-gray-600 text-center max-w-md mb-10">
        Ready to make your predictions? Choose a section below to get started.
      </p>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">

        {/* MATCHES */}
        <Link
          to="/matches"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Matches</h2>
          <p className="text-gray-600">View matches and submit your predictions.</p>
        </Link>

        {/* LEADERBOARD */}
        <Link
          to="/scores"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
          <p className="text-gray-600">See how you rank against other players.</p>
        </Link>

        {/* BONUS QUESTIONS */}
        <Link
          to="/bonus"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Bonus Questions</h2>
          <p className="text-gray-600">Answer special questions for extra points.</p>
        </Link>

      </div>
    </div>
  );
}
