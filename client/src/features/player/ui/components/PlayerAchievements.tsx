import { Crown, Zap, Flame } from "lucide-react";
import { useHover } from "../../hook/useHover";
import { ProgressBar } from "./PlayerOverview";

export const PlayerAchievements = () => {
  const achievements: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    rarity: "common" | "rare" | "epic" | "legendary";
    unlockedAt: string;
    progress?: number;
    maxProgress?: number;
  }[] = [
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
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((ach) => (
        <AchievementCard key={ach.id} achievement={ach} />
      ))}
    </div>
  );
};

type Rarity = "common" | "rare" | "epic" | "legendary";

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    rarity: "common" | "rare" | "epic" | "legendary";
    unlockedAt: string;
    progress?: number;
    maxProgress?: number;
  };
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const hoverProps = useHover();

  const getRarityConfig = (rarity: Rarity) => {
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
