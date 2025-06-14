import React, { useState } from "react";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Star,
  Gamepad2,
  Award,
  Heart,
  Share2,
  MessageCircle,
  Zap,
  Shield,
  Target,
  Flame,
  CheckCircle,
  Sword,
  Crown,
  Medal,
  Activity,
  BarChart3,
  User,
  Gift,
} from "lucide-react";
import { TabContent, Tabs } from "@/components/Tab";
import { GlowButton } from "@/ui/element/Button";

// =============== TYPES ===============
interface GameStats {
  readonly game: string;
  readonly rank: string;
  readonly rating: number;
  readonly hoursPlayed: number;
  readonly winRate: number;
  readonly matches: number;
  readonly kda?: number;
  readonly icon: string;
  readonly color: string;
  readonly tier:
    | "bronze"
    | "silver"
    | "gold"
    | "platinum"
    | "diamond"
    | "master"
    | "grandmaster";
}

interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly rarity: "common" | "rare" | "epic" | "legendary";
  readonly unlockedAt: string;
  readonly progress?: number;
  readonly maxProgress?: number;
}

interface Match {
  readonly id: string;
  readonly game: string;
  readonly result: "win" | "loss" | "draw";
  readonly score: string;
  readonly duration: string;
  readonly date: string;
  readonly gameMode: string;
  readonly rank: string;
  readonly teammates?: readonly string[];
}

interface PlayerStats {
  readonly totalMatches: number;
  readonly totalWins: number;
  readonly totalHours: number;
  readonly averageKDA: number;
  readonly highestRank: string;
  readonly favoriteGame: string;
  readonly joinedDate: string;
  readonly followers: number;
  readonly following: number;
}

interface PlayerData {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly avatar: string;
  readonly banner: string;
  readonly bio: string;
  readonly location: string;
  readonly verified: boolean;
  readonly status: "online" | "away" | "busy" | "offline";
  readonly currentGame?: string;
  readonly level: number;
  readonly xp: number;
  readonly xpToNext: number;
  readonly tier:
    | "bronze"
    | "silver"
    | "gold"
    | "platinum"
    | "diamond"
    | "master"
    | "grandmaster";
  readonly stats: PlayerStats;
  readonly gameStats: readonly GameStats[];
  readonly achievements: readonly Achievement[];
  readonly recentMatches: readonly Match[];
  readonly team?: string;
  readonly sponsors?: readonly string[];
}

const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
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

interface ProgressBarProps {
  readonly current: number;
  readonly max: number;
  readonly className?: string;
  readonly showLabel?: boolean;
  readonly color?: "blue" | "green" | "purple" | "yellow" | "red";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
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

// =============== ACHIEVEMENT CARD ===============
interface AchievementCardProps {
  readonly achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const hoverProps = useHover();

  const getRarityConfig = (rarity: Achievement["rarity"]) => {
    const configs = {
      common: {
        color: "from-gray-500 to-gray-600",
        borderColor: "border-gray-500/30",
        textColor: "text-gray-400",
      },
      rare: {
        color: "from-blue-500 to-blue-600",
        borderColor: "border-blue-500/30",
        textColor: "text-blue-400",
      },
      epic: {
        color: "from-purple-500 to-purple-600",
        borderColor: "border-purple-500/30",
        textColor: "text-purple-400",
      },
      legendary: {
        color: "from-yellow-500 to-yellow-600",
        borderColor: "border-yellow-500/30",
        textColor: "text-yellow-400",
      },
    };
    return configs[rarity];
  };

  const rarityConfig = getRarityConfig(achievement.rarity);

  return (
    <div
      className={`group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border ${
        rarityConfig.borderColor
      } rounded-2xl p-4 transition-all duration-300 ${
        hoverProps.isHovered ? "scale-105 shadow-lg" : ""
      }`}
      {...hoverProps}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-r ${rarityConfig.color} flex items-center justify-center text-white`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">{achievement.title}</h4>
          <p className={`text-xs ${rarityConfig.textColor} font-medium`}>
            {achievement.rarity.charAt(0).toUpperCase() +
              achievement.rarity.slice(1)}
          </p>
        </div>
      </div>

      <p className="mb-2 text-xs text-gray-400">{achievement.description}</p>

      {achievement.progress !== undefined && achievement.maxProgress && (
        <ProgressBar
          current={achievement.progress}
          max={achievement.maxProgress}
          showLabel={false}
          color={
            achievement.rarity === "legendary"
              ? "yellow"
              : achievement.rarity === "epic"
              ? "purple"
              : "blue"
          }
          className="mb-2"
        />
      )}

      <div className="text-xs text-gray-500">
        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

// =============== MATCH HISTORY CARD ===============
interface MatchCardProps {
  readonly match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const hoverProps = useHover();

  const getResultConfig = (result: Match["result"]) => {
    const configs = {
      win: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <Trophy className="w-4 h-4" />,
      },
      loss: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <Target className="w-4 h-4" />,
      },
      draw: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <Medal className="w-4 h-4" />,
      },
    };
    return configs[result];
  };

  const resultConfig = getResultConfig(match.result);

  return (
    <div
      className={`group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 transition-all duration-300 ${
        hoverProps.isHovered ? "border-gray-700 bg-gray-800/50" : ""
      }`}
      {...hoverProps}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${resultConfig.color} flex items-center gap-1`}
          >
            {resultConfig.icon}
            {match.result.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-white">{match.game}</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(match.date).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Score: </span>
          <span className="font-medium text-white">{match.score}</span>
        </div>
        <div>
          <span className="text-gray-400">Duration: </span>
          <span className="font-medium text-white">{match.duration}</span>
        </div>
        <div>
          <span className="text-gray-400">Mode: </span>
          <span className="font-medium text-white">{match.gameMode}</span>
        </div>
        <div>
          <span className="text-gray-400">Rank: </span>
          <span className="font-medium text-white">{match.rank}</span>
        </div>
      </div>
    </div>
  );
};

// player data
const player: PlayerData = {
  id: "1",
  username: "pro_gamer",
  displayName: "Pro Gamer",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  banner:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  bio: "Competitive gamer. FPS, MOBA, and everything in between. Always up for a challenge!",
  location: "New York, USA",
  verified: true,
  status: "online",
  currentGame: "Valorant",
  level: 42,
  xp: 3200,
  xpToNext: 5000,
  tier: "diamond",
  stats: {
    totalMatches: 1200,
    totalWins: 800,
    totalHours: 3400,
    averageKDA: 2.1,
    highestRank: "Diamond 1",
    favoriteGame: "Valorant",
    joinedDate: "2021-03-15T00:00:00.000Z",
    followers: 15400,
    following: 120,
  },
  gameStats: [
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
  ],
  achievements: [
    {
      id: "ach1",
      title: "First Blood",
      description: "Achieve the first kill in a match.",
      icon: <Zap className="w-5 h-5" />,
      rarity: "common",
      unlockedAt: "2023-01-10T12:00:00.000Z",
      progress: 1,
      maxProgress: 1,
    },
    {
      id: "ach2",
      title: "Unstoppable",
      description: "Win 10 matches in a row.",
      icon: <Flame className="w-5 h-5" />,
      rarity: "rare",
      unlockedAt: "2023-02-15T12:00:00.000Z",
      progress: 10,
      maxProgress: 10,
    },
    {
      id: "ach3",
      title: "Legend",
      description: "Reach the highest rank in any game.",
      icon: <Crown className="w-5 h-5" />,
      rarity: "legendary",
      unlockedAt: "2024-01-01T12:00:00.000Z",
    },
  ],
  recentMatches: [
    {
      id: "m1",
      game: "Valorant",
      result: "win",
      score: "13-7",
      duration: "32m",
      date: "2024-05-20T18:30:00.000Z",
      gameMode: "Competitive",
      rank: "Diamond 1",
      teammates: ["Alice", "Bob", "Charlie"],
    },
    {
      id: "m2",
      game: "League of Legends",
      result: "loss",
      score: "12-18",
      duration: "28m",
      date: "2024-05-18T16:00:00.000Z",
      gameMode: "Ranked",
      rank: "Platinum 3",
      teammates: ["Dave", "Eve"],
    },
    {
      id: "m3",
      game: "CS:GO",
      result: "draw",
      score: "15-15",
      duration: "45m",
      date: "2024-05-15T20:00:00.000Z",
      gameMode: "Competitive",
      rank: "Master Guardian",
      teammates: ["Frank", "Grace"],
    },
  ],
  team: "Team Phoenix",
  sponsors: ["HyperX", "SteelSeries"],
};

export default function TeamIdPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(player.stats.followers);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  const getStatusConfig = (status: PlayerData["status"]) => {
    const configs = {
      online: { color: "bg-green-500", text: "Online", pulse: true },
      away: { color: "bg-yellow-500", text: "Away", pulse: false },
      busy: { color: "bg-red-500", text: "Busy", pulse: false },
      offline: { color: "bg-gray-500", text: "Offline", pulse: false },
    };
    return configs[status];
  };

  const getTierConfig = (tier: PlayerData["tier"]) => {
    const configs = {
      bronze: {
        color: "from-amber-600 to-amber-800",
        icon: <Shield className="w-6 h-6" />,
      },
      silver: {
        color: "from-gray-400 to-gray-600",
        icon: <Award className="w-6 h-6" />,
      },
      gold: {
        color: "from-yellow-400 to-yellow-600",
        icon: <Star className="w-6 h-6" />,
      },
      platinum: {
        color: "from-cyan-400 to-cyan-600",
        icon: <Zap className="w-6 h-6" />,
      },
      diamond: {
        color: "from-blue-400 to-blue-600",
        icon: <Crown className="w-6 h-6" />,
      },
      master: {
        color: "from-purple-400 to-purple-600",
        icon: <Trophy className="w-6 h-6" />,
      },
      grandmaster: {
        color: "from-red-400 to-red-600",
        icon: <Flame className="w-6 h-6" />,
      },
    };
    return configs[tier];
  };

  const statusConfig = getStatusConfig(player.status);
  const tierConfig = getTierConfig(player.tier);
  const winRate = Math.round(
    (player.stats.totalWins / player.stats.totalMatches) * 100
  );

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <User className="w-4 h-4" />,
      content: <OverViewContent player={player} />,
    },
    {
      id: "stats",
      label: "Game Stats",
      icon: <BarChart3 className="w-4 h-4" />,
      badge: player.gameStats.length,
      content: <StatsContent player={player} />,
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: <Award className="w-4 h-4" />,
      badge: player.achievements.length,
      content: <Achievement player={player} />,
    },
    {
      id: "matches",
      label: "Matche History",
      icon: <Activity className="w-4 h-4" />,
      badge: player.recentMatches.length,
      content: <MatchHistory player={player} />,
    },
  ];

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Enhanced Banner Section */}
      <div className="relative h-64 overflow-hidden md:h-80 rounded-xl">
        <img
          src={player.banner}
          alt="Banner"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
      </div>

      {/* Enhanced Profile Header */}
      <div className="relative z-10 px-4 mx-auto -mt-20 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 mb-12 lg:flex-row lg:items-start lg:gap-12">
          {/* Profile Image & Status */}
          <div className="relative group">
            <div className="relative">
              <img
                src={player.avatar}
                alt={player.username}
                className="w-32 h-32 transition-all duration-500 bg-gray-900 border-4 border-gray-800 rounded-full shadow-2xl sm:w-36 sm:h-36 md:w-40 md:h-40 group-hover:shadow-blue-500/20"
              />

              {/* Status Indicator */}
              <div className="absolute flex items-center gap-2 -bottom-2 -right-2">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    statusConfig.color
                  } rounded-full border-4 border-gray-800 ${
                    statusConfig.pulse ? "animate-pulse" : ""
                  }`}
                />
                {player.verified && (
                  <div className="p-2 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Tier Badge */}
              <div
                className={`absolute -top-2 -left-2 bg-gradient-to-r ${tierConfig.color} rounded-full p-2 sm:p-3 shadow-lg border-2 border-gray-800`}
              >
                {tierConfig.icon}
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:opacity-100 -z-10" />
          </div>

          {/* Profile Info */}
          <div className="w-full space-y-6 text-center lg:text-left lg:flex-1">
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-4">
                <h1 className="text-3xl font-bold text-transparent sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
                  {player.displayName}
                </h1>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    statusConfig.color === "bg-green-500"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : statusConfig.color === "bg-yellow-500"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : statusConfig.color === "bg-red-500"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  {statusConfig.text}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-300 border rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
                  <Users className="w-4 h-4" />
                  {player.team}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-yellow-300 border rounded-full bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border-yellow-500/30">
                  <Gift className="w-4 h-4" />
                  Sponsored
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 text-sm text-gray-400 sm:flex-row sm:gap-4 sm:justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{player.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(player.stats.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-300 sm:text-base">
                {player.bio}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <GlowButton
                variant={isFollowing ? "secondary" : "primary"}
                onClick={handleFollow}
                size="md"
              >
                <Heart className="w-5 h-5" />
                {isFollowing ? "Following" : "Follow"}
                <span className="ml-2">{followerCount}</span>
              </GlowButton>
              <GlowButton
                variant="secondary"
                onClick={() => console.log("Message clicked")}
                size="md"
              >
                <MessageCircle className="w-5 h-5" />
                Message
              </GlowButton>
              <GlowButton
                variant="ghost"
                onClick={() => console.log("Settings clicked")}
                size="md"
              >
                <Share2 className="w-5 h-5" />
                Share
              </GlowButton>
              <GlowButton
                variant="danger"
                onClick={() => console.log("Challenge clicked")}
                size="md"
              >
                <Sword className="w-5 h-5" />
                Challenge
              </GlowButton>
            </div>

            {/* Player Stats */}
            <div className="grid grid-cols-2 gap-6 mt-6 sm:grid-cols-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {player.stats.totalMatches}
                </span>
                <span className="text-xs text-gray-400">Matches</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-400">
                  {player.stats.totalWins}
                </span>
                <span className="text-xs text-gray-400">Wins</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-purple-400">
                  {player.stats.totalHours}h
                </span>
                <span className="text-xs text-gray-400">Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-yellow-400">
                  {winRate}%
                </span>
                <span className="text-xs text-gray-400">Win Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mx-auto mb-8 overflow-x-auto max-w-7xl sm:px-6 lg:px-8">
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <TabContent motionKey={activeTab}>
          {tabItems.find((tab) => tab.id === activeTab)?.content}
        </TabContent>
      </div>
    </div>
  );
}

// Tab Content Component
const OverViewContent: React.FC<{ player: PlayerData }> = ({ player }) => {
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

const StatsContent: React.FC<{ player: PlayerData }> = ({ player }) => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {player.gameStats.map((gameStats) => (
        <GameStatCard key={gameStats.game} gameStats={gameStats} />
      ))}
    </div>
  );
};

const Achievement: React.FC<{ player: PlayerData }> = ({ player }) => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {player.achievements.map((ach) => (
        <AchievementCard key={ach.id} achievement={ach} />
      ))}
    </div>
  );
};

const MatchHistory: React.FC<{ player: PlayerData }> = ({ player }) => {
  return (
    <div className="space-y-6">
      {player.recentMatches.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No recent matches found.
        </div>
      ) : (
        player.recentMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))
      )}
    </div>
  );
};
