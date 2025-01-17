import { motion } from "framer-motion";
// import { Filter } from "lucide-react";

interface TeamFiltersProps {
  filters: {
    region: string;
    rank: string;
    role: string;
  };
  setFilters: (filters: { region: string; rank: string; role: string }) => void;
}

export function TeamFilters({ filters, setFilters }: TeamFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8 flex flex-wrap gap-4 justify-center"
    >
      <select
        value={filters.region}
        onChange={(e) => setFilters({ ...filters, region: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">All Regions</option>
        <option value="Asia">Asia</option>
        <option value="Europe">Europe</option>
        <option value="NA">North America</option>
      </select>

      <select
        value={filters.rank}
        onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">All Ranks</option>
        <option value="Diamond">Diamond+</option>
        <option value="Platinum">Platinum+</option>
        <option value="Gold">Gold+</option>
      </select>

      <select
        value={filters.role}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">All Roles</option>
        <option value="Support">Support</option>
        <option value="Rusher">Rusher</option>
        <option value="Sniper">Sniper</option>
      </select>
    </motion.div>
  );
}
