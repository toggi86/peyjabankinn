import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [saving, setSaving] = useState({}); // track saving per match

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('matches/');
        setMatches(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchMatches();
  }, []);

  const handleGuessChange = async (id, field, value) => {
    // Update local state immediately
    setMatches(prev =>
      prev.map(match =>
        match.id === id ? { ...match, [field]: value } : match
      )
    );

    // Show saving indicator
    setSaving(prev => ({ ...prev, [id]: true }));

    // Auto-save to backend
    try {
      await api.patch(`guesses/${id}/`, {
        home_guess: field === 'home_guess' ? value : matches.find(m => m.id === id).home_guess,
        away_guess: field === 'away_guess' ? value : matches.find(m => m.id === id).away_guess,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 space-y-2">
      <h1 className="text-xl font-bold mb-4">Matches</h1>

      {matches.length === 0 && <p>No matches available.</p>}

      {matches.map(match => (
        <div
          key={match.id}
          className="flex justify-between items-center border-b py-2"
        >
          {/* Date */}
          <span className="text-sm text-gray-600 w-32">{match.match_date}</span>

          {/* Teams & User Guess */}
          <span className="flex-1 text-center flex items-center justify-center space-x-2">
            <span className="font-semibold">{match.team_home.name}</span>

            <input
              type="number"
              value={match.home_guess ?? ''}
              onChange={(e) =>
                handleGuessChange(match.id, 'home_guess', e.target.value)
              }
              className="w-12 border px-1 rounded text-center"
            />
            <span>-</span>
            <input
              type="number"
              value={match.away_guess ?? ''}
              onChange={(e) =>
                handleGuessChange(match.id, 'away_guess', e.target.value)
              }
              className="w-12 border px-1 rounded text-center"
            />

            <span className="font-semibold">{match.team_away.name}</span>

            {/* Saving indicator */}
            {saving[match.id] && (
              <span className="ml-2 text-sm text-gray-400">saving...</span>
            )}
          </span>

          {/* Correct Score */}
          <span className="text-sm text-gray-500 ml-4">
            ({match.home_score} - {match.away_score})
          </span>
        </div>
      ))}
    </div>
  );
}
