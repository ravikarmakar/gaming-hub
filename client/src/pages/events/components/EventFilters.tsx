import { motion } from "framer-motion";

interface EventFiltersProps {
  filters: {
    eventType: string;
    startDate: string;
    endDate: string;
    minPrize: string; // Changed to string
  };
  setFilters: (filters: {
    eventType: string;
    startDate: string;
    endDate: string;
    minPrize: string; // Changed to string
  }) => void;
}

export function EventFilters({ filters, setFilters }: EventFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8 flex flex-wrap gap-4 justify-center"
    >
      <select
        value={filters.eventType}
        onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="all">All Events</option>
        <option value="new">New Events</option>
        <option value="last-month">Last Month</option>
      </select>

      <select
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">Select Start Date</option>
        <option value="2024-01-01">Jan 1, 2024</option>
        <option value="2024-02-01">Feb 1, 2024</option>
        <option value="2024-03-01">Mar 1, 2024</option>
      </select>

      <select
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">Select End Date</option>
        <option value="2024-01-31">Jan 31, 2024</option>
        <option value="2024-02-28">Feb 28, 2024</option>
        <option value="2024-03-31">Mar 31, 2024</option>
      </select>

      <select
        value={filters.minPrize}
        onChange={(e) => setFilters({ ...filters, minPrize: e.target.value })}
        className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">Select Min Prize Pool</option>
        <option value="1000">1,000</option>
        <option value="5000">5,000</option>
        <option value="10000">10,000</option>
      </select>
    </motion.div>
  );
}
