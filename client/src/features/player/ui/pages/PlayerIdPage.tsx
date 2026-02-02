import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, BarChart3, Settings, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { usePlayerStore } from "../../store/usePlayerStore";
import { PlayerHeader } from "../components/PlayerHeader";
import { PlayerOverview } from "../components/PlayerOverview";
import { PlayerAchievements } from "../components/PlayerAchievements";
import { PlayerStats } from "../components/PlayerStats";
import { PlayerEquipment } from "../components/PlayerEquipment";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ProfileBannerLayout } from "@/components/shared/ProfileBannerLayout";

const PlayerIdPage = () => {
  const { id } = useParams();
  const { fetchPlayerById, selectedPlayer, isLoading } = usePlayerStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) fetchPlayerById(id, true);
  }, [id, fetchPlayerById]);

  if (isLoading && !selectedPlayer) {
    return <LoadingSpinner />;
  }

  if (!selectedPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40 tracking-[0.5em] font-black text-xl">
        PLAYER PROFILE NOT FOUND...
      </div>
    );
  }

  return (
    <ProfileBannerLayout bannerImage={selectedPlayer.coverImage}>
      {/* Header Component */}
      <PlayerHeader player={selectedPlayer} type="player" />

      {/* Tactical Interface (Tabs) */}
      <div className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl h-auto flex-nowrap shrink-0">
              <TabsTrigger
                value="overview"
                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest hidden sm:inline">Tactical Overview</span>
                  <span className="text-[10px] font-black tracking-widest sm:hidden">Overview</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest hidden sm:inline">Battle Stats</span>
                  <span className="text-[10px] font-black tracking-widest sm:hidden">Stats</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest hidden sm:inline">Commendations</span>
                  <span className="text-[10px] font-black tracking-widest sm:hidden">Honors</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="equipment"
                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest hidden sm:inline">Gear Setup</span>
                  <span className="text-[10px] font-black tracking-widest sm:hidden">Setup</span>
                </div>
              </TabsTrigger>
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
              {activeTab === "overview" && <PlayerOverview player={selectedPlayer} />}
              {activeTab === "stats" && <PlayerStats player={selectedPlayer} />}
              {activeTab === "achievements" && <PlayerAchievements player={selectedPlayer} />}
              {activeTab === "equipment" && <PlayerEquipment player={selectedPlayer} />}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </ProfileBannerLayout>
  );
};

export default PlayerIdPage;
