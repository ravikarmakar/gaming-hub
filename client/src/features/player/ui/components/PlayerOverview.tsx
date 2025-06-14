import { Crown, Gamepad2, Star } from "lucide-react";

export const PlayerOverview = () => {
  const player = {
    level: 27,
    xp: 18450,
    xpToNext: 25000,
    stats: {
      favoriteGame: "Free Fire",
      highestRank: "Grandmaster",
    },
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Level & XP */}
      <div className="flex flex-col items-center p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 text-yellow-400" />
          <span className="text-3xl font-bold text-yellow-300">
            Level {player.level}
          </span>
        </div>
        <ProgressBar
          current={player.xp}
          max={player.xpToNext}
          color="purple"
          className="w-full"
        />
        <div className="mt-2 text-xs text-gray-400">
          {player.xp.toLocaleString()} XP / {player.xpToNext.toLocaleString()}{" "}
          XP
        </div>
      </div>
      {/* Favorite Game */}
      <div className="flex flex-col items-center p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Gamepad2 className="w-8 h-8 mb-2 text-blue-400" />
        <span className="text-lg text-gray-300">Favorite Game</span>
        <span className="text-2xl font-bold text-blue-400">
          {player.stats.favoriteGame}
        </span>
      </div>
      {/* Highest Rank */}
      <div className="flex flex-col items-center p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Crown className="w-8 h-8 mb-2 text-purple-400" />
        <span className="text-lg text-gray-300">Highest Rank</span>
        <span className="text-2xl font-bold text-purple-400">
          {player.stats.highestRank}
        </span>
      </div>
    </div>
  );
};

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  color?: "blue" | "green" | "purple" | "yellow" | "red";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  className = "",
  showLabel = true,
  color = "blue",
}) => {
  const percentage = Math.min((current / max) * 100, 100);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progress</span>
          <span>
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div className="w-full h-3 overflow-hidden bg-gray-800 rounded-full">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};
