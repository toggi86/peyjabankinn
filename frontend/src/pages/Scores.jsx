import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useCompetition } from "../context/CompetitionContext";
import { useAuth } from "../context/AuthContext";

export default function Scores() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currentUser = user?.username;

  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompetition } = useCompetition();

  const myRowRef = useRef(null);

  // API key → translation key mapping
  const keyMap = {
    match_points: "matchPoints",
    bonus_points: "bonusPoints",
    exact: "exact",
    one_score: "oneScore",
    correct_bonus: "correctBonus",
  };

  // Load scores
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

  const myIndex = scores.findIndex((s) => s.user === currentUser);

  const scrollToMyCard = () => {
    myRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!selectedCompetition)
    return <div className="text-center mt-10 text-gray-600">{t("leaderboard.selectCompetition")}</div>;

  if (loading)
    return <div className="text-center mt-10 text-gray-600">{t("leaderboard.loading")}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 relative">
      <h1 className="text-2xl font-bold mb-4">🏆 {t("leaderboard.title")}</h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto max-h-[60vh] border rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th rowSpan={2} className="p-2 border-r">#</th>
              <th rowSpan={2} className="p-2 border-r min-w-[100px]">{t("leaderboard.player")}</th>
              <th rowSpan={2} className="p-2 border-r text-center">{t("leaderboard.total")}</th>
              <th colSpan={2} className="p-2 border-r text-center">{t("leaderboard.points")}</th>
              <th colSpan={3} className="p-2 border-r text-center">{t("leaderboard.stats")}</th>
            </tr>
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
                className={`border-b ${
                  row.user === currentUser
                    ? "bg-blue-100 ring-2 ring-blue-400 font-semibold"
                    : i < 3
                    ? "bg-amber-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="p-2 border-r font-bold">{i + 1}</td>
                <td className="p-2 border-r font-medium">{row.user}</td>
                <td className="p-2 border-r text-center font-bold text-blue-700">{row.points}</td>
                <td className="p-2 border-r text-center">{row.match_points}</td>
                <td className="p-2 border-r text-center text-purple-600 font-semibold">{row.bonus_points}</td>
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
            ref={row.user === currentUser ? myRowRef : null}
            className={`border rounded-lg p-3 shadow-sm ${
              row.user === currentUser
                ? "bg-blue-100 ring-2 ring-blue-400"
                : i < 3
                ? "bg-amber-50"
                : "bg-white"
            }`}
          >
            {/* Player & Total */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm">{i + 1}. {row.user}</span>
              <span className="font-bold text-blue-700 text-sm">{row.points} {t("leaderboard.pointsAbbr")}</span>
            </div>

            {/* Points */}
            <div className="mb-3">
              <div className="font-semibold text-gray-600 text-xs mb-1">{t("leaderboard.points")}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["match_points", "bonus_points"].map((key) => (
                  <div
                    key={key}
                    className={`flex justify-between p-2 rounded ${row.user === currentUser ? "bg-blue-50" : "bg-gray-50"}`}
                  >
                    <span>{t(`leaderboard.${keyMap[key]}`)}</span>
                    <span className={key === "bonus_points" ? "text-purple-600 font-semibold" : ""}>
                      {row[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div>
              <div className="font-semibold text-gray-600 text-xs mb-1">{t("leaderboard.stats")}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {["exact", "one_score", "correct_bonus"].map((key) => (
                  <div
                    key={key}
                    className={`flex justify-between p-2 rounded ${row.user === currentUser ? "bg-blue-50" : "bg-gray-50"}`}
                  >
                    <span>{t(`leaderboard.${keyMap[key]}`)}</span>
                    <span>{row[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed "Your Position" Card (mobile only, clickable whole card) */}
      {currentUser && myIndex !== -1 && (
        <div
          onClick={scrollToMyCard}
          className="fixed bottom-2 right-2 bg-blue-600 bg-opacity-80 text-white px-3 py-1 rounded-full shadow-lg flex items-center space-x-2 z-50 text-xs md:hidden backdrop-blur-sm cursor-pointer hover:bg-opacity-100 transition"
          style={{ maxWidth: "220px" }}
        >
          <span className="truncate">{t("leaderboard.yourPosition")} #{myIndex + 1} {currentUser}</span>
          <span className="font-semibold">{scores[myIndex].points} {t("leaderboard.pointsAbbr")}</span>
        </div>
      )}
    </div>
  );
}
