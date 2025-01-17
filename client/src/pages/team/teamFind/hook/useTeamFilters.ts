import { useState, useMemo } from "react";
import { teams } from "../components/teamData";

export function useTeamFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    region: "",
    rank: "",
    role: "",
  });

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        !searchQuery ||
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.rank.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = !filters.region || team.region === filters.region;
      const matchesRank = !filters.rank || team.rank.includes(filters.rank);
      const matchesRole =
        !filters.role || team.recruitingRoles.includes(filters.role);

      return matchesSearch && matchesRegion && matchesRank && matchesRole;
    });
  }, [searchQuery, filters]);

  return {
    teams: filteredTeams,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
  };
}
