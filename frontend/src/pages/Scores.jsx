import { useEffect, useState } from "react";
import api from "../api/client";
import { useCompetition } from "../context/CompetitionContext";

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompetition } = useCompetition();

  const loadScores = async () => {
    if (!selectedCompetition) return;

    setLoading(true);
    try {
      const res = await api.get(`scores/?competition=${selectedCompetition}`);
      setScores(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setScores([]);
    loadScores();
  }, [selectedCompetition]);

  if (!selectedCompetition) {
    return <div className="text-center mt-10">Select a competition</div>;
  }

  if (loading) {
    return <div className="text-center mt-10">Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-sm">
              <th className="p-3">#</th>
              <th className="p-3">Player</th>
              <th className="p-3 text-center">Match Pts</th>
              <th className="p-3 text-center">Bonus Pts</th>
              <th className="p-3 text-center font-bold">Total</th>
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
                <td className="p-3 text-center">{row.match_points}</td>
                <td className="p-3 text-center text-purple-600 font-semibold">{row.bonus_points}</td>
                <td className="p-3 text-center font-bold text-blue-700">{row.points}</td>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {scores.map((row, i) => (
          <div
            key={row.user}
            className={`border rounded p-3 bg-white shadow-sm ${
              i < 3 ? "bg-amber-50" : ""
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-bold">{i + 1}. {row.user}</span>
              <span className="font-semibold text-blue-700">{row.points}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between"><span>Match Pts:</span><span>{row.match_points}</span></div>
              <div className="flex justify-between"><span>Bonus Pts:</span><span className="text-purple-600 font-semibold">{row.bonus_points}</span></div>
              <div className="flex justify-between"><span>Exact:</span><span>{row.exact}</span></div>
              <div className="flex justify-between"><span>1 Score:</span><span>{row.one_score}</span></div>
              <div className="flex justify-between"><span>Correct Bonus:</span><span>{row.correct_bonus}</span></div>
              <div className="flex justify-between"><span>Total Guesses:</span><span>{row.total_guesses}</span></div>
              <div className="flex justify-between"><span>Win %:</span><span>{row.win_percentage}%</span></div>
              <div className="flex justify-between"><span>Avg Pts:</span><span>{row.avg_points}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
