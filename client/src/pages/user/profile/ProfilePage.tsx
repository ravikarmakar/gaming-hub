/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Trophy, Target, Shield, Crown, Medal, Flame } from "lucide-react";
import { motion } from "framer-motion";
import ProfileHeader from "./elements/ProfileHeader";
import QuickView from "./elements/QuickView";
import { useParams } from "react-router-dom";
import useUserStore from "@/store/usePlayerStore";
import useAuthStore from "@/store/useAuthStore";
import { User } from "@/types";

// Extended player data
interface PlayerData {
  id: string;
  username: string;
  nickname: string;
  level: number;
  rank: string;
  coverImage: string;
  totalMatches: number;
  avatar: string;
  verified: boolean;
  winRate: number;
  elitePass: string;
  reputation: number;
  status: string;
  killStats: {
    total: number;
    headshots: number;
    longRange: number;
    melee: number;
  };
  stats: {
    kills: number;
    winRate: string;
    kd: string;
    matches: number;
    playTime: string;
    headshots: string;
    accuracy: string;
    survivalRate: string;
    avgDamage: number;
    seasonRank: string;
    currentStreak: number;
  };
  guild: {
    name: string;
    role: string;
    members: number;
    trophies: number;
    ranking: string;
  };
  loadout: {
    favorite: {
      weapon: string;
      character: string;
      pet: string;
      vehicle: string;
    };
    characters: Array<{
      name: string;
      level: number;
      skill: string;
    }>;
  };
  achievements: {
    total: number;
    featured: string;
    recent: Array<{
      name: string;
      description: string;
      date: string;
    }>;
    badges: Array<{
      name: string;
      rarity: string;
    }>;
  };
  tournaments: {
    participated: number;
    won: number;
    history: Array<{
      name: string;
      position: string;
      prize: string;
      date: string;
      kills: number;
      matches: number;
    }>;
  };
  highlights: Array<{
    title: string;
    thumbnail: string;
    views: string;
    date: string;
  }>;
}

interface TabButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  show: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

interface StatBarProps {
  label: string;
  value: string;
  maxValue: string;
}

interface SectionProps {
  playerData: PlayerData;
}

const playerData: PlayerData = {
  id: "FF_123456",
  username: "DragonSlayer",
  nickname: "Shadow",
  level: 75,
  rank: "Heroic",
  totalMatches: 12547,
  winRate: 78,
  killStats: {
    total: 48293,
    headshots: 28976,
    longRange: 12435,
    melee: 1842,
  },
  coverImage: "/api/placeholder/1200/400",
  avatar: "/api/placeholder/200/200",
  verified: true,
  elitePass: "MAX",
  reputation: 9800,
  status: "online",
  stats: {
    kills: 15420,
    winRate: "68%",
    kd: "4.2",
    matches: 3500,
    playTime: "2000h+",
    headshots: "32%",
    accuracy: "75%",
    survivalRate: "45%",
    avgDamage: 1250,
    seasonRank: "Grandmaster",
    currentStreak: 8,
  },
  guild: {
    name: "Phoenix Elite",
    role: "Guild Leader",
    members: 48,
    trophies: 25000,
    ranking: "#3 Regional",
  },
  loadout: {
    favorite: {
      weapon: "AK47",
      character: "Alok",
      pet: "Spirit Fox",
      vehicle: "Monster Truck",
    },
    characters: [
      { name: "Alok", level: 20, skill: "Drop the Beat" },
      { name: "Chrono", level: 18, skill: "Time Turner" },
      { name: "K", level: 15, skill: "Master of All" },
    ],
  },
  achievements: {
    total: 145,
    featured: "Season 25 Grandmaster",
    recent: [
      {
        name: "Unstoppable",
        description: "Win 10 matches in a row",
        date: "2024-01-15",
      },
      {
        name: "Sharpshooter",
        description: "100 headshots in a single match",
        date: "2024-01-10",
      },
      {
        name: "Last Man Standing",
        description: "Win a match solo vs squad",
        date: "2024-01-05",
      },
    ],
    badges: [
      { name: "Pro Player", rarity: "Legendary" },
      { name: "Squad Leader", rarity: "Epic" },
      { name: "Marksman", rarity: "Rare" },
    ],
  },
  tournaments: {
    participated: 35,
    won: 12,
    history: [
      {
        name: "Free Fire World Series 2024",
        position: "1st",
        prize: "$50,000",
        date: "2024-01-20",
        kills: 45,
        matches: 12,
      },
      {
        name: "Regional Championship",
        position: "2nd",
        prize: "$25,000",
        date: "2023-12-15",
        kills: 38,
        matches: 10,
      },
    ],
  },
  highlights: [
    {
      title: "Epic 1v4 Clutch",
      thumbnail: "/api/placeholder/300/200",
      views: "1.2M",
      date: "2024-01-18",
    },
    {
      title: "20 Kills Solo Match",
      thumbnail: "/api/placeholder/300/200",
      views: "958K",
      date: "2024-01-15",
    },
  ],
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<User | null>(null);

  const { getOneUser, selectedUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      getOneUser(id);
    } else {
      setProfileData(user);
    }
  }, [id, getOneUser, user]);

  useEffect(() => {
    if (id && selectedUser) {
      setProfileData(selectedUser);
    }
  }, [selectedUser]);

  const isOwnProfile = user?._id === profileData?._id;

  console.log(isOwnProfile);

  if (!profileData)
    return (
      <p className="h-screen flex justify-center items-center">
        Loading user data...
      </p>
    );

  return (
    <section className="relative w-full bg-[#0A0A1F]">
      {/* Animated Background Gradients */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </motion.div>

      <div className="relative w-full">
        {/* Profile Header */}
        <ProfileHeader user={profileData} />

        {/* Quick Views */}
        <QuickView />

        {/* Navigation Tabs */}
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="sticky top-[64px] z-40 bg-[#0A0A1F]/80 backdrop-blur-lg border-b border-white/10 w-full"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-4 overflow-x-auto scrollbar-none">
              <TabButton
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </TabButton>
              <TabButton
                active={activeTab === "statistics"}
                onClick={() => setActiveTab("statistics")}
              >
                Statistics
              </TabButton>
              <TabButton
                active={activeTab === "loadout"}
                onClick={() => setActiveTab("loadout")}
              >
                Loadout
              </TabButton>
              <TabButton
                active={activeTab === "achievements"}
                onClick={() => setActiveTab("achievements")}
              >
                Achievements
              </TabButton>
              <TabButton
                active={activeTab === "tournaments"}
                onClick={() => setActiveTab("tournaments")}
              >
                Tournaments
              </TabButton>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <AnimatedSection show={activeTab === "overview"}>
            <Overview playerData={playerData} />
          </AnimatedSection>

          <AnimatedSection show={activeTab === "statistics"}>
            <Statistics playerData={playerData} />
          </AnimatedSection>

          <AnimatedSection show={activeTab === "loadout"}>
            <Loadout playerData={playerData} />
          </AnimatedSection>

          <AnimatedSection show={activeTab === "achievements"}>
            <Achievements playerData={playerData} />
          </AnimatedSection>

          <AnimatedSection show={activeTab === "tournaments"}>
            <Tournaments playerData={playerData} />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

// Tab Button Component
const TabButton: React.FC<TabButtonProps> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-sm font-medium transition-colors relative
      ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
      />
    )}
  </button>
);

// Animated Section Component
const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  show,
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Overview Section
const Overview: React.FC<SectionProps> = ({ playerData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <motion.div
      variants={itemVariants}
      className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Current Season</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Crown className="text-yellow-400" />}
          label="Rank"
          value={playerData.stats.seasonRank}
        />
        <StatCard
          icon={<Flame className="text-orange-400" />}
          label="Win Streak"
          value={playerData.stats.currentStreak}
        />
        <StatCard
          icon={<Target className="text-red-400" />}
          label="Avg Damage"
          value={playerData.stats.avgDamage}
        />
        <StatCard
          icon={<Shield className="text-blue-400" />}
          label="Survival Rate"
          value={playerData.stats.survivalRate}
        />
      </div>
    </motion.div>

    {/* Recent Highlights */}
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Recent Highlights</h3>
      <div className="space-y-4">
        {playerData.highlights.map((highlight, index) => (
          <div
            key={index}
            className="relative group rounded-lg overflow-hidden"
          >
            <img
              src={highlight.thumbnail}
              alt={highlight.title}
              className="w-full h-48 object-cover transform transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
              <h4 className="text-white font-medium">{highlight.title}</h4>
              <p className="text-gray-300 text-sm">{highlight.views} views</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Guild Information */}
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Guild</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Name</span>
          <span className="text-white font-medium">
            {playerData.guild.name}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Role</span>
          <span className="text-white font-medium">
            {playerData.guild.role}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Ranking</span>
          <span className="text-white font-medium">
            {playerData.guild.ranking}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Members</span>
          <span className="text-white font-medium">
            {playerData.guild.members}/50
          </span>
        </div>
      </div>
    </motion.div>
  </div>
);

// Statistics Section
const Statistics: React.FC<SectionProps> = ({ playerData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Combat Stats */}
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Combat Statistics</h3>
      <div className="space-y-4">
        <StatBar label="K/D Ratio" value={playerData.stats.kd} maxValue="5.0" />
        <StatBar
          label="Headshot Rate"
          value={playerData.stats.headshots}
          maxValue="100%"
        />
        <StatBar
          label="Accuracy"
          value={playerData.stats.accuracy}
          maxValue="100%"
        />
        <StatBar
          label="Survival Rate"
          value={playerData.stats.survivalRate}
          maxValue="100%"
        />
      </div>
    </motion.div>

    {/* Match History Graph */}
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Performance Trend</h3>
      {/* Add a graph component here */}
      <div className="h-64 flex items-center justify-center text-gray-400">
        Performance Graph Placeholder
      </div>
    </motion.div>
  </div>
);

// Loadout Section
const Loadout: React.FC<SectionProps> = ({ playerData }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {playerData.loadout.characters.map((character, index) => (
      <motion.div
        key={index}
        variants={itemVariants}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-xl font-bold mb-4 text-white">{character.name}</h3>
        <div className="space-y-4">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src="/api/placeholder/300/200"
              alt={character.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white">Level {character.level}</p>
              <p className="text-sm text-gray-300">{character.skill}</p>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// Achievements Section
const Achievements: React.FC<SectionProps> = ({ playerData }) => (
  <div className="space-y-6">
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Recent Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playerData.achievements.recent.map((achievement, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">{achievement.name}</h4>
                <p className="text-sm text-gray-400">
                  {achievement.description}
                </p>
                <p className="text-sm text-gray-500 mt-2">{achievement.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Badges</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {playerData.achievements.badges.map((badge, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-white/5 border border-white/10 text-center"
          >
            <Medal className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h4 className="font-medium text-white">{badge.name}</h4>
            <p className="text-sm text-gray-400">{badge.rarity}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

// Utility Components
const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center p-4 rounded-lg bg-white/5 border border-white/10">
    <div className="mb-2">{icon}</div>
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-white font-bold text-lg">{value}</p>
  </div>
);

const StatBar: React.FC<StatBarProps> = ({ label, value, maxValue }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        style={{
          width: `${(parseFloat(value) / parseFloat(maxValue)) * 100}%`,
        }}
      />
    </div>
  </div>
);

// Tournaments Section
const Tournaments: React.FC<SectionProps> = ({ playerData }) => (
  <div className="space-y-6">
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4 text-white">Tournament History</h3>
      <div className="space-y-4">
        {playerData.tournaments.history.map((tournament, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white">{tournament.name}</h4>
                <p className="text-sm text-gray-400">
                  Position: {tournament.position}
                </p>
                <p className="text-sm text-gray-400">
                  Prize: {tournament.prize}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {tournament.kills} kills
                </p>
                <p className="text-sm text-gray-400">
                  {tournament.matches} matches
                </p>
                <p className="text-sm text-gray-500">{tournament.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default ProfilePage;
