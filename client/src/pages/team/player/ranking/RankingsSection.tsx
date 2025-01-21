import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YouTubersSection } from "./YouTubersSection";
import { OrganizationsSection } from "./OrganizationsSection";
import { Players } from "./Players";

const RankingsSection = () => {
  const [activeTab, setActiveTab] = useState<
    "players" | "youtubers" | "organizations"
  >("players");

  const tabs = [
    { value: "players", label: "Top Players" },
    { value: "youtubers", label: "Gaming YouTubers" },
    { value: "organizations", label: "Organizations" },
  ];

  return (
    <section className="relative bg-black overflow-hidden py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl" />

      {/* Headers */}
      <div className="container max-w-[1400px] mx-auto px-4  sm:px-6 relative">
        <motion.div
          className="text-center mb-16 mx-10"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 tracking-tight">
            Esports Ranking
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Rankings of the top-10 players, organizations, and gaming YouTubers
          </p>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-50 backdrop-blur-lg">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex overflow-x-auto overflow-y-hidden gap-4 scrollbar-hide">
            {tabs.map((tab) => (
              <motion.button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as typeof activeTab)}
                className={`whitespace-nowrap px-5 py-2 rounded-full border border-gray-800 text-sm md:text-base lg:text-lg transition-all duration-300 ${
                  activeTab === tab.value
                    ? "bg-cyan-800/30 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "players" && (
          <motion.div
            key="players"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Players />
          </motion.div>
        )}

        {activeTab === "youtubers" && (
          <motion.div
            key="youtubers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <YouTubersSection />
          </motion.div>
        )}

        {activeTab === "organizations" && (
          <motion.div
            key="organizations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrganizationsSection />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RankingsSection;
