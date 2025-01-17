import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface TeamSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function TeamSearch({ searchQuery, setSearchQuery }: TeamSearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="relative max-w-2xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teams by name, region, or rank..."
          className="w-full px-6 py-4 bg-gray-900/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 pl-14"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
      </div>
    </motion.div>
  );
}
