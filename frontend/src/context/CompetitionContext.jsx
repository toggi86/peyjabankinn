import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const CompetitionContext = createContext();

export const CompetitionProvider = ({ children }) => {
  const { token, loading } = useAuth(); // <-- get token
  const [competitions, setCompetitions] = useState([]);

  const [selectedCompetition, setSelectedCompetitionState] = useState(() => {
    const saved = localStorage.getItem("selectedCompetition");
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (selectedCompetition !== null) {
      localStorage.setItem("selectedCompetition", selectedCompetition);
    }
  }, [selectedCompetition]);

  const setSelectedCompetition = (id) => {
    setSelectedCompetitionState(id);
  };

  useEffect(() => {
    if (!token || loading) return; // <-- guard fetch

    api.get("competitions/")
      .then(res => {
        setCompetitions(res.data);
        if (!selectedCompetition && res.data.length > 0) {
          setSelectedCompetition(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, [token, loading]);

  return (
    <CompetitionContext.Provider
      value={{ competitions, selectedCompetition, setSelectedCompetition }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => useContext(CompetitionContext);
