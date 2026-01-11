import { Users, Trophy, Crown, Target } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { PlayerHeader } from "@/features/player/ui/components/PlayerHeader";

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

const memberData = [
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
];

const TeamDashboard = () => {
  const { user } = useAuthStore();

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

  return (
    <div className="min-h-screen overflow-y-auto text-white bg-gray-900">
      <main className="relative z-10 px-4 py-4 mx-auto md:py-8 max-w-7xl">
        {user && <PlayerHeader player={user} type="player" />}

        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {memberData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 transition-all duration-300 transform border cursor-pointer bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50 hover:border-purple-500/50 hover:-translate-y-1 hover:shadow-2xl group"
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
      </main>
    </div>
  );
};

export default TeamDashboard;
