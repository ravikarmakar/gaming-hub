import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerCard } from "./PlayerCard";
import { TOP_PLAYERS } from "@/lib/constants";

type FilterType = "all" | "regional" | "global";

export function RankingsSection() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Rankings" },
    { value: "regional", label: "Regional" },
    { value: "global", label: "Global" },
  ];

  return (
    <section className="py-10 bg-black relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl" />
      {/* top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-b from-black to-transparent" />
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black to-transparent" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-orbitron bg-clip-text">
            Top Players
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Meet the legends dominating the leaderboards
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-12">
          {filters.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                filter === f.value
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {TOP_PLAYERS.map((player, index) => (
              <PlayerCard key={player.id} player={player} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
            View Full Rankings
          </button>
        </motion.div>
      </div>
    </section>
  );
}
