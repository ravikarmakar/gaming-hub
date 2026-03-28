import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Award, BarChart3, Settings, Info, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { usePlayerByIdQuery } from "../../hooks/usePlayerQueries";
import { PlayerOverview } from "../components/PlayerOverview";
import { PlayerAchievements } from "../components/PlayerAchievements";
import { PlayerStats } from "../components/PlayerStats";
import { PlayerEquipment } from "../components/PlayerEquipment";
import { User } from "@/features/auth/lib/types";
import { ArenaLoading } from "@/components/shared/feedback/ArenaLoading";
import { ProfileBannerLayout } from "@/components/shared/profile/ProfileBannerLayout";
import { PlayerHeader } from "../components/PlayerHeader";

interface PlayerTab {
  value: string;
  label: string;
  icon: LucideIcon;
  component: React.FC<{ player: User }>;
}

const PLAYER_TABS: PlayerTab[] = [
  {
    value: "overview",
    label: "Overview",
    icon: Info,
    component: PlayerOverview,
  },
  {
    value: "stats",
    label: "Stats",
    icon: BarChart3,
    component: PlayerStats,
  },
  {
    value: "achievements",
    label: "Achievements",
    icon: Award,
    component: PlayerAchievements,
  },
  {
    value: "equipment",
    label: "Equipment",
    icon: Settings,
    component: PlayerEquipment,
  },
];

const PlayerIdPage = () => {
  const { id } = useParams();
  const { data, isLoading } = usePlayerByIdQuery(id || "");
  const selectedPlayer = data?.player;
  const [activeTab, setActiveTab] = useState(PLAYER_TABS[0].value);

  if (isLoading && !selectedPlayer) {
    return <ArenaLoading message="Accessing Player Data..." />;
  }

  if (!selectedPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40 tracking-[0.5em] font-black text-xl">
        PLAYER PROFILE NOT FOUND...
      </div>
    );
  }

  const ActiveComponent = PLAYER_TABS.find((tab) => tab.value === activeTab)?.component;

  return (
    <ProfileBannerLayout bannerImage={selectedPlayer.coverImage}>
      {/* Header Component */}
      <PlayerHeader player={selectedPlayer} />

      {/* Tactical Interface (Tabs) */}
      <div className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <div className="flex items-center border-b border-white/5">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-4 sm:space-x-8 md:space-x-10">
              {PLAYER_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
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
            >
              {ActiveComponent && <ActiveComponent player={selectedPlayer} />}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </ProfileBannerLayout>
  );
};

export default PlayerIdPage;
