import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const CompetitionContext = createContext();

export const CompetitionProvider = ({ children }) => {
  const [competitions, setCompetitions] = useState([]);

  // Load selected competition from localStorage
  const [selectedCompetition, setSelectedCompetitionState] = useState(() => {
    const saved = localStorage.getItem("selectedCompetition");
    return saved ? Number(saved) : null;
  });

  // Persist selection
  useEffect(() => {
    if (selectedCompetition !== null) {
      localStorage.setItem("selectedCompetition", selectedCompetition);
    }
  }, [selectedCompetition]);

  const setSelectedCompetition = (id) => {
    setSelectedCompetitionState(id);
  };

  // Fetch competitions from API
  useEffect(() => {
    api.get("competitions/")
      .then(res => {
        setCompetitions(res.data);
        // Pick first competition if none selected yet
        if (!selectedCompetition && res.data.length > 0) {
          setSelectedCompetition(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <CompetitionContext.Provider
      value={{ competitions, selectedCompetition, setSelectedCompetition }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => useContext(CompetitionContext);
