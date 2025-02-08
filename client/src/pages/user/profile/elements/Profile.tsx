import React, { useState } from "react";
import {
  Trophy,
  Users,
  Monitor,
  Star,
  Globe,
  Calendar,
  Activity,
  Gamepad,
  Share2,
  Medal,
  ChevronRight,
  Heart,
  MessageCircle,
  Crosshair,
  Target,
  Award,
  Zap,
  Clock,
  Flag,
} from "lucide-react";

// Player Profile Interfaces
interface SocialMedia {
  platform: string;
  username: string;
  url: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface GameStats {
  gameName: string;
  rank: string;
  winRate: number;
  kdRatio: number;
  totalMatches: number;
  favoriteWeapon: string;
  playTime: string;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  position: string;
  prizePool: string;
}

interface PlayerProfile {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bannerImage: string;
  status: "online" | "offline" | "in-game";
  verified: boolean;
  level: number;
  xp: number;
  rank: string;
  team: {
    name: string;
    role: string;
    joinDate: string;
  };
  bio: string;
  country: string;
  joinDate: string;
  socialMedia: SocialMedia[];
  achievements: Achievement[];
  statistics: {
    totalWins: number;
    tournamentsWon: number;
    totalPrizeEarned: string;
    gamesPlayed: number;
    gameStats: GameStats[];
  };
  recentTournaments: Tournament[];
  highlights: {
    title: string;
    url: string;
    thumbnail: string;
  }[];
  setup: {
    category: string;
    items: { name: string; detail: string }[];
  }[];
}

// Mock Player Data
const mockPlayerData: PlayerProfile = {
  id: "player123",
  username: "NightPhoenix",
  fullName: "Alex Rodriguez",
  avatar: "/api/placeholder/128/128",
  bannerImage: "/api/placeholder/1200/400",
  status: "online",
  verified: true,
  level: 150,
  xp: 1500000,
  rank: "Radiant",
  team: {
    name: "Phoenix Elite",
    role: "Team Captain",
    joinDate: "2023-01-15",
  },
  bio: "Professional Valorant player | 3x Tournament Champion | Sponsored by ROG",
  country: "United States",
  joinDate: "2020-03-15",
  socialMedia: [
    {
      platform: "Twitch",
      username: "NightPhoenix_TV",
      url: "https://twitch.tv/nightphoenix",
    },
    {
      platform: "Twitter",
      username: "@NightPhoenix",
      url: "https://twitter.com/nightphoenix",
    },
    {
      platform: "YouTube",
      username: "NightPhoenix Gaming",
      url: "https://youtube.com/nightphoenix",
    },
  ],
  achievements: [
    {
      id: "ach1",
      title: "VALORANT Champions 2024",
      description: "First Place - International Championship",
      date: "2024-12-15",
      icon: "trophy",
    },
    {
      id: "ach2",
      title: "Regional MVP",
      description: "Most Valuable Player - NA Region",
      date: "2024-08-20",
      icon: "medal",
    },
    {
      id: "ach3",
      title: "Perfect Ace",
      description: "100 Ace rounds achieved",
      date: "2024-06-10",
      icon: "star",
    },
  ],
  statistics: {
    totalWins: 1200,
    tournamentsWon: 15,
    totalPrizeEarned: "$500,000",
    gamesPlayed: 2000,
    gameStats: [
      {
        gameName: "Valorant",
        rank: "Radiant",
        winRate: 68,
        kdRatio: 1.85,
        totalMatches: 1500,
        favoriteWeapon: "Vandal",
        playTime: "2000h",
      },
    ],
  },
  recentTournaments: [
    {
      id: "t1",
      name: "VCT Americas 2024",
      date: "2024-12-01",
      position: "1st",
      prizePool: "$100,000",
    },
    {
      id: "t2",
      name: "ESL Pro League Season 20",
      date: "2024-11-15",
      position: "2nd",
      prizePool: "$50,000",
    },
  ],
  highlights: [
    {
      title: "Ace Clutch - VCT Finals",
      url: "https://youtube.com/watch?v=123",
      thumbnail: "/highlights/1.jpg",
    },
    {
      title: "Best Plays 2024",
      url: "https://youtube.com/watch?v=456",
      thumbnail: "/highlights/2.jpg",
    },
  ],
  setup: [
    {
      category: "Hardware",
      items: [
        { name: "Monitor", detail: "ASUS ROG Swift 360Hz" },
        { name: "Mouse", detail: "Logitech G Pro X Superlight" },
        { name: "Keyboard", detail: "Custom Mechanical KB - Red Switches" },
      ],
    },
    {
      category: "Settings",
      items: [
        { name: "DPI", detail: "800" },
        { name: "Sensitivity", detail: "0.35" },
        {
          name: "Crosshair Code",
          detail: "0;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0",
        },
      ],
    },
  ],
};

// Types for custom components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  isActive?: boolean;
  onClick?: () => void;
}

// Custom Card Component
function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg shadow-md transition-transform transform hover:scale-105 ${className}`}
    >
      {children}
    </div>
  );
}

// Custom Badge Component
function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

// Custom Tabs Components
function Tabs({ children, defaultValue, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={`tabs ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          activeTab,
          setActiveTab,
        })
      )}
    </div>
  );
}

function TabsList({ children, activeTab, setActiveTab }: TabsListProps) {
  return (
    <div className="flex border-b border-gray-700">
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          isActive: child.props.value === activeTab,
          onClick: () => setActiveTab && setActiveTab(child.props.value),
        })
      )}
    </div>
  );
}

function TabsTrigger({ children, value, isActive, onClick }: TabsTriggerProps) {
  return (
    <button
      className={`px-4 py-2 -mb-px font-medium transition-colors duration-300 ${
        isActive ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TabsContent({ children, value }: TabsContentProps) {
  return <div>{children}</div>;
}

const PlayerProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const player = mockPlayerData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative h-80">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <img
            src={player.bannerImage}
            alt="Profile Banner"
            className="w-full h-full object-cover opacity-40 transition-opacity duration-300"
          />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden ring-4 ring-blue-500/30">
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                />
                <div
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${
                    player.status === "online"
                      ? "bg-green-500"
                      : player.status === "in-game"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  } ring-2 ring-gray-900`}
                />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{player.username}</h1>
                {player.verified && (
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/50">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Verified Pro
                    </span>
                  </Badge>
                )}
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Level {player.level}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {player.team.name} • {player.team.role}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {player.country}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(player.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                  isFollowing
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFollowing ? "text-red-400" : "text-white"
                  }`}
                />
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Stats Overview */}
              <Card className="bg-gray-800/50 backdrop-blur p-6 col-span-2">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Performance Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 transform hover:scale-105 transition-transform">
                    <div className="text-gray-400 text-sm mb-1">
                      Total Matches
                    </div>
                    <div className="text-2xl font-bold">
                      {player.statistics.gamesPlayed}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 transform hover:scale-105 transition-transform">
                    <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                    <div className="text-2xl font-bold">
                      {player.statistics.gameStats[0].winRate}%
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 transform hover:scale-105 transition-transform">
                    <div className="text-gray-400 text-sm mb-1">K/D Ratio</div>
                    <div className="text-2xl font-bold">
                      {player.statistics.gameStats[0].kdRatio}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 transform hover:scale-105 transition-transform">
                    <div className="text-gray-400 text-sm mb-1">Play Time</div>
                    <div className="text-2xl font-bold">
                      {player.statistics.gameStats[0].playTime}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-gray-800/50 backdrop-blur p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Recent Achievements
                </h2>
                <div className="space-y-4">
                  {player.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="font-semibold">{achievement.title}</div>
                        <div className="text-sm text-gray-400">
                          {achievement.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Setup Overview */}
              <Card className="bg-gray-800/50 backdrop-blur p-6 col-span-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-400" />
                  Gaming Setup
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {player.setup.map((category) => (
                    <div key={category.category}>
                      <h3 className="font-semibold text-gray-300 mb-2">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between bg-gray-700/30 p-2 rounded hover:bg-gray-700/50 transition-colors"
                          >
                            <span className="text-gray-400">{item.name}</span>
                            <span className="text-sm">{item.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social Links */}
              <Card className="bg-gray-800/50 backdrop-blur p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Social Media
                </h2>
                <div className="space-y-3">
                  {player.socialMedia.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="font-medium">{social.platform}</span>
                      <span className="text-gray-400">{social.username}</span>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="bg-gray-800/50 backdrop-blur p-6">
                <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
                {player.statistics.gameStats.map((stat) => (
                  <div key={stat.gameName} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Rank</span>
                      <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-400">
                        {stat.rank}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Win Rate</span>
                      <span>{stat.winRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>K/D Ratio</span>
                      <span>{stat.kdRatio}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Matches</span>
                      <span>{stat.totalMatches}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Favorite Weapon</span>
                      <span>{stat.favoriteWeapon}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {player.achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="bg-gray-800/50 backdrop-blur p-6 transform hover:scale-105 transition-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      <p className="text-gray-400 mt-1">
                        {achievement.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tournaments">
            <div className="space-y-6 mt-6">
              {player.recentTournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="bg-gray-800/50 backdrop-blur p-6 transform hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{tournament.name}</h3>
                      <p className="text-gray-400">
                        {new Date(tournament.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`${
                          tournament.position === "1st"
                            ? "bg-yellow-500"
                            : tournament.position === "2nd"
                            ? "bg-gray-400"
                            : "bg-orange-700"
                        }`}
                      >
                        {tournament.position}
                      </Badge>
                      <span className="text-green-400">
                        {tournament.prizePool}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {player.setup.map((category) => (
                <Card
                  key={category.category}
                  className="bg-gray-800/50 backdrop-blur p-6"
                >
                  <h3 className="text-xl font-bold mb-4">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfile;
