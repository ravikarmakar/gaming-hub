import { motion } from "framer-motion";
import { TeamSearch } from "./components/TeamSearch";
import { TeamFilters } from "./components/TeamFilters";
import { TeamGrid } from "./components/TeamGrid";
import { useTeamFilters } from "./hook/useTeamFilters";
// import { Search } from "lucide-react";

export default function TeamFinderPage() {
  const { teams, filters, searchQuery, setSearchQuery, setFilters } =
    useTeamFilters();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-500 mb-4">
            Find Your Dream Team
          </h1>
          <p className="text-gray-400 text-lg">
            Connect with players and join the perfect squad
          </p>
        </motion.div>

        <TeamSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <TeamFilters filters={filters} setFilters={setFilters} />
        <TeamGrid teams={teams} />
      </div>
    </motion.div>
  );
}
