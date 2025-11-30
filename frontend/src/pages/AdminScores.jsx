import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function AdminScores() {
  const [matches, setMatches] = useState([]);
  const [saving, setSaving] = useState({});
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  // Check if user is staff or superuser
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get('auth/me/');
        const user = res.data;
        if (user.is_superuser || user.is_staff) {
          setAuthorized(true);
        } else {
          navigate('/'); // redirect unauthorized users
        }
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  // Fetch matches once authorized
  useEffect(() => {
    if (!authorized) return;

    const fetchMatches = async () => {
      try {
        const res = await api.get('matches/');
        setMatches(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    fetchMatches();
  }, [authorized]);

  const handleChange = (matchId, field, value) => {
    setMatches(prev =>
      prev.map(m =>
        m.id === matchId ? { ...m, [field]: value } : m
      )
    );
  };

  const saveScore = async (match) => {
    const matchId = match.id;
    const payload = {
      score_home: match.score_home !== '' ? Number(match.score_home) : null,
      score_away: match.score_away !== '' ? Number(match.score_away) : null,
    };

    setSaving(prev => ({ ...prev, [matchId]: true }));

    try {
      await api.patch(`matches/${matchId}/`, payload);
      setMatches(prev =>
        prev.map(m =>
          m.id === matchId ? { ...m, ...payload } : m
        )
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setSaving(prev => ({ ...prev, [matchId]: false }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authorized) return null;

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h1 className="text-xl font-bold mb-4">Set Correct Scores</h1>

      <div className="grid grid-cols-[150px_150px_40px_50px_50px_40px_150px_80px] gap-2 font-semibold text-sm mb-2">
        <div>Date</div>
        <div>Home Team</div>
        <div></div>
        <div>Home Score</div>
        <div>Away Score</div>
        <div></div>
        <div>Away Team</div>
        <div></div>
      </div>

      {matches.map(match => (
        <div
          key={match.id}
          className="grid grid-cols-[150px_150px_40px_50px_50px_40px_150px_80px] items-center gap-2 border-b py-2 text-sm"
        >
          {/* Date */}
          <div>{new Date(match.match_date).toLocaleString()}</div>

          {/* Home Team */}
          <div className="font-semibold">{match.team_home.name}</div>

          {/* Home Flag */}
          <div>
            <img
              src={match.team_home.flag_url}
              alt={match.team_home.name}
              className="w-6 h-4"
            />
          </div>

          {/* Home Score */}
          <div>
            <input
              type="number"
              value={match.score_home ?? ''}
              onChange={(e) =>
                handleChange(match.id, 'score_home', e.target.value)
              }
              className="w-full border px-1 rounded text-center no-arrows"
            />
          </div>

          {/* Away Score */}
          <div>
            <input
              type="number"
              value={match.score_away ?? ''}
              onChange={(e) =>
                handleChange(match.id, 'score_away', e.target.value)
              }
              className="w-full border px-1 rounded text-center no-arrows"
            />
          </div>

          {/* Away Flag */}
          <div>
            <img
              src={match.team_away.flag_url}
              alt={match.team_away.name}
              className="w-6 h-4"
            />
          </div>

          {/* Away Team */}
          <div className="font-semibold text-right">{match.team_away.name}</div>

          {/* Save button + saving indicator */}
          <div className="text-right">
            <button
              onClick={() => saveScore(match)}
              disabled={saving[match.id]}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Save
            </button>
            {saving[match.id] && (
              <span className="ml-2 text-gray-400 text-xs">saving...</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
