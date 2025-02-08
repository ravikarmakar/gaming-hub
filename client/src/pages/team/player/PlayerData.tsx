import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FIND_PLAYER_DATA } from "@/lib/constants";
import {
  Filter,
  Users,
  Award,
  Star,
  Gamepad,
  Target,
  Globe,
} from "lucide-react";
import PageLayout from "@/pages/PageLayout";

interface Player {
  id: number;
  name: string;
  role: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master";
  experience: number;
  avatar: string;
  team: string;
  country: string;
  achievements: number;
  mainGame: string;
}

const initialPlayers: Player[] = [
  {
    id: 1,
    name: "Alex Rodriguez",
    role: "Mid Laner",
    tier: "Diamond",
    experience: 7,
    avatar: "/api/placeholder/100/100",
    team: "Quantum Surge",
    country: "USA",
    achievements: 12,
    mainGame: "League of Legends",
  },
  {
    id: 1,
    name: "Alex Rodriguez",
    role: "Mid Laner",
    tier: "Diamond",
    experience: 7,
    avatar: "/api/placeholder/100/100",
    team: "Quantum Surge",
    country: "USA",
    achievements: 12,
    mainGame: "League of Legends",
  },
  {
    id: 2,
    name: "Emma Chen",
    role: "Support",
    tier: "Platinum",
    experience: 5,
    avatar: "/api/placeholder/100/100",
    team: "Cyber Wolves",
    country: "China",
    achievements: 8,
    mainGame: "Valorant",
  },
  {
    id: 3,
    name: "Kai Nakamura",
    role: "ADC",
    tier: "Master",
    experience: 9,
    avatar: "/api/placeholder/100/100",
    team: "Tokyo Titans",
    country: "Japan",
    achievements: 15,
    mainGame: "League of Legends",
  },
  {
    id: 4,
    name: "Sofia Martinez",
    role: "Jungler",
    tier: "Gold",
    experience: 4,
    avatar: "/api/placeholder/100/100",
    team: "Latin Eagles",
    country: "Brazil",
    achievements: 6,
    mainGame: "Dota 2",
  },
  {
    id: 5,
    name: "Ivan Petrov",
    role: "Top Laner",
    tier: "Diamond",
    experience: 6,
    avatar: "/api/placeholder/100/100",
    team: "Slavic Storm",
    country: "Russia",
    achievements: 10,
    mainGame: "League of Legends",
  },
  {
    id: 6,
    name: "Aisha Khan",
    role: "Mid Laner",
    tier: "Platinum",
    experience: 5,
    avatar: "/api/placeholder/100/100",
    team: "Desert Eagles",
    country: "Pakistan",
    achievements: 7,
    mainGame: "Valorant",
  },
  {
    id: 7,
    name: "Lars Hansen",
    role: "Support",
    tier: "Diamond",
    experience: 8,
    avatar: "/api/placeholder/100/100",
    team: "Nordic Warriors",
    country: "Denmark",
    achievements: 11,
    mainGame: "League of Legends",
  },
  {
    id: 8,
    name: "Maria Kim",
    role: "ADC",
    tier: "Gold",
    experience: 3,
    avatar: "/api/placeholder/100/100",
    team: "Seoul Spartans",
    country: "South Korea",
    achievements: 5,
    mainGame: "Overwatch",
  },
  {
    id: 9,
    name: "Carlos Gomez",
    role: "Jungler",
    tier: "Silver",
    experience: 2,
    avatar: "/api/placeholder/100/100",
    team: "Iberian Pride",
    country: "Spain",
    achievements: 3,
    mainGame: "Dota 2",
  },
  {
    id: 10,
    name: "Ahmed Hassan",
    role: "Top Laner",
    tier: "Master",
    experience: 10,
    avatar: "/api/placeholder/100/100",
    team: "Middle East Monarchs",
    country: "Egypt",
    achievements: 16,
    mainGame: "League of Legends",
  },
  // ... (other players)
];

const FindPlayer: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [filter, setFilter] = useState<{
    role?: string;
    tier?: string;
    game?: string;
    country?: string;
  }>({});

  const filteredPlayers = players.filter(
    (player) =>
      (!filter.role || player.role === filter.role) &&
      (!filter.tier || player.tier === filter.tier) &&
      (!filter.game || player.mainGame === filter.game) &&
      (!filter.country || player.country === filter.country)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <PageLayout title="XYZ" description="SYX">
      <div className="min-h-screen text-gray-200 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto"
        >
          <h1 className="text-5xl font-extrabold text-center mb-8 text-blue-400 tracking-widest">
            🎮 eSports Player Finder
          </h1>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.select
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  role: e.target.value || undefined,
                }))
              }
            >
              <option value="">All Roles</option>
              <option value="Mid Laner">Mid Laner</option>
              <option value="Support">Support</option>
              <option value="ADC">ADC</option>
              <option value="Jungler">Jungler</option>
              <option value="Top Laner">Top Laner</option>
            </motion.select>
            {/* Similar code for tier, game, and country filters */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-blue-600 text-gray-200 rounded-lg hover:bg-blue-700"
              onClick={() => setFilter({})}
            >
              <Filter className="mr-2" /> Reset
            </motion.button>
          </div>

          {/* Player Grid */}
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPlayers.map((player) => (
                <motion.div
                  key={player.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 10px 20px rgba(51,102,255,0.7)",
                  }}
                  className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center"
                >
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-purple-500"
                  />
                  <h2 className="text-2xl font-bold text-blue-400 mb-2">
                    {player.name}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4 italic">
                    {player.team}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <div className="flex items-center space-x-1 bg-blue-500 px-2 py-1 rounded-full">
                      <Gamepad size={16} className="text-gray-100" />
                      <span className="text-sm">{player.mainGame}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-500 px-2 py-1 rounded-full">
                      <Globe size={16} className="text-gray-100" />
                      <span className="text-sm">{player.country}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="flex items-center justify-center space-x-2 bg-gray-700 p-2 rounded-lg">
                      <Star className="text-yellow-500" size={16} />
                      <span>{player.role}</span>
                    </div>
                    <div
                      className={`flex items-center justify-center space-x-2 ${
                        player.tier === "Diamond"
                          ? "bg-blue-800 text-blue-300"
                          : player.tier === "Platinum"
                          ? "bg-purple-800 text-purple-300"
                          : "bg-gray-700 text-gray-300"
                      } p-2 rounded-lg`}
                    >
                      <Award size={16} />
                      <span>{player.tier}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FindPlayer;
