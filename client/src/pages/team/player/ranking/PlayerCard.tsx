import { motion } from "framer-motion";
import { Trophy, Award, Star } from "lucide-react";
import type { TOP_PLAYERS } from "@/lib/constants";

type Player = (typeof TOP_PLAYERS)[number];

interface PlayerCardProps {
  player: Player;
  index: number;
}

export function PlayerCard({ player, index }: PlayerCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-300";
      case 3:
        return "bg-amber-600";
      default:
        return "bg-purple-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-300" />
      <div className="relative bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-cyan-500 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative w-20 h-20 rounded-full overflow-hidden"
            >
              <img
                src={player.avatar}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div
              className={`absolute -top-2 -right-2 w-8 h-8 ${getRankColor(
                player.rank
              )} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
            >
              #{player.rank}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold font-orbitron">{player.name}</h3>
              <span className="text-2xl">{player.country}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Global Rank: #{player.globalRank}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-cyan-500" />
                <span>Win Rate: {player.winRate}%</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {player.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full"
                >
                  <Award className="w-3 h-3" />
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
