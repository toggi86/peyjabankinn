import { useEffect, useState } from "react";
import api from "../api/client";

export default function Scores() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    api.get("scores/").then(res => setScores(res.data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>

      <table className="w-full border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr className="text-left">
            <th className="p-3">#</th>
            <th className="p-3">Player</th>

            {/* Points breakdown */}
            <th className="p-3 text-center">Match Pts</th>
            <th className="p-3 text-center">Bonus Pts</th>
            <th className="p-3 text-center font-bold">Total</th>

            {/* Original columns */}
            <th className="p-3 text-center">Exact</th>
            <th className="p-3 text-center">1 Score</th>
            <th className="p-3 text-center">Correct Bonus</th>
            <th className="p-3 text-center">Total Guesses</th>
            <th className="p-3 text-center">Win %</th>
            <th className="p-3 text-center">Avg Pts</th>
          </tr>
        </thead>

        <tbody>
          {scores.map((row, i) => (
            <tr
              key={row.user}
              className={`border-b ${i < 3 ? "bg-amber-50" : "hover:bg-gray-50"}`}
            >
              <td className="p-3 font-bold">{i + 1}</td>
              <td className="p-3 font-medium">{row.user}</td>

              {/* Points breakdown */}
              <td className="p-3 text-center">{row.match_points}</td>
              <td className="p-3 text-center text-purple-600 font-semibold">{row.bonus_points}</td>
              <td className="p-3 text-center font-bold text-blue-700">{row.points}</td>

              {/* Other stats */}
              <td className="p-3 text-center">{row.exact}</td>
              <td className="p-3 text-center">{row.one_score}</td>
              <td className="p-3 text-center">{row.correct_bonus}</td>
              <td className="p-3 text-center">{row.total_guesses}</td>
              <td className="p-3 text-center">{row.win_percentage}%</td>
              <td className="p-3 text-center">{row.avg_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
