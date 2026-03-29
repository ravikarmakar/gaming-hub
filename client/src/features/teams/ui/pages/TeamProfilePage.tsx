import { useState } from "react";
import { useParams } from "react-router-dom";
import { Info, Trophy, Users, Globe, Target, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamLoading } from "@/features/teams/ui/components/common/TeamLoading";
import { TeamEmpty } from "@/features/teams/ui/components/common/TeamEmpty";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TeamHero } from "@/features/teams/ui/components/dashboard/TeamHero";
import { TeamStatsGrid } from "@/features/teams/ui/components/stats/TeamStatsGrid";
import { TeamMembersList } from "@/features/teams/ui/components/roster/TeamMembersList";
import { useGetTeamByIdQuery } from "@/features/teams/hooks/useTeamQueries";
import { TeamDialogProvider } from "@/features/teams/context/TeamDialogContext";
import { TeamDialogOrchestrator } from "@/features/teams/ui/components/dialogs/TeamDialogOrchestrator";
import { useAccess } from "@/features/auth/hooks/use-access";
import { TEAM_ACCESS as ACCESS } from "@/features/teams/lib/access";
import { Team } from "@/features/teams/lib/types";
import { ProfileBannerLayout } from "@/components/shared/profile/ProfileBannerLayout";

// --- Tab Configuration ---
interface TeamTab {
  value: string;
  label: string;
  icon: LucideIcon;
}

const TEAM_TABS: TeamTab[] = [
  { value: "overview", label: "Overview", icon: Target },
  { value: "roster", label: "Roster", icon: Users },
  { value: "matches", label: "Matches", icon: Trophy },
  { value: "about", label: "About", icon: Info },
];

// --- Tab Content Components ---

const OverviewTabContent = ({ team }: { team: Team }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2">
      <Target className="w-5 h-5 text-purple-400" />
      <h2 className="text-xl font-bold uppercase tracking-tight">Team Overview</h2>
    </div>
    <TeamStatsGrid stats={team.stats} />
  </div>
);

const RosterTabContent = ({ team }: { team: Team }) => (
  <TeamMembersList members={team.teamMembers} />
);

const MatchesTabContent = ({ team }: { team: Team }) => (
  <Card className="bg-white/5 border-white/10 p-12 text-center">
    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-bold text-white mb-1">Match History Coming Soon</h3>
    <p className="text-gray-500 text-sm">
      We're currently synchronizing match data for {team.teamName}.
    </p>
  </Card>
);

const AboutTabContent = ({ team, canViewStatus }: { team: Team; canViewStatus: boolean }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-6">
      <Card className="bg-white/5 border-white/10 p-6 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          Team Biography
        </h3>
        <p className="text-gray-300 leading-relaxed italic">
          {team.bio || "No biography provided for this team yet. Reach out to the captain to learn more about their mission."}
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
            <span className="text-white font-medium">{team.region || "Global"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              <span>Recruiting</span>
            </div>
            <span className={`font-bold ${team.isRecruiting ? 'text-emerald-400' : 'text-red-400'}`}>
              {team.isRecruiting ? 'YES' : 'NO'}
            </span>
          </div>
          {canViewStatus && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Trophy className="w-4 h-4" />
                <span>Status</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${team.isVerified ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                {team.isVerified ? 'VERIFIED' : 'CITIZEN'}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  </div>
);

// --- Page Component ---

export default function TeamProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: currentTeam, isLoading, error, refetch } = useGetTeamByIdQuery(id || "", false, {
    enabled: !!id,
  });
  const { can } = useAccess();
  const [activeTab, setActiveTab] = useState(TEAM_TABS[0].value);

  if (isLoading) {
    return <TeamLoading variant="fullscreen" message="Fetching Team Data..." />;
  }

  if (error || !currentTeam) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-cyan-600/10 to-transparent pointer-events-none" />
        <TeamEmpty
          message="Team Not Found"
          subMessage="The team profile you're looking for might have been disbanded or the link is incorrect."
          action={
            <Button
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl"
              onClick={() => refetch()}
            >
              Retry Connection
            </Button>
          }
        />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTabContent team={currentTeam} />;
      case "roster":
        return <RosterTabContent team={currentTeam} />;
      case "matches":
        return <MatchesTabContent team={currentTeam} />;
      case "about":
        return <AboutTabContent team={currentTeam} canViewStatus={can(ACCESS.settings)} />;
      default:
        return null;
    }
  };

  return (
    <ProfileBannerLayout bannerImage={currentTeam.bannerUrl || undefined}>
      <TeamDialogProvider>
        <TeamDialogOrchestrator />
        {/* Layout Unification: Match Player profile structure with banner overlap and standard spacing */}
        <TeamHero team={currentTeam} />

        {/* Dynamic Content Tabs */}
        <div className="pb-24">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
            <div className="flex items-center border-b border-white/5">
              <TabsList className="bg-transparent h-auto p-0 flex space-x-4 sm:space-x-8 md:space-x-10">
                {TEAM_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    id={`tab-trigger-${tab.value}`}
                    className="px-0 py-3 sm:py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none text-zinc-400 data-[state=active]:text-white font-black uppercase text-[9px] sm:text-[11px] tracking-[1px] sm:tracking-[2px] transition-all"
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                tabIndex={0}
                aria-labelledby={`tab-trigger-${activeTab}`}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </TeamDialogProvider>
    </ProfileBannerLayout>
  );
}
