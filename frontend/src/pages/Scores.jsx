import { useEffect, useState } from "react";
import api from "../api/client";

export default function Scores() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    api.get("scores/").then(res => setScores(res.data));
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-xl font-bold mb-4">🏆 Leaderboard</h1>

      <table className="w-full border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr className="text-left">
            <th className="p-3">#</th>
            <th className="p-3">Player</th>
            <th className="p-3 text-center">Points</th>
            <th className="p-3 text-center">Exact</th>
            <th className="p-3 text-center">1 Score</th>
            <th className="p-3 text-center">Total</th>
            <th className="p-3 text-center">Win%</th>
            <th className="p-3 text-center">Accuracy%</th>
            <th className="p-3 text-center">Avg pts</th>
          </tr>
        </thead>

        <tbody>
          {scores.map((row, i) => (
            <tr key={row.user} className={`border-b ${i < 3 ? "bg-amber-50" : "hover:bg-gray-50"}`}>
              <td className="p-3 font-bold">{i + 1}</td>
              <td className="p-3 font-medium">{row.user}</td>
              <td className="p-3 text-center font-bold text-blue-600">{row.points}</td>
              <td className="p-3 text-center">{row.exact}</td>
              <td className="p-3 text-center">{row.one_score}</td>
              <td className="p-3 text-center">{row.total_guesses}</td>
              <td className="p-3 text-center">{row.win_percentage}</td>
              <td className="p-3 text-center">{row.accuracy}</td>
              <td className="p-3 text-center">{row.avg_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
