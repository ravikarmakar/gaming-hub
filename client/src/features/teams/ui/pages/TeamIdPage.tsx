import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle, Info, Trophy, Users, Globe, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TeamOrbs } from "../components/TeamOrbs";
import { TeamHero } from "../components/TeamHero";
import { TeamStatsGrid } from "../components/TeamStatsGrid";
import { TeamMembersList } from "../components/TeamMembersList";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACCESS as ACCESS } from "@/features/teams/lib/access";

export default function TeamIdPage() {
  const { id } = useParams<{ id: string }>();
  const { currentTeam, getTeamById, isLoading, error } = useTeamStore();
  const { can } = useAccess();

  useEffect(() => {
    if (id) {
      getTeamById(id);
    }
  }, [id, getTeamById]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C1A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <p className="text-gray-400 font-medium">Fetching team intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !currentTeam) {
    return (
      <div className="min-h-screen bg-[#0B0C1A] flex items-center justify-center p-6">
        <TeamOrbs />
        <Card className="max-w-md w-full bg-white/5 border-white/10 p-8 text-center relative z-10 backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Team Not Found</h2>
          <p className="text-gray-400 mb-6">
            The team profile you're looking for might have been disbanded or the link is incorrect.
          </p>
          <Button
            className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
            onClick={() => id && getTeamById(id)}
          >
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C1A] text-white relative overflow-hidden pb-20">
      {/* Background Effects */}
      <TeamOrbs />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-12">
        {/* Hero Section */}
        <TeamHero team={currentTeam} />

        {/* Stats Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Team Overview</h2>
          </div>
          <TeamStatsGrid stats={currentTeam.stats} />
        </div>

        {/* Dynamic Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto flex-wrap sm:flex-nowrap">
            <TabsTrigger
              value="overview"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
            >
              Roster
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
            >
              Recent Matches
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <TeamMembersList members={currentTeam.teamMembers} />
          </TabsContent>

          <TabsContent value="matches" className="mt-8">
            <Card className="bg-white/5 border-white/10 p-12 text-center">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-white mb-1">Match History Coming Soon</h3>
              <p className="text-gray-500 text-sm">We're currently synchronizing match data for {currentTeam.teamName}.</p>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/5 border-white/10 p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-400" />
                    Team Biography
                  </h3>
                  <p className="text-gray-300 leading-relaxed italic">
                    {currentTeam.bio || "No biography provided for this team yet. Reach out to the captain to learn more about their mission."}
                  </p>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Team Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Globe className="w-4 h-4" />
                        <span>Region</span>
                      </div>
                      <span className="text-white font-medium">{currentTeam.region || "Global"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Users className="w-4 h-4" />
                        <span>Recruiting</span>
                      </div>
                      <span className={`font-bold ${currentTeam.isRecruiting ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentTeam.isRecruiting ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {can(ACCESS.settings) && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>Status</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${currentTeam.isVerified ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                          {currentTeam.isVerified ? 'VERIFIED' : 'CITIZEN'}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
