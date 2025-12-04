import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const CompetitionContext = createContext();

export const CompetitionProvider = ({ children }) => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const res = await api.get("competitions/");
        setCompetitions(res.data);

        // auto-select first if nothing selected yet
        if (!selectedCompetition && res.data.length) {
          setSelectedCompetition(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load competitions", err);
      }
    };
    loadCompetitions();
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
