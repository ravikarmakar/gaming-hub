import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, BarChart3, User, Settings } from "lucide-react";

import { TabContent, Tabs } from "@/components/Tab";

import { PlayerHeader } from "../components/PlayerHeader";
import { usePlayerStore } from "../../store/usePlayerStore";
import { PlayerOverview } from "../components/PlayerOverview";
import { PlayerAchievements } from "../components/PlayerAchievements";
import { PlayerStats } from "../components/PlayerStats";
import { PlayerEquipment } from "../components/PlayerEquipment";
import { Button } from "@/components/ui/button";

const PlayerIdPage = () => {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState<string>("overview");

  console.log("Player ID:", id);

  const { fetchPlayerById, selectedPlayer } = usePlayerStore();

  useEffect(() => {
    if (id) fetchPlayerById(id);
  }, [id, fetchPlayerById]);

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <User className="w-4 h-4" />,
      content: <PlayerOverview />,
    },
    {
      id: "stats",
      label: "Game Stats",
      icon: <BarChart3 className="w-4 h-4" />,
      content: <PlayerStats />,
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: <Award className="w-4 h-4" />,
      content: <PlayerAchievements />,
    },
    {
      id: "equipment",
      label: "Setup",
      icon: <Settings className="w-4 h-4" />,
      content: <PlayerEquipment />,
    },
  ];

  const playerCoverImg =
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Enhanced Banner Section */}
      <div className="relative h-64 overflow-hidden md:h-80 rounded-xl">
        <img
          src={playerCoverImg}
          alt="Banner"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
      </div>

      {selectedPlayer && <PlayerHeader player={selectedPlayer} type="player" />}

      <Button>Create Team</Button>

      <div className="px-4 mx-auto mb-8 overflow-x-auto max-w-7xl sm:px-6 lg:px-8">
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <TabContent motionKey={activeTab}>
          {tabItems.find((tab) => tab.id === activeTab)?.content}
        </TabContent>
      </div>
    </div>
  );
};

export default PlayerIdPage;
