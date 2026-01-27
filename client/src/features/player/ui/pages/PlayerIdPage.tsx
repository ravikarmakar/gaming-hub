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
      <div className="min-h-screen flex items-center justify-center text-white/40 italic">
        PLAYER DOSSIER NOT FOUND...
      </div>
    );
  }

  const playerCoverImg = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-800/20 blur-[120px] rounded-full animate-pulse duration-[15000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-800/20 blur-[120px] rounded-full animate-pulse duration-[18000ms]" />
        <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] bg-blue-800/10 blur-[100px] rounded-full animate-pulse duration-[25000ms]" />
      </div>

      {/* Banner Section */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          src={playerCoverImg}
          alt="Campaign Background"
          className="object-cover w-full h-full opacity-40 grayscale-[0.5]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 space-y-12">
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
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Tactical Overview</span>
                    <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Overview</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Battle Stats</span>
                    <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Stats</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Commendations</span>
                    <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Honors</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Gear Setup</span>
                    <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Setup</span>
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
                {activeTab === "overview" && <PlayerOverview />}
                {activeTab === "stats" && <PlayerStats />}
                {activeTab === "achievements" && <PlayerAchievements />}
                {activeTab === "equipment" && <PlayerEquipment />}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlayerIdPage;
