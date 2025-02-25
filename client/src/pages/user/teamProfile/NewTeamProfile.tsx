/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Star,
  Target,
  Shield,
  Gamepad2,
  Medal,
  Sword,
  Crown,
  Flame,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  UserPlus,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
import { useNavigate } from "react-router-dom";

const NewTeamProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const { seletedTeam, fetchOneTeam } = useTeamStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      await checkAuth();
    };
    fetchUser();
  }, []);

  const teamId = user?.teamId ?? null;

  useEffect(() => {
    if (teamId === null) {
      navigate("/create-team");
    }
  }, [teamId, navigate]);

  useEffect(() => {
    if (teamId && !seletedTeam) {
      fetchOneTeam(teamId);
    }
  }, [teamId, seletedTeam, fetchOneTeam]);

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderOverviewTab = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tabVariants}
      className="space-y-8"
    >
      {/* Team Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: "Victories", value: "156", trend: "+12" },
          { icon: Star, label: "Global Rank", value: "#5", trend: "Top 1%" },
          { icon: Users, label: "Active Players", value: "12", trend: "Full" },
          { icon: Target, label: "Win Rate", value: "76%", trend: "+5%" },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-4 backdrop-blur-sm border border-purple-500/20 group hover:border-purple-500/40 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl transform group-hover:translate-x-4 transition-transform duration-300" />
            <stat.icon className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">
                {stat.value}
              </span>
              <span className="text-green-400 text-sm">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Achievements</h3>
          <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "ESL Masters Champion",
              date: "Feb 2025",
              prize: "$100,000",
              icon: Crown,
            },
            {
              title: "DreamHack Runner-up",
              date: "Jan 2025",
              prize: "$50,000",
              icon: Medal,
            },
            {
              title: "Regional Qualifier",
              date: "Dec 2024",
              prize: "$25,000",
              icon: Trophy,
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
            >
              <achievement.icon className="w-8 h-8 text-yellow-400 mb-3" />
              <h4 className="font-bold text-white mb-2">{achievement.title}</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{achievement.date}</span>
                <span className="text-green-400">{achievement.prize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Match History</h3>
          <div className="space-y-3">
            {[
              { opponent: "Team Liquid", result: "WIN", score: "16-12" },
              { opponent: "Natus Vincere", result: "WIN", score: "16-14" },
              { opponent: "FaZe Clan", result: "LOSS", score: "13-16" },
            ].map((match, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-purple-900/30"
              >
                <div className="flex items-center gap-3">
                  <Sword className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{match.opponent}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      match.result === "WIN" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {match.score}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      match.result === "WIN"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {match.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">
            Upcoming Matches
          </h3>
          <div className="space-y-4">
            {[
              {
                tournament: "BLAST Premier",
                opponent: "Team Liquid",
                date: "Mar 15, 2025",
                time: "18:00 UTC",
              },
              {
                tournament: "ESL Pro League",
                opponent: "Cloud9",
                date: "Mar 18, 2025",
                time: "20:00 UTC",
              },
            ].map((match, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-purple-900/30 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 text-sm">
                    {match.tournament}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{match.date}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">vs {match.opponent}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{match.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderRosterTab = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tabVariants}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Team Roster</h3>
        <button
          onClick={() => setIsAddMemberModalOpen(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: "Alex 'Prodigy' Chen",
            role: "Team Captain",
            avatar:
              "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80",
            stats: { kd: "1.45", hs: "68%", rating: "1.24" },
          },
          {
            name: "Sarah 'Viper' Rodriguez",
            role: "Entry Fragger",
            avatar:
              "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80",
            stats: { kd: "1.35", hs: "71%", rating: "1.18" },
          },
          {
            name: "Mike 'Clutch' Johnson",
            role: "Support",
            avatar:
              "https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&q=80",
            stats: { kd: "1.12", hs: "65%", rating: "1.15" },
          },
        ].map((player, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl blur-xl transform group-hover:translate-x-1 transition-transform duration-300" />
            <div className="relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-16 h-16 rounded-full border-2 border-purple-500/50 object-cover"
                />
                <div>
                  <h4 className="font-bold text-white">{player.name}</h4>
                  <p className="text-purple-400">{player.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-900/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-400">K/D</p>
                  <p className="font-bold text-white">{player.stats.kd}</p>
                </div>
                <div className="bg-purple-900/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-400">HS%</p>
                  <p className="font-bold text-white">{player.stats.hs}</p>
                </div>
                <div className="bg-purple-900/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Rating</p>
                  <p className="font-bold text-white">{player.stats.rating}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-purple-900/50" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <img
              src="https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80"
              alt="Team Logo"
              className="relative w-32 h-32 rounded-full border-4 border-purple-500/50 object-cover"
            />
          </motion.div>
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-2"
            >
              {seletedTeam?.teamName || "Team Name"}
            </motion.h1>
            <p className="text-purple-300 text-lg">
              Professional Esports Organization
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-purple-500/20">
          {[
            { id: "overview", label: "Overview" },
            { id: "roster", label: "Team Roster" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-purple-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" ? renderOverviewTab() : renderRosterTab()}
        </AnimatePresence>
      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 p-8 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Add New Member
            </h2>
            <input
              type="text"
              placeholder="Enter username or email"
              className="w-full p-3 bg-purple-900/50 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-4 text-white placeholder-gray-400"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-colors">
                Add Member
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NewTeamProfile;
