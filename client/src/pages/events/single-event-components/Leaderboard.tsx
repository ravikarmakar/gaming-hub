import { Crown, Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

const LeaderBoard = () => {
  const leaderboardData = [
    {
      rank: 1,
      username: "FireKing123",
      score: 2850,
      kills: 156,
      wins: 42,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 2,
      username: "PUBGMaster",
      score: 2720,
      kills: 145,
      wins: 38,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 3,
      username: "EliteSniper",
      score: 2680,
      kills: 142,
      wins: 35,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 4,
      username: "ProGamer404",
      score: 2450,
      kills: 128,
      wins: 32,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 5,
      username: "BattleQueen",
      score: 2380,
      kills: 125,
      wins: 30,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 6,
      username: "NinjaWarrior",
      score: 2340,
      kills: 118,
      wins: 28,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 7,
      username: "HeadHunter",
      score: 2290,
      kills: 115,
      wins: 27,
      avatar: "/api/placeholder/48/48",
    },
    {
      rank: 8,
      username: "StealthMode",
      score: 2200,
      kills: 110,
      wins: 25,
      avatar: "/api/placeholder/48/48",
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-purple-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-blue-400" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-400">
            {rank}
          </span>
        );
    }
  };

  const getRowColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-900/20 to-yellow-800/10";
      case 2:
        return "bg-gradient-to-r from-purple-900/20 to-purple-800/10";
      case 3:
        return "bg-gradient-to-r from-blue-900/20 to-blue-800/10";
      default:
        return "bg-gray-900/0";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Battle Royale Leaderboard
        </h2>
        <p className="text-gray-400">Top Players This Season</p>
      </motion.div>

      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Wins
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-800"
          >
            {leaderboardData.map((player, index) => (
              <motion.tr
                key={index}
                variants={rowVariants}
                whileHover="hover"
                className={`${getRowColor(
                  player.rank
                )} transition-all duration-300`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.div
                    className="flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getRankIcon(player.rank)}
                  </motion.div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <motion.img
                      src={player.avatar}
                      alt={player.username}
                      className="w-10 h-10 rounded-full bg-gray-700"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-200">
                        {player.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 font-semibold">
                    {player.score}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{player.kills}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{player.wins}</div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderBoard;
