import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import debounce from "lodash.debounce";
import { useCompetition } from "../context/CompetitionContext";
import { useTranslation } from "react-i18next";
import { parseISO, format, compareAsc } from "date-fns";

export default function Matches() {
  const { t } = useTranslation();
  const { selectedCompetition } = useCompetition();

  const [matches, setMatches] = useState([]);
  const [saving, setSaving] = useState({});
  const [errors, setErrors] = useState({});
  const debouncedRefs = useRef({});
  const guessesByMatchId = useRef({});

  const fetchMatchesAndGuesses = async (competitionId) => {
    try {
      const [matchesRes, guessesRes] = await Promise.all([
        api.get(`matches/?competition=${competitionId}`),
        api.get(`guesses/?competition=${competitionId}`),
      ]);

      guessesByMatchId.current = {};
      guessesRes.data.forEach((guess) => {
        const matchId =
          typeof guess.match === "object" ? guess.match.id : guess.match;
        guessesByMatchId.current[matchId] = guess;
      });

      const merged = matchesRes.data.map((match) => {
        const guess = guessesByMatchId.current[match.id];
        return {
          ...match,
          user_guess: guess || null,
          guess_home: guess?.guess_home ?? "",
          guess_away: guess?.guess_away ?? "",
        };
      });

      // Sort by date ascending
      merged.sort((a, b) =>
        compareAsc(parseISO(a.match_date), parseISO(b.match_date))
      );

      setMatches(merged);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!selectedCompetition) return;
    fetchMatchesAndGuesses(selectedCompetition);

    const interval = setInterval(async () => {
      try {
        const res = await api.get(
          `matches/?competition=${selectedCompetition}`
        );
        setMatches((prev) =>
          prev
            .map((match) => {
              const updated = res.data.find((m) => m.id === match.id);
              if (!updated) return match;
              return {
                ...match,
                home_score: updated.home_score,
                away_score: updated.away_score,
              };
            })
            .sort((a, b) =>
              compareAsc(parseISO(a.match_date), parseISO(b.match_date))
            )
        );
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedCompetition]);

  useEffect(() => {
    const timers = Object.entries(errors).map(([matchId]) => {
      return setTimeout(() => {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[matchId];
          return copy;
        });
      }, 4000);
    });

    return () => timers.forEach(clearTimeout);
  }, [errors]);

  const handleInputChange = (matchId, field, value) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    );

    const match = matches.find((m) => m.id === matchId);
    const updatedMatch = { ...match, [field]: value };

    if (!debouncedRefs.current[matchId]) {
      debouncedRefs.current[matchId] = debounce(saveGuess, 500);
    }

    debouncedRefs.current[matchId](updatedMatch);
  };

  const saveGuess = async (match) => {
    if (!match) return;
    const matchId = match.id;

    const guessHome =
      match.guess_home !== "" ? Number(match.guess_home) : null;
    const guessAway =
      match.guess_away !== "" ? Number(match.guess_away) : null;

    if (
      !guessesByMatchId.current[matchId] &&
      (guessHome === null || guessAway === null)
    )
      return;

    const payload = { guess_home: guessHome, guess_away: guessAway };
    setSaving((prev) => ({ ...prev, [matchId]: true }));

    try {
      const existingGuess = guessesByMatchId.current[matchId];
      let res;

      if (existingGuess?.id) {
        res = await api.patch(`guesses/${existingGuess.id}/`, payload);
      } else {
        res = await api.post("guesses/", { match: matchId, ...payload });
      }

      guessesByMatchId.current[matchId] = res.data;

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                user_guess: res.data,
                guess_home: res.data.guess_home,
                guess_away: res.data.guess_away,
              }
            : m
        )
      );
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [matchId]: err.response?.data?.detail || t("matches.errorSave"),
      }));
      console.error(err.response?.data || err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  if (!selectedCompetition) {
    return <div className="text-center mt-10">{t("matches.selectCompetition")}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h1 className="text-xl font-bold mb-4">{t("matches.title")}</h1>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[100px_1fr_30px_50px_50px_30px_1fr_60px] gap-2 font-semibold text-sm mb-2 items-start">
          <div>{t("matches.date")}</div>
          <div>{t("matches.homeShort")}</div>
          <div></div>
          <div>{t("matches.homeGuessShort")}</div>
          <div>{t("matches.awayGuessShort")}</div>
          <div></div>
          <div>{t("matches.awayShort")}</div>
          <div>{t("matches.score")}</div>
        </div>

        {matches.map((match) => (
          <div key={match.id}>
            <div className="grid grid-cols-[100px_1fr_30px_50px_50px_30px_1fr_60px] items-center gap-2 border-b py-2 text-sm">
              <div>{format(parseISO(match.match_date), "yyyy-MM-dd HH:mm")}</div>

              <div className="font-semibold truncate max-w-full" title={match.team_home.name}>
                {match.team_home.name}
              </div>
              <div>
                <img
                  src={match.team_home.flag_url}
                  alt={match.team_home.name}
                  className="w-6 h-4"
                />
              </div>

              <div>
                <input
                  type="number"
                  value={match.guess_home}
                  onChange={(e) =>
                    handleInputChange(match.id, "guess_home", e.target.value)
                  }
                  placeholder={t("matches.placeholderHome")}
                  className="w-full border px-1 rounded text-center no-arrows"
                />
              </div>

              <div>
                <input
                  type="number"
                  value={match.guess_away}
                  onChange={(e) =>
                    handleInputChange(match.id, "guess_away", e.target.value)
                  }
                  placeholder={t("matches.placeholderAway")}
                  className="w-full border px-1 rounded text-center no-arrows"
                />
              </div>

              <div>
                <img
                  src={match.team_away.flag_url}
                  alt={match.team_away.name}
                  className="w-6 h-4"
                />
              </div>

              <div className="font-semibold text-right truncate max-w-full" title={match.team_away.name}>
                {match.team_away.name}
              </div>

              <div className="text-gray-500 text-right">
                ({match.home_score ?? "-"} - {match.away_score ?? "-"})
                {saving[match.id] && (
                  <span className="ml-2 text-gray-400 text-xs">{t("matches.saving")}</span>
                )}
              </div>
            </div>

            {errors[match.id] && (
              <div className="col-span-full text-red-600 text-sm bg-red-50 px-2 py-1 border-b border-red-200">
                {errors[match.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="border rounded p-3 bg-white text-sm">
            <div className="text-xs text-gray-500 mb-1">
              {format(parseISO(match.match_date), "yyyy-MM-dd HH:mm")}
            </div>

            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={match.team_home.flag_url}
                  alt={match.team_home.name}
                  className="w-6 h-4"
                />
                <span className="font-semibold truncate max-w-[120px]" title={match.team_home.name}>
                  {match.team_home.name}
                </span>
              </div>

              <span className="text-gray-500">
                {match.home_score ?? "-"} : {match.away_score ?? "-"}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-semibold truncate max-w-[120px]" title={match.team_away.name}>
                  {match.team_away.name}
                </span>
                <img
                  src={match.team_away.flag_url}
                  alt={match.team_away.name}
                  className="w-6 h-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={match.guess_home}
                onChange={(e) =>
                  handleInputChange(match.id, "guess_home", e.target.value)
                }
                placeholder={t("matches.placeholderHome")}
                className="border rounded px-2 py-1 text-center"
              />

              <input
                type="number"
                value={match.guess_away}
                onChange={(e) =>
                  handleInputChange(match.id, "guess_away", e.target.value)
                }
                placeholder={t("matches.placeholderAway")}
                className="border rounded px-2 py-1 text-center"
              />
            </div>

            {saving[match.id] && (
              <div className="text-xs text-gray-400 mt-1">{t("matches.saving")}</div>
            )}

            {errors[match.id] && (
              <div className="text-red-600 text-xs mt-1">{errors[match.id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
