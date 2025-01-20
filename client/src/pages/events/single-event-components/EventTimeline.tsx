import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crosshair,
  Target,
  Crown,
  Flame,
  Shield,
  Sword,
  Medal,
  Users,
  Map,
} from "lucide-react";

const EventTimeLine = () => {
  const [selectedStage, setSelectedStage] = useState(null);

  const stages = [
    {
      id: 1,
      title: "OPEN QUALIFIERS",
      phase: "SURVIVAL PHASE",
      status: "completed",
      dates: "MAR 1-3",
      mainPrize: "50,000 UC/Diamonds",
      matchDetails: {
        format: "100 Players - Battle Royale",
        maps: ["Erangel", "Bermuda"],
        matches: "6 Matches Per Day",
        pointSystem: "Kill Points + Placement",
        qualification: "Top 50 Teams Advance",
      },
      rewards: ["Mythic Character Skin", "Tournament Avatar Frame"],
      icon: Target,
      color: "emerald",
    },
    {
      id: 2,
      title: "REGIONAL CLASH",
      phase: "ELIMINATION PHASE",
      status: "current",
      dates: "MAR 10-12",
      mainPrize: "150,000 UC/Diamonds",
      matchDetails: {
        format: "16 Teams - Squad Battle",
        maps: ["Miramar", "Purgatory"],
        matches: "8 Matches Per Day",
        pointSystem: "WWCD + Placement Points",
        qualification: "Top 24 Teams Advance",
      },
      rewards: ["Exclusive Vehicle Skin", "Custom Emote"],
      icon: Sword,
      color: "blue",
    },
    {
      id: 3,
      title: "PRO LEAGUE",
      phase: "CHAMPIONSHIP PHASE",
      status: "upcoming",
      dates: "MAR 15-17",
      mainPrize: "300,000 UC/Diamonds",
      matchDetails: {
        format: "24 Teams - Pro League",
        maps: ["Sanhok", "Kalahari"],
        matches: "10 Matches Per Day",
        pointSystem: "Advanced Point System",
        qualification: "Top 16 Teams Advance",
      },
      rewards: ["Legendary Gun Skin Set", "Team Jersey"],
      icon: Shield,
      color: "purple",
    },
    {
      id: 4,
      title: "GRAND FINALS",
      phase: "ULTIMATE SHOWDOWN",
      status: "upcoming",
      dates: "MAR 20",
      mainPrize: "1,000,000 UC/Diamonds",
      matchDetails: {
        format: "16 Teams - Finals",
        maps: ["All Maps", "Alpine"],
        matches: "12 Championship Matches",
        pointSystem: "Finals Point Format",
        qualification: "Champion Declaration",
      },
      rewards: ["Championship Title", "Custom Team Skin Set"],
      icon: Crown,
      color: "rose",
    },
  ];

  const getColors = (color) =>
    ({
      emerald: {
        bg: "from-emerald-500/20",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        glow: "group-hover:shadow-emerald-500/20",
      },
      blue: {
        bg: "from-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
        glow: "group-hover:shadow-blue-500/20",
      },
      purple: {
        bg: "from-purple-500/20",
        text: "text-purple-400",
        border: "border-purple-500/30",
        glow: "group-hover:shadow-purple-500/20",
      },
      rose: {
        bg: "from-rose-500/20",
        text: "text-rose-400",
        border: "border-rose-500/30",
        glow: "group-hover:shadow-rose-500/20",
      },
    }[color]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative conatiner pt-10"
    >
      {/* Header */}
      <motion.div className="mb-10" initial={{ y: -20 }} animate={{ y: 0 }}>
        <div className="inline-flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Flame className="w-10 h-10 text-orange-500" />
            <h1 className="text-xl md:text-4xl font-bold">Event Timeline</h1>
          </div>
        </div>
      </motion.div>

      {/* Stages Grid */}
      <div className="grid gap-6 py=-10">
        {stages.map((stage, index) => {
          const colors = getColors(stage.color);
          const isSelected = selectedStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <motion.div
                onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                className={`relative group cursor-pointer overflow-hidden
                  p-6 rounded-2xl border backdrop-blur-xl
                  bg-gradient-to-br ${colors.bg} to-black/90 
                  ${colors.border} hover:shadow-lg ${colors.glow}
                  transition-all duration-300`}
              >
                {/* Main Content */}
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`p-3 rounded-xl bg-black/50 ${colors.border}`}
                      >
                        <stage.icon className={`w-6 h-6 ${colors.text}`} />
                      </motion.div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${colors.text}`}
                          >
                            {stage.phase}
                          </span>
                          {stage.status === "current" && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                              LIVE NOW
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {stage.title}
                        </h3>
                        <span className="text-gray-400 text-sm">
                          {stage.dates}
                        </span>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-black/30 rounded-full px-4 py-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-400 font-medium">
                          {stage.mainPrize}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Match Details */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Match Details
                            </h4>
                            {Object.entries(stage.matchDetails).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-start gap-3 text-sm"
                                >
                                  <span className="text-gray-400">{key}:</span>
                                  <span className="text-white">{value}</span>
                                </div>
                              )
                            )}
                          </div>

                          {/* Rewards */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Medal className="w-5 h-5" />
                              Stage Rewards
                            </h4>
                            <ul className="space-y-2">
                              {stage.rewards.map((reward, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Flame className="w-4 h-4 text-orange-400" />
                                  <span className="text-white">{reward}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EventTimeLine;
