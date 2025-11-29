import React, { useEffect, useState } from 'react';
import api from '../api/client';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [guesses, setGuesses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMatches = await api.get('matches/');
        setMatches(resMatches.data);

        const resGuesses = await api.get('guesses/');
        const guessMap = {};
        resGuesses.data.forEach(g => {
          guessMap[g.match.id] = { guess_home: g.guess_home, guess_away: g.guess_away };
        });
        setGuesses(guessMap);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleGuessChange = (matchId, field, value) => {
    setGuesses(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value }
    }));
  };

  const handleSubmitGuess = async (matchId) => {
    const guess = guesses[matchId];
    if (!guess || guess.guess_home === undefined || guess.guess_away === undefined) {
      alert('Please enter both scores');
      return;
    }

    try {
      await api.post('guesses/', {
        match: matchId,
        guess_home: parseInt(guess.guess_home),
        guess_away: parseInt(guess.guess_away)
      });
      alert('Guess submitted!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit guess (maybe you already guessed this match).');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Matches</h1>
      <ul className="space-y-4">
        {matches.map(m => {
          const userGuess = guesses[m.id] || {};
          return (
            <li key={m.id} className="p-4 bg-white rounded shadow">
              <strong>{m.team_home.name} vs {m.team_away.name}</strong> <br />
              <em>{new Date(m.match_date).toLocaleString()}</em> <br />

              <div className="mt-2 flex items-center gap-2">
                <input type="number" placeholder="Home" value={userGuess.guess_home || ''} onChange={e => handleGuessChange(m.id, 'guess_home', e.target.value)} className="border p-1 rounded w-16"/>
                <input type="number" placeholder="Away" value={userGuess.guess_away || ''} onChange={e => handleGuessChange(m.id, 'guess_away', e.target.value)} className="border p-1 rounded w-16"/>
                <button onClick={() => handleSubmitGuess(m.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Submit</button>
              </div>

              {userGuess.guess_home !== undefined && userGuess.guess_away !== undefined && (
                <p className="mt-2 text-sm text-gray-600">Your guess: {userGuess.guess_home} - {userGuess.guess_away}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Matches;
