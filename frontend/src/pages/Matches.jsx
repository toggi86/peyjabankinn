import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const matchesRes = await api.get("matches/");
      const guessesRes = await api.get("guesses/");

      // Merge guesses into matches
      const merged = matchesRes.data.map(match => {
        const guess = guessesRes.data.find(g => g.match.id === match.id);
        return {
          ...match,
          guess_id: guess?.id || null,
          guess_home: guess?.guess_home ?? "",
          guess_away: guess?.guess_away ?? ""
        };
      });
      setMatches(merged);
    };
    loadData();
  }, []);

  // Save on change
  const handleGuessChange = async (matchId, field, value) => {
    setMatches(prev =>
      prev.map(m => m.id === matchId ? { ...m, [field]: value } : m)
    );

    setSaving(p => ({ ...p, [matchId]: true }));

    const match = matches.find(m => m.id === matchId);
    const payload = {
      match: matchId,
      guess_home: field === "guess_home" ? value : match.guess_home,
      guess_away: field === "guess_away" ? value : match.guess_away
    };

    try {
      if (match.guess_id) {
        await api.patch(`guesses/${match.guess_id}/`, payload);
      } else {
        const res = await api.post(`guesses/`, payload);
        setMatches(prev => prev.map(m => 
          m.id === matchId ? { ...m, guess_id: res.data.id } : m
        ));
      }
    } finally {
      setSaving(p => ({ ...p, [matchId]: false }));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 space-y-2">
      <h1 className="text-xl font-bold mb-4">Matches</h1>

      {matches.map(match => (
        <div
          key={match.id}
          className="grid grid-cols-[120px,1fr,80px] items-center border-b py-2 text-sm"
        >
          {/* Date */}
          <span className="text-gray-500">{match.match_date.split("T")[0]}</span>

          {/* Teams + aligned score inputs */}
          <div className="grid grid-cols-[1fr,40px,10px,40px,1fr] items-center gap-2 text-center">
            <b className="text-right pr-2">{match.team_home.name}</b>

            <input
              type="number"
              value={match.guess_home}
              onChange={(e) =>
                handleGuessChange(match.id, "guess_home", e.target.value)
              }
              className="border rounded text-center w-full"
            />

            <span>-</span>

            <input
              type="number"
              value={match.guess_away}
              onChange={(e) =>
                handleGuessChange(match.id, "guess_away", e.target.value)
              }
              className="border rounded text-center w-full"
            />

            <b className="text-left pl-2">{match.team_away.name}</b>
          </div>

          {/* Correct final score */}
          <span className="text-gray-400 text-center">
            ({match.score_home ?? "-"} - {match.score_away ?? "-"})
          </span>
        </div>
      ))}
    </div>
  );
}
