import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import debounce from "lodash.debounce";
import { useCompetition } from "../context/CompetitionContext";

export default function Matches() {
  const { selectedCompetition } = useCompetition();

  const [matches, setMatches] = useState([]);
  const [saving, setSaving] = useState({});
  const debouncedRefs = useRef({});
  const guessesByMatchId = useRef({}); // Track existing guesses per match

  // Fetch matches + guesses for selected competition
  const fetchMatchesAndGuesses = async (competitionId) => {
    try {
      const [matchesRes, guessesRes] = await Promise.all([
        api.get(`matches/?competition=${competitionId}`),
        api.get(`guesses/?competition=${competitionId}`),
      ]);

      console.log("✅ API MATCHES:", matchesRes.data);
      console.log("✅ API GUESSES:", guessesRes.data);

      // Store guesses in ref
      guessesByMatchId.current = {};
      guessesRes.data.forEach((guess) => {
        const matchId = typeof guess.match === "object" ? guess.match.id : guess.match;
        guessesByMatchId.current[matchId] = guess;
      });

      // Merge guesses into matches
      const merged = matchesRes.data.map((match) => {
        const guess = guessesByMatchId.current[match.id];
        return {
          ...match,
          user_guess: guess || null,
          guess_home: guess?.guess_home ?? "",
          guess_away: guess?.guess_away ?? "",
        };
      });

      setMatches(merged);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Reload matches when competition changes
  useEffect(() => {
    if (!selectedCompetition) return;

    fetchMatchesAndGuesses(selectedCompetition);

    // Auto-refresh match scores every 15 seconds
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`matches/?competition=${selectedCompetition}`);
        setMatches((prev) =>
          prev.map((match) => {
            const updated = res.data.find((m) => m.id === match.id);
            if (!updated) return match;
            return { ...match, home_score: updated.home_score, away_score: updated.away_score };
          })
        );
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedCompetition]);

  // Handle input changes with debouncing
  const handleInputChange = (matchId, field, value) => {
    // Update local state immediately
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    );

    // Prepare latest payload for save
    const matchState = matches.find((m) => m.id === matchId) || {};
    const payload = {
      matchId,
      guess_home: field === "guess_home" ? value : matchState.guess_home,
      guess_away: field === "guess_away" ? value : matchState.guess_away,
    };

    // Initialize debounced function if not yet
    if (!debouncedRefs.current[matchId]) {
      debouncedRefs.current[matchId] = debounce(saveGuess, 500);
    }

    // Call debounced save with latest values
    debouncedRefs.current[matchId](payload);
  };

  // Save guess (POST if new, PATCH if exists)
  const saveGuess = async ({ matchId, guess_home, guess_away }) => {
    const payload = {
      guess_home: guess_home !== "" ? Number(guess_home) : null,
      guess_away: guess_away !== "" ? Number(guess_away) : null,
    };

    // Ignore if new guess but empty
    if (!guessesByMatchId.current[matchId] && (payload.guess_home === null || payload.guess_away === null))
      return;

    setSaving((prev) => ({ ...prev, [matchId]: true }));

    try {
      const existingGuess = guessesByMatchId.current[matchId];
      let res;

      if (existingGuess?.id) {
        console.log("✅ PATCHING GUESS", existingGuess.id);
        res = await api.patch(`guesses/${existingGuess.id}/`, payload);
      } else {
        console.log("✅ POSTING NEW GUESS", matchId);
        res = await api.post("guesses/", { match: matchId, ...payload });
      }

      // Update ref immediately
      guessesByMatchId.current[matchId] = res.data;

      // Update UI immediately
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
      console.error(err.response?.data || err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  if (!selectedCompetition) {
    return <div className="text-center mt-10">Select a competition</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h1 className="text-xl font-bold mb-4">Matches</h1>

      <div className="grid grid-cols-[150px_150px_40px_50px_50px_40px_150px_80px] gap-2 font-semibold text-sm mb-2">
        <div>Date</div>
        <div>Home Team</div>
        <div></div>
        <div>Home Guess</div>
        <div>Away Guess</div>
        <div></div>
        <div>Away Team</div>
        <div>Score</div>
      </div>

      {matches.map((match) => (
        <div
          key={match.id}
          className="grid grid-cols-[150px_150px_40px_50px_50px_40px_150px_80px] items-center gap-2 border-b py-2 text-sm"
        >
          <div>{new Date(match.match_date).toLocaleString()}</div>
          <div className="font-semibold">{match.team_home.name}</div>
          <div>
            <img src={match.team_home.flag_url} alt={match.team_home.name} className="w-6 h-4" />
          </div>

          <div>
            <input
              type="number"
              value={match.guess_home}
              onChange={(e) => handleInputChange(match.id, "guess_home", e.target.value)}
              className="w-full border px-1 rounded text-center no-arrows"
            />
          </div>

          <div>
            <input
              type="number"
              value={match.guess_away}
              onChange={(e) => handleInputChange(match.id, "guess_away", e.target.value)}
              className="w-full border px-1 rounded text-center no-arrows"
            />
          </div>

          <div>
            <img src={match.team_away.flag_url} alt={match.team_away.name} className="w-6 h-4" />
          </div>

          <div className="font-semibold text-right">{match.team_away.name}</div>

          <div className="text-gray-500 text-right">
            ({match.home_score ?? "-"} - {match.away_score ?? "-"})
            {saving[match.id] && <span className="ml-2 text-gray-400 text-xs">saving...</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
