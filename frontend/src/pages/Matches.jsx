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

  // Save guess (POST if new, PATCH if exists)
  const saveGuess = async (match) => {
    if (!match) return;
    const matchId = match.id;

    const guessHome = match.guess_home !== "" ? Number(match.guess_home) : null;
    const guessAway = match.guess_away !== "" ? Number(match.guess_away) : null;

    // Ignore if new guess but empty
    if (!guessesByMatchId.current[matchId] && (guessHome === null || guessAway === null)) return;

    const payload = { guess_home: guessHome, guess_away: guessAway };
    setSaving((prev) => ({ ...prev, [matchId]: true }));

    try {
      const existingGuess = guessesByMatchId.current[matchId];
      let res;

      if (existingGuess?.id) {
        // PATCH existing guess
        res = await api.patch(`guesses/${existingGuess.id}/`, payload);
      } else {
        // POST new guess
        res = await api.post("guesses/", { match: matchId, ...payload });
      }

      // Update ref and state to reflect saved guess
      guessesByMatchId.current[matchId] = res.data;

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, user_guess: res.data, guess_home: res.data.guess_home, guess_away: res.data.guess_away }
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
        <div key={match.id} className="grid grid-cols-[150px_150px_40px_50px_50px_40px_150px_80px] items-center gap-2 border-b py-2 text-sm">
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
