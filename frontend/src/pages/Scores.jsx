import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useCompetition } from "../context/CompetitionContext";

export default function Scores() {
  const { t } = useTranslation();
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
    return (
      <div className="text-center mt-10 text-gray-600">
        {t("leaderboard.selectCompetition")}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        {t("leaderboard.loading")}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        🏆 {t("leaderboard.title")}
      </h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-sm">
              <th className="p-3">#</th>
              <th className="p-3">{t("leaderboard.player")}</th>
              <th className="p-3 text-center">{t("leaderboard.matchPoints")}</th>
              <th className="p-3 text-center">{t("leaderboard.bonusPoints")}</th>
              <th className="p-3 text-center font-bold">{t("leaderboard.total")}</th>
              <th className="p-3 text-center">{t("leaderboard.exact")}</th>
              <th className="p-3 text-center">{t("leaderboard.oneScore")}</th>
              <th className="p-3 text-center">{t("leaderboard.correctBonus")}</th>
              <th className="p-3 text-center">{t("leaderboard.totalGuesses")}</th>
              <th className="p-3 text-center">{t("leaderboard.winPercentage")}</th>
              <th className="p-3 text-center">{t("leaderboard.avgPoints")}</th>
            </tr>
          </thead>

          <tbody>
            {scores.map((row, i) => (
              <tr
                key={row.user}
                className={`border-b ${
                  i < 3 ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
              >
                <td className="p-3 font-bold">{i + 1}</td>
                <td className="p-3 font-medium">{row.user}</td>
                <td className="p-3 text-center">{row.match_points}</td>
                <td className="p-3 text-center text-purple-600 font-semibold">
                  {row.bonus_points}
                </td>
                <td className="p-3 text-center font-bold text-blue-700">
                  {row.points}
                </td>
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
            className={`border rounded p-3 shadow-sm ${
              i < 3 ? "bg-amber-50" : "bg-white"
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-bold">
                {i + 1}. {row.user}
              </span>
              <span className="font-semibold text-blue-700">
                {row.points}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>{t("leaderboard.matchPoints")}:</span>
                <span>{row.match_points}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.bonusPoints")}:</span>
                <span className="text-purple-600 font-semibold">
                  {row.bonus_points}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.exact")}:</span>
                <span>{row.exact}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.oneScore")}:</span>
                <span>{row.one_score}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.correctBonus")}:</span>
                <span>{row.correct_bonus}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.totalGuesses")}:</span>
                <span>{row.total_guesses}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.winPercentage")}:</span>
                <span>{row.win_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>{t("leaderboard.avgPoints")}:</span>
                <span>{row.avg_points}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
