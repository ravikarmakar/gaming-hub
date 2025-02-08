import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Users,
  Award,
  Star,
  Gamepad,
  Target,
  Globe,
  Clock,
  TrendingUp,
  Trophy,
  Smartphone,
  Crown,
  Crosshair,
} from "lucide-react";
import PageLayout from "@/pages/PageLayout";

interface Player {
  id: number;
  name: string;
  role: string;
  subRole: string;
  tier: "Tier-I" | "Tier-II" | "Tier-III";
  experience: number;
  avatar: string;
  team: string;
  country: string;
  achievements: number;
  mainGame: "Free Fire" | "PUBG" | "Indus";
  deviceType: "iOS" | "Android";
  headShotRate: number;
  isPremium: boolean;
  viewCount: number;
  rating: number;
}

const initialPlayers: Player[] = [
  {
    id: 1,
    name: "Shadow Striker",
    role: "Assault",
    subRole: "Rusher",
    tier: "Tier-I",
    experience: 5,
    avatar: "/avatars/player1.jpg",
    team: "Phoenix Force",
    country: "India",
    achievements: 15,
    mainGame: "Free Fire",
    deviceType: "iOS",
    headShotRate: 45.5,
    isPremium: true,
    viewCount: 15000,
    rating: 4.8,
  },
  // Add more sample players here
];

const FIndPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [filters, setFilters] = useState({
    role: "",
    subRole: "",
    tier: "",
    game: "",
    device: "",
    isPremium: false,
    sortBy: "rating",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const filterPlayers = () => {
    return players
      .filter((player) => {
        return (
          (!filters.role || player.role === filters.role) &&
          (!filters.subRole || player.subRole === filters.subRole) &&
          (!filters.tier || player.tier === filters.tier) &&
          (!filters.game || player.mainGame === filters.game) &&
          (!filters.device || player.deviceType === filters.device) &&
          (!filters.isPremium || player.isPremium === true)
        );
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "rating":
            return b.rating - a.rating;
          case "headshot":
            return b.headShotRate - a.headShotRate;
          case "views":
            return b.viewCount - a.viewCount;
          default:
            return 0;
        }
      });
  };

  return (
    <PageLayout title="XYZ" description="XYZ">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Pro Gaming Talent Hub
          </h1>

          {/* Filters Section */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Game Filter */}
              <select
                className="bg-gray-700 text-white rounded-lg p-2 border border-purple-500 focus:border-blue-400"
                onChange={(e) =>
                  setFilters({ ...filters, game: e.target.value })
                }
              >
                <option value="">Select Game</option>
                <option value="Free Fire">Free Fire</option>
                <option value="PUBG">PUBG</option>
                <option value="Indus">Indus</option>
              </select>

              {/* Role Filter */}
              <select
                className="bg-gray-700 text-white rounded-lg p-2 border border-purple-500 focus:border-blue-400"
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                <option value="Assault">Assault</option>
                <option value="Support">Support</option>
                <option value="Sniper">Sniper</option>
                <option value="IGL">IGL</option>
              </select>

              {/* Tier Filter */}
              <select
                className="bg-gray-700 text-white rounded-lg p-2 border border-purple-500 focus:border-blue-400"
                onChange={(e) =>
                  setFilters({ ...filters, tier: e.target.value })
                }
              >
                <option value="">Select Tier</option>
                <option value="Tier-I">Tier I</option>
                <option value="Tier-II">Tier II</option>
                <option value="Tier-III">Tier III</option>
              </select>

              {/* Device Filter */}
              <select
                className="bg-gray-700 text-white rounded-lg p-2 border border-purple-500 focus:border-blue-400"
                onChange={(e) =>
                  setFilters({ ...filters, device: e.target.value })
                }
              >
                <option value="">Select Device</option>
                <option value="iOS">iOS</option>
                <option value="Android">Android</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              {/* Premium Filter */}
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  className="form-checkbox text-purple-500 rounded"
                  onChange={(e) =>
                    setFilters({ ...filters, isPremium: e.target.checked })
                  }
                />
                <span>Premium Players Only</span>
              </label>

              {/* Sort Options */}
              <select
                className="bg-gray-700 text-white rounded-lg p-2 border border-purple-500 focus:border-blue-400"
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
              >
                <option value="rating">Top Rated</option>
                <option value="headshot">Best Headshot Rate</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </motion.div>

          {/* Players Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filterPlayers().map((player) => (
                <motion.div
                  key={player.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative">
                    {player.isPremium && (
                      <div className="absolute top-0 right-0">
                        <Crown className="text-yellow-400 h-6 w-6" />
                      </div>
                    )}
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-500"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    {player.name}
                  </h3>

                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Gamepad className="h-4 w-4 text-purple-400" />
                        {player.mainGame}
                      </span>
                      <span className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        {player.tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        {player.role}
                      </span>
                      <span className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-400" />
                        {player.deviceType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Crosshair className="h-4 w-4 text-red-400" />
                        {player.headShotRate}% HS
                      </span>
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {player.rating}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-400" />
                          {player.experience}y exp
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          {player.viewCount.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FIndPlayers;
