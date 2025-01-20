import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Star } from "lucide-react";

interface TeamData {
  id: number;
  teamName: string;
  totalMatches: number;
  totalKills: number;
  totalScore: number;
  winRate: number;
}

const LeaderBoard = () => {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);

  const teams: TeamData[] = [
    {
      id: 1,
      teamName: "Team Elite",
      totalMatches: 45,
      totalKills: 238,
      totalScore: 892,
      winRate: 68,
    },
    {
      id: 2,
      teamName: "Phoenix Squad",
      totalMatches: 45,
      totalKills: 225,
      totalScore: 845,
      winRate: 64,
    },
    {
      id: 3,
      teamName: "Dragon Warriors",
      totalMatches: 45,
      totalKills: 212,
      totalScore: 812,
      winRate: 61,
    },
    {
      id: 4,
      teamName: "Shadow Hunters",
      totalMatches: 45,
      totalKills: 198,
      totalScore: 775,
      winRate: 58,
    },
    {
      id: 5,
      teamName: "Ninja Force",
      totalMatches: 45,
      totalKills: 185,
      totalScore: 742,
      winRate: 55,
    },
    {
      id: 6,
      teamName: "Ghost Squad",
      totalMatches: 45,
      totalKills: 175,
      totalScore: 715,
      winRate: 52,
    },
    {
      id: 7,
      teamName: "Eagle Eye",
      totalMatches: 45,
      totalKills: 168,
      totalScore: 695,
      winRate: 49,
    },
    {
      id: 8,
      teamName: "Wolf Pack",
      totalMatches: 45,
      totalKills: 162,
      totalScore: 678,
      winRate: 47,
    },
    {
      id: 9,
      teamName: "Thunder Legion",
      totalMatches: 45,
      totalKills: 155,
      totalScore: 645,
      winRate: 45,
    },
    {
      id: 10,
      teamName: "Cobra Unit",
      totalMatches: 45,
      totalKills: 148,
      totalScore: 625,
      winRate: 43,
    },
    {
      id: 11,
      teamName: "Viper Squad",
      totalMatches: 45,
      totalKills: 142,
      totalScore: 608,
      winRate: 41,
    },
    {
      id: 12,
      teamName: "Lion Hearts",
      totalMatches: 45,
      totalKills: 135,
      totalScore: 585,
      winRate: 39,
    },
  ];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Crown className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Crown className="w-6 h-6 text-amber-700" />;
      default:
        return <Star className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRowColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 via-gray-400/10 to-transparent";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 via-amber-700/10 to-transparent";
      default:
        return "bg-gray-800/40";
    }
  };

  return (
    <div className="min-h-screen">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative"
        >
          <h1 className="text-5xl md:text-6xl font-bold mt-8 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500">
              Free Fire Tournament
            </span>
          </h1>
          <motion.p
            className="text-gray-400 text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Elite Teams Battleground
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-gray-800/30 rounded-3xl p-8 backdrop-blur-xl border border-gray-700/50 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <div className="relative">
            <div className="grid grid-cols-5 gap-4 mb-6 text-gray-400 font-semibold text-sm md:text-base px-4 py-3">
              <div>RANK</div>
              <div>TEAM NAME</div>
              <div className="text-center">MATCHES</div>
              <div className="text-center">KILLS</div>
              <div className="text-center">SCORE</div>
            </div>

            <AnimatePresence>
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  onClick={() =>
                    setSelectedTeam(selectedTeam === team.id ? null : team.id)
                  }
                  onHoverStart={() => setHoveredTeam(team.id)}
                  onHoverEnd={() => setHoveredTeam(null)}
                  className={`grid grid-cols-5 gap-4 px-6 py-4 ${getRowColor(
                    index + 1
                  )} 
                    rounded-xl mb-3 cursor-pointer relative
                    ${
                      hoveredTeam === team.id
                        ? "shadow-lg shadow-purple-500/10"
                        : ""
                    }
                    ${
                      selectedTeam === team.id ? "ring-2 ring-purple-500" : ""
                    }`}
                >
                  <motion.div
                    className="font-bold flex items-center gap-3"
                    whileHover={{ scale: 1.1 }}
                  >
                    {getRankIcon(index + 1)}
                    <span
                      className={index < 3 ? "text-white" : "text-gray-400"}
                    >
                      #{index + 1}
                    </span>
                  </motion.div>

                  <div className="font-semibold text-white flex items-center gap-2">
                    {team.teamName}
                    {index < 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <Flame className="w-4 h-4 text-orange-500" />
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    {team.totalMatches}
                  </motion.div>

                  <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    {team.totalKills}
                  </motion.div>

                  <motion.div
                    className="text-center font-semibold"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-purple-400">{team.totalScore}</span>
                  </motion.div>

                  {selectedTeam === team.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="col-span-5 mt-4 bg-gray-800/50 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-gray-400 text-sm">Win Rate</div>
                          <div className="text-white font-bold">
                            {team.winRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">K/D Ratio</div>
                          <div className="text-white font-bold">
                            {(team.totalKills / team.totalMatches).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LeaderBoard;
