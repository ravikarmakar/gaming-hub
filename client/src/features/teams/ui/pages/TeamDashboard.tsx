import { useEffect } from "react";
import { Users, Trophy, Crown, Target, Loader2, AlertCircle, UserPlus, Settings, BarChart2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { TeamHeader } from "../components/TeamHeader";
import { TeamStatCard } from "../components/TeamStatCard";
import { TeamRecentMatch } from "../components/TeamRecentMatch";
import { TournamentItem } from "../components/TournamentItem";

const TeamDashboard = () => {
  const { user } = useAuthStore();
  const { currentTeam, getTeamById, isLoading, error, clearError } = useTeamStore();

  useEffect(() => {
    // Clear any previous errors (e.g., from failed member adding) when visiting dashboard
    clearError();

    if (user?.teamId) {
      getTeamById(user.teamId);
    }
  }, [user?.teamId, getTeamById, clearError]);

  if (isLoading && !currentTeam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-purple-400 animate-spin" />
          <p className="text-sm text-gray-400">Loading your team dashboard...</p>
        </div>
      </div>
    );
  }

  // Only show full error screen if we don't have currentTeam data
  if (error && !currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h2>
        <p className="text-gray-400 max-w-md mb-6">{error}</p>
        <Button
          variant="outline"
          onClick={() => user?.teamId && getTeamById(user.teamId)}
          className="border-white/10 hover:bg-white/5"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!currentTeam) return null;

  const statsData = [
    {
      title: "Win Rate",
      value: `${currentTeam.stats?.winRate || 0}%`,
      icon: Trophy,
      color: "emerald",
    },
    {
      title: "Total Matches",
      value: currentTeam.stats?.totalMatches || 0,
      icon: Target,
      color: "blue",
    },
    {
      title: "Tournament Wins",
      value: currentTeam.stats?.tournamentWins || 0,
      icon: Crown,
      color: "amber",
    },
    {
      title: "Total Prize Won",
      value: `$${(currentTeam.stats?.totalPrizeWon || 0).toLocaleString()}`,
      icon: Users,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C1A] pb-12">
      <main className="relative z-10 px-4 py-6 mx-auto max-w-7xl">
        {/* Team Header */}
        <div className="mb-10">
          {currentTeam && <TeamHeader team={currentTeam} isDashboard={true} />}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-white/10 hover:bg-white/5 bg-white/5"
            >
              <UserPlus className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Invite Players</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-white/10 hover:bg-white/5 bg-white/5"
            >
              <Trophy className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Find Tournaments</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-white/10 hover:bg-white/5 bg-white/5"
            >
              <BarChart2 className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">View Stats</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-white/10 hover:bg-white/5 bg-white/5"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Settings</span>
            </Button>
          </div>
        </div>

        <div className="space-y-10">
          {/* Stats Section */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Team Performance
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => (
                <TeamStatCard key={index} {...stat} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Matches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Recent Matches
                </h2>
                <Button variant="link" className="text-gray-400 text-xs hover:text-white p-0">
                  View All →
                </Button>
              </div>
              <div className="space-y-3">
                <TeamRecentMatch
                  opponent="Nexus Gaming"
                  result="win"
                  score="16 - 12"
                  date="2 hours ago"
                  map="Dust II"
                />
                <TeamRecentMatch
                  opponent="Cyber Wolves"
                  result="win"
                  score="16 - 8"
                  date="1 day ago"
                  map="Mirage"
                />
                <TeamRecentMatch
                  opponent="Dark Phoenix"
                  result="loss"
                  score="14 - 16"
                  date="2 days ago"
                  map="Inferno"
                />
              </div>
            </div>

            {/* Tournaments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Tournaments
                </h2>
                <Button variant="link" className="text-gray-400 text-xs hover:text-white p-0">
                  Manage →
                </Button>
              </div>
              <div className="space-y-3">
                {currentTeam.playedTournaments?.length > 0 ? (
                  currentTeam.playedTournaments.slice(0, 3).map((t, idx) => (
                    <TournamentItem
                      key={idx}
                      name={`Tournament ${idx + 1}`}
                      date={new Date(t.playedAt).toLocaleDateString()}
                      prize={t.prizeWon}
                      status={t.status}
                      placement={t.placement}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center border border-white/10 rounded-lg bg-white/5">
                    <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 text-sm mb-4">No tournament history found</p>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 text-sm"
                    >
                      Find Tournaments
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDashboard;
