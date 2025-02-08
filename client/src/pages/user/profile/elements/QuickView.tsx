import { LucideIcon } from "@/components/LucideIcon";
import {
  Trophy,
  Users,
  Medal,
  Gamepad,
  Activity,
  Globe,
  Heart,
  MessageCircle,
} from "lucide-react";

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

const QuickView = () => {
  return (
    <div className="">
      <div className="flex gap-6 mt-4 justify-center">
        <div className="text-center">
          <LucideIcon
            icon="Flame"
            className="w-5 h-5 text-orange-500 mx-auto mb-1"
          />
          <p className="font-bold">{playerData.totalMatches}</p>
          <p className="text-xs text-gray-400">Matches</p>
        </div>

        <div className="text-center">
          <LucideIcon
            icon="Target"
            className="w-5 h-5 text-red-500 mx-auto mb-1"
          />
          <p className="font-bold">{playerData.killStats.total}</p>
          <p className="text-xs text-gray-400">Kills</p>
        </div>
        <div className="text-center">
          <LucideIcon
            icon="Trophy"
            className="w-5 h-5 text-yellow-500 mx-auto mb-1"
          />
          <p className="font-bold">{playerData.winRate}%</p>
          <p className="text-xs text-gray-400">Win Rate</p>
        </div>
      </div>

      {/* Quick Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Player Stats */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Season Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">K/D Ratio</p>
                  <p className="text-2xl font-bold text-yellow-500">6.82</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-green-500">32%</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Headshot Rate</p>
                  <p className="text-2xl font-bold text-red-500">68%</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Accuracy</p>
                  <p className="text-2xl font-bold text-blue-500">92%</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-blue-500" />
                Squad Performance
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Squad Wins</span>
                  <span className="text-green-500 font-bold">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Squad Kills</span>
                  <span className="text-red-500 font-bold">8,567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>MVP Rate</span>
                  <span className="text-yellow-500 font-bold">45%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Achievements & Weapons */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Medal className="text-yellow-500" />
                Top Achievements
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-600/40 to-yellow-500/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src="/achievement-1.png"
                      alt="Achievement"
                      className="w-12 h-12"
                    />
                    <div>
                      <h3 className="font-bold">Booyah Master</h3>
                      <p className="text-sm text-gray-300">Won 1000+ matches</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-600/40 to-purple-500/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src="/achievement-2.png"
                      alt="Achievement"
                      className="w-12 h-12"
                    />
                    <div>
                      <h3 className="font-bold">Headshot King</h3>
                      <p className="text-sm text-gray-300">10,000+ headshots</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-600/40 to-blue-500/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src="/achievement-3.png"
                      alt="Achievement"
                      className="w-12 h-12"
                    />
                    <div>
                      <h3 className="font-bold">Elite Squad</h3>
                      <p className="text-sm text-gray-300">
                        Top 100 Squad Leader
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gamepad className="text-red-500" />
                Favorite Weapons
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src="/weapon-1.png" alt="M4A1" className="w-12 h-12" />
                    <div>
                      <h3 className="font-bold">M4A1</h3>
                      <div className="flex gap-2 text-sm">
                        <span className="text-green-500">92% Accuracy</span>
                        <span className="text-red-500">1,234 Kills</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src="/weapon-2.png" alt="AWM" className="w-12 h-12" />
                    <div>
                      <h3 className="font-bold">AWM</h3>
                      <div className="flex gap-2 text-sm">
                        <span className="text-green-500">95% Accuracy</span>
                        <span className="text-red-500">867 Kills</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Matches & Social */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-green-500" />
                Recent Matches
              </h2>
              <div className="space-y-3">
                {[
                  {
                    type: "Squad",
                    position: "#1",
                    kills: 12,
                    survival: "18:45",
                  },
                  { type: "Solo", position: "#1", kills: 8, survival: "15:20" },
                  {
                    type: "Squad",
                    position: "#2",
                    kills: 9,
                    survival: "16:30",
                  },
                ].map((match, index) => (
                  <div key={index} className="bg-black/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-300">
                          {match.type}
                        </span>
                        <p className="font-bold text-yellow-500">
                          {match.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-300">Kills</span>
                        <p className="font-bold text-red-500">{match.kills}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-300">Time</span>
                        <p className="font-bold text-blue-500">
                          {match.survival}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="text-purple-500" />
                Social Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">25.6K</p>
                  <p className="text-sm text-gray-300">Followers</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">1.2K</p>
                  <p className="text-sm text-gray-300">Comments</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
                Follow Player
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;
