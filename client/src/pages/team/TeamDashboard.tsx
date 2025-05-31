import { useState, useEffect } from "react";
import {
  Users,
  Trophy,
  Target,
  Calendar,
  Settings,
  Plus,
  Bell,
  Crown,
  Medal,
  Gamepad2,
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  role: string;
  rank: string;
  kd: number;
  winRate: number;
  status: "online" | "offline" | "in-game";
  avatar: string;
  level: number;
}

interface Match {
  id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  score: string;
  date: string;
  map: string;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  prize: string;
  status: "upcoming" | "live" | "completed";
}

const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const players: Player[] = [
    {
      id: "1",
      name: "ShadowStrike",
      role: "Captain",
      rank: "Diamond",
      kd: 2.4,
      winRate: 78,
      status: "online",
      avatar: "🎯",
      level: 45,
    },
    {
      id: "2",
      name: "PhoenixRage",
      role: "Entry Fragger",
      rank: "Diamond",
      kd: 2.1,
      winRate: 72,
      status: "in-game",
      avatar: "🔥",
      level: 42,
    },
    {
      id: "3",
      name: "GhostRecon",
      role: "Support",
      rank: "Platinum",
      kd: 1.8,
      winRate: 68,
      status: "online",
      avatar: "👻",
      level: 38,
    },
    {
      id: "4",
      name: "IceVenom",
      role: "Sniper",
      rank: "Diamond",
      kd: 2.6,
      winRate: 75,
      status: "offline",
      avatar: "❄️",
      level: 40,
    },
    {
      id: "5",
      name: "ThunderBolt",
      role: "Flex",
      rank: "Platinum",
      kd: 1.9,
      winRate: 70,
      status: "online",
      avatar: "⚡",
      level: 36,
    },
  ];

  const recentMatches: Match[] = [
    {
      id: "1",
      opponent: "Team Nexus",
      result: "win",
      score: "16-12",
      date: "2 hours ago",
      map: "Dust2",
    },
    {
      id: "2",
      opponent: "Cyber Wolves",
      result: "win",
      score: "16-8",
      date: "1 day ago",
      map: "Mirage",
    },
    {
      id: "3",
      opponent: "Dark Phoenix",
      result: "loss",
      score: "14-16",
      date: "2 days ago",
      map: "Inferno",
    },
    {
      id: "4",
      opponent: "Lightning Bolts",
      result: "win",
      score: "16-10",
      date: "3 days ago",
      map: "Cache",
    },
  ];

  const tournaments: Tournament[] = [
    {
      id: "1",
      name: "ESL Pro League",
      date: "Jun 15, 2025",
      prize: "$50,000",
      status: "upcoming",
    },
    {
      id: "2",
      name: "DreamHack Masters",
      date: "Live Now",
      prize: "$100,000",
      status: "live",
    },
    {
      id: "3",
      name: "BLAST Premier",
      date: "May 20, 2025",
      prize: "$25,000",
      status: "completed",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTrigger((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "in-game":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Diamond":
        return "text-blue-400";
      case "Platinum":
        return "text-purple-400";
      case "Gold":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen text-white bg-gray-900">
      {/* Header */}
      <header className="relative z-10 border-b bg-black/20 backdrop-blur-lg border-purple-500/20">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 transition-transform duration-300 transform rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-110">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    Team Nexus
                  </h1>
                  <p className="text-sm text-gray-400">Elite Gaming Squad</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 transition-colors duration-300 rounded-lg hover:bg-gray-800/50">
                <Bell className="w-5 h-5" />
                <span className="absolute w-3 h-3 bg-red-500 rounded-full -top-1 -right-1 animate-ping"></span>
              </button>
              <button className="p-2 transition-colors duration-300 rounded-lg hover:bg-gray-800/50">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 border-b bg-black/10 backdrop-blur-sm border-gray-800/50">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Trophy },
              { id: "players", label: "Players", icon: Users },
              { id: "matches", label: "Matches", icon: Target },
              { id: "tournaments", label: "Tournaments", icon: Medal },
              { id: "schedule", label: "Schedule", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-all overflow-x-hidden duration-300 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 mx-auto max-w-7xl">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {[
                {
                  title: "Team Rank",
                  value: "#12",
                  change: "+3",
                  icon: Crown,
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  title: "Win Rate",
                  value: "74%",
                  change: "+2%",
                  icon: Trophy,
                  color: "from-green-500 to-emerald-500",
                },
                {
                  title: "Avg K/D",
                  value: "2.16",
                  change: "+0.1",
                  icon: Target,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Active Players",
                  value: "5",
                  change: "Online",
                  icon: Users,
                  color: "from-purple-500 to-pink-500",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="p-6 transition-all duration-300 transform border cursor-pointer bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50 hover:border-purple-500/50 hover:-translate-y-1 hover:shadow-2xl group"
                    onMouseEnter={() => setHoveredCard(`stat-${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                        <p className="mt-1 text-sm text-green-400">
                          {stat.change}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Matches & Tournaments */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Matches */}
              <div className="overflow-hidden border bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-xl font-bold">Recent Matches</h2>
                </div>
                <div className="p-6 space-y-4">
                  {recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg bg-gray-900/50 hover:bg-gray-900/70"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            match.result === "win"
                              ? "bg-green-500"
                              : match.result === "loss"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">{match.opponent}</p>
                          <p className="text-sm text-gray-400">
                            {match.map} • {match.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{match.score}</p>
                        <p
                          className={`text-sm capitalize ${
                            match.result === "win"
                              ? "text-green-400"
                              : match.result === "loss"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {match.result}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournaments */}
              <div className="overflow-hidden border bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-xl font-bold">Tournaments</h2>
                </div>
                <div className="p-6 space-y-4">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="p-4 transition-all duration-300 rounded-lg bg-gray-900/50 hover:bg-gray-900/70"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{tournament.name}</h3>
                          <p className="text-sm text-gray-400">
                            {tournament.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            {tournament.prize}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              tournament.status === "live"
                                ? "bg-red-500/20 text-red-400"
                                : tournament.status === "upcoming"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {tournament.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Team Players</h2>
              <button className="flex items-center px-6 py-3 space-x-2 transition-all duration-300 transform rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>Recruit Player</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="p-6 transition-all duration-300 transform border cursor-pointer bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50 hover:border-purple-500/50 hover:-translate-y-2 hover:shadow-2xl group"
                >
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-16 h-16 text-2xl transition-transform duration-300 transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-110">
                        {player.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(
                          player.status
                        )} rounded-full border-2 border-gray-800 animate-pulse`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold">{player.name}</h3>
                        {player.role === "Captain" && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <p className="font-medium text-purple-400">
                        {player.role}
                      </p>
                      <p
                        className={`text-sm font-medium ${getRankColor(
                          player.rank
                        )}`}
                      >
                        {player.rank}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Level</span>
                      <span className="font-bold text-yellow-400">
                        {player.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">K/D Ratio</span>
                      <span className="font-bold text-blue-400">
                        {player.kd}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="font-bold text-green-400">
                        {player.winRate}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-2 transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${player.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs would follow similar pattern */}
        {activeTab !== "overview" && activeTab !== "players" && (
          <div className="p-12 text-center border bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Coming Soon</h3>
            <p className="text-gray-400">
              This section is under development. Stay tuned for awesome
              features!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamDashboard;
