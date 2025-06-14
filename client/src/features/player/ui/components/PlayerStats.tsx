import { Gamepad2 } from "lucide-react";
import { useHover } from "../../hook/useHover";

type GameStats = {
  game: string;
  rank: string;
  rating: number;
  hoursPlayed: number;
  winRate: number;
  matches: number;
  kda: number;
  icon: string;
  color: string;
  tier:
    | "bronze"
    | "silver"
    | "gold"
    | "platinum"
    | "diamond"
    | "master"
    | "grandmaster";
};

export const PlayerStats = () => {
  const gameStats: GameStats[] = [
    {
      game: "Valorant",
      rank: "Diamond 1",
      rating: 2450,
      hoursPlayed: 1200,
      winRate: 67,
      matches: 800,
      kda: 2.3,
      icon: "",
      color: "#6366f1",
      tier: "diamond",
    },
    {
      game: "League of Legends",
      rank: "Platinum 3",
      rating: 2100,
      hoursPlayed: 900,
      winRate: 59,
      matches: 600,
      kda: 2.0,
      icon: "",
      color: "#06b6d4",
      tier: "platinum",
    },
    {
      game: "CS:GO",
      rank: "Master Guardian",
      rating: 1800,
      hoursPlayed: 600,
      winRate: 54,
      matches: 400,
      kda: 1.8,
      icon: "",
      color: "#f59e42",
      tier: "gold",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {gameStats.map((gameStats) => (
        <GameStatCard key={gameStats.game} gameStats={gameStats} />
      ))}
    </div>
  );
};

const GameStatCard: React.FC<{ gameStats: GameStats }> = ({ gameStats }) => {
  const hoverProps = useHover();

  const getTierConfig = (tier: GameStats["tier"]) => {
    const configs = {
      bronze: {
        color: "from-amber-600 to-amber-800",
        textColor: "text-amber-400",
      },
      silver: {
        color: "from-gray-400 to-gray-600",
        textColor: "text-gray-400",
      },
      gold: {
        color: "from-yellow-400 to-yellow-600",
        textColor: "text-yellow-400",
      },
      platinum: {
        color: "from-cyan-400 to-cyan-600",
        textColor: "text-cyan-400",
      },
      diamond: {
        color: "from-blue-400 to-blue-600",
        textColor: "text-blue-400",
      },
      master: {
        color: "from-purple-400 to-purple-600",
        textColor: "text-purple-400",
      },
      grandmaster: {
        color: "from-red-400 to-red-600",
        textColor: "text-red-400",
      },
    };
    return configs[tier];
  };

  const tierConfig = getTierConfig(gameStats.tier);

  return (
    <div
      className={`group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 ${
        hoverProps.isHovered
          ? "border-blue-500/30 shadow-2xl shadow-blue-500/10 -translate-y-1"
          : ""
      }`}
      {...hoverProps}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              backgroundColor: gameStats.color + "20",
              color: gameStats.color,
            }}
          >
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{gameStats.game}</h3>
            <p className="text-sm text-gray-400">
              {gameStats.hoursPlayed}h played
            </p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full bg-gradient-to-r ${tierConfig.color} text-white text-sm font-medium`}
        >
          {gameStats.tier.charAt(0).toUpperCase() + gameStats.tier.slice(1)}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 text-center bg-gray-800/30 rounded-xl">
            <div className={`text-2xl font-bold ${tierConfig.textColor}`}>
              {gameStats.rating}
            </div>
            <div className="text-xs text-gray-400">Rating</div>
          </div>
          <div className="p-3 text-center bg-gray-800/30 rounded-xl">
            <div className="text-2xl font-bold text-green-400">
              {gameStats.winRate}%
            </div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-400">
          <span>Matches: {gameStats.matches}</span>
          {gameStats.kda && <span>K/D/A: {gameStats.kda}</span>}
        </div>

        <div className="text-center">
          <div className={`text-lg font-bold ${tierConfig.textColor}`}>
            {gameStats.rank}
          </div>
          <div className="text-xs text-gray-400">Current Rank</div>
        </div>
      </div>
    </div>
  );
};
