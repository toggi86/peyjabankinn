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
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 border-b">
            {/* First row: groups */}
            <tr>
              <th className="p-2 border-r" rowSpan={2}>#</th>
              <th className="p-2 border-r min-w-[100px]" rowSpan={2}>{t("leaderboard.player")}</th>

              <th className="p-2 border-r text-center" rowSpan={2}>{t("leaderboard.total")}</th>

              <th className="p-2 border-r text-center" colSpan={2}>{t("leaderboard.points")}</th>
              <th className="p-2 border-r text-center" colSpan={3}>{t("leaderboard.stats")}</th>
            </tr>

            {/* Second row: individual columns */}
            <tr className="bg-gray-50">
              <th className="p-2 border-r text-center">{t("leaderboard.matchPoints")}</th>
              <th className="p-2 border-r text-center">{t("leaderboard.bonusPoints")}</th>
              <th className="p-2 border-r text-center">{t("leaderboard.exact")}</th>
              <th className="p-2 border-r text-center">{t("leaderboard.oneScore")}</th>
              <th className="p-2 text-center">{t("leaderboard.correctBonus")}</th>
            </tr>
          </thead>

          <tbody>
            {scores.map((row, i) => (
              <tr
                key={row.user}
                className={`border-b ${i < 3 ? "bg-amber-50" : "hover:bg-gray-50"}`}
              >
                <td className="p-2 border-r font-bold">{i + 1}</td>
                <td className="p-2 border-r font-medium">{row.user}</td>
                <td className="p-2 border-r text-center font-bold text-blue-700">{row.points}</td>

                {/* Points */}
                <td className="p-2 border-r text-center">{row.match_points}</td>
                <td className="p-2 border-r text-center text-purple-600 font-semibold">{row.bonus_points}</td>

                {/* Stats */}
                <td className="p-2 border-r text-center">{row.exact}</td>
                <td className="p-2 border-r text-center">{row.one_score}</td>
                <td className="p-2 text-center">{row.correct_bonus}</td>
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
            {/* Player and Total */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">{i + 1}. {row.user}</span>
              <span className="font-bold text-blue-700">{row.points}</span>
            </div>

            {/* Points Section */}
            <div className="mb-2">
              <div className="font-semibold text-gray-600 text-xs mb-1">{t("leaderboard.points")}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("leaderboard.matchPoints")}</span>
                  <span>{row.match_points}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("leaderboard.bonusPoints")}</span>
                  <span className="text-purple-600 font-semibold">{row.bonus_points}</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div>
              <div className="font-semibold text-gray-600 text-xs mb-1">{t("leaderboard.stats")}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("leaderboard.exact")}</span>
                  <span>{row.exact}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("leaderboard.oneScore")}</span>
                  <span>{row.one_score}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("leaderboard.correctBonus")}</span>
                  <span>{row.correct_bonus}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
