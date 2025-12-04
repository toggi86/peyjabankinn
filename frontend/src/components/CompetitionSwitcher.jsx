import React from "react";
import { useCompetition } from "../context/CompetitionContext";

const CompetitionSwitcher = () => {
  const { competitions, selectedCompetition, setSelectedCompetition } =
    useCompetition();

  if (!competitions.length) return null;

  const currentCompetition = competitions.find(
    (c) => c.id === selectedCompetition
  )?.name;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-semibold">{currentCompetition}</span>
      <select
        value={selectedCompetition ?? ""}
        onChange={(e) => setSelectedCompetition(Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm bg-white text-black"
      >
        {competitions.map((comp) => (
          <option key={comp.id} value={comp.id}>
            {comp.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CompetitionSwitcher;
