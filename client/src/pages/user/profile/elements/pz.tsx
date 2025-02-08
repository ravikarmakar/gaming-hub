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
  Target,
  Zap,
  Flame,
  Shield,
  CrosshairIcon,
  Clock,
  Crown,
  Sword,
  Map,
  Award,
} from "lucide-react";

// Existing component interfaces remain the same...
// Custom components (Card, Badge, Tabs, etc.) remain the same...

const PlayerProfile = () => {
  // Rest of the component remains exactly the same...
  const [selectedTimeframe, setSelectedTimeframe] = useState("season");

  const timeframes = {
    season: {
      kd: 6.82,
      winRate: 32,
      headshotRate: 68,
      accuracy: 92,
    },
    monthly: {
      kd: 7.15,
      winRate: 35,
      headshotRate: 71,
      accuracy: 94,
    },
    weekly: {
      kd: 8.01,
      winRate: 38,
      headshotRate: 73,
      accuracy: 95,
    },
  };

  const playerDetails = {
    name: "DragonSlayer",
    realName: "Alex 'Dragon' Rodriguez",
    team: "Team Elite Dragons",
    region: "North America",
    playingSince: "2019",
    totalMatches: 15678,
    totalWins: 5234,
    tournamentWins: 23,
    preferredLoadout: {
      primary: "M4A1",
      secondary: "Desert Eagle",
      throwable: "Flashbang",
      armor: "Level 3 Vest",
    },
    achievements: [
      {
        title: "Tournament MVP",
        description: "3x Tournament Most Valuable Player",
        icon: "crown-icon.png",
        rarity: "Legendary",
        progress: 100,
      },
      {
        title: "Survival Expert",
        description: "Survived in top 5 for 1000+ matches",
        icon: "survival-icon.png",
        rarity: "Epic",
        progress: 85,
      },
    ],
    seasonalRanks: [
      { season: "Season 12", rank: "Grandmaster", points: 3200 },
      { season: "Season 11", rank: "Master", points: 2800 },
      { season: "Season 10", rank: "Diamond", points: 2400 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900/95 text-white p-6">
      {/* Existing Profile Header */}
      <div className="max-w-7xl mx-auto">
        {/* ... Existing banner and profile section ... */}

        {/* New Quick Stats Bar */}
        <div className="bg-black/60 backdrop-blur rounded-xl p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{playerDetails.totalMatches}</p>
              <p className="text-xs text-gray-400">Matches</p>
            </div>
            <div className="text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold">
                {playerDetails.tournamentWins}
              </p>
              <p className="text-xs text-gray-400">Tournaments</p>
            </div>
            <div className="text-center">
              <Target className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{playerDetails.totalWins}</p>
              <p className="text-xs text-gray-400">Total Wins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 rounded-full text-sm font-bold">
              {playerDetails.team}
            </span>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-1 rounded-full text-sm font-bold">
              {playerDetails.region}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Enhanced Player Stats */}
          <div className="space-y-6">
            {/* Existing Season Stats with Timeframe Selector */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  Performance Stats
                </h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="bg-black/30 text-sm rounded-lg px-2 py-1"
                >
                  <option value="season">Season</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* ... Existing stat cards with dynamic data ... */}
              </div>
            </div>

            {/* New Combat Style Analysis */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sword className="text-red-500" />
                Combat Style
              </h2>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">Aggression</span>
                    <span className="text-sm font-semibold text-red-500">
                      85%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-black/30">
                    <div className="w-4/5 bg-gradient-to-r from-red-500 to-red-300"></div>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">Tactical</span>
                    <span className="text-sm font-semibold text-blue-500">
                      75%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-black/30">
                    <div className="w-3/4 bg-gradient-to-r from-blue-500 to-blue-300"></div>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">Support</span>
                    <span className="text-sm font-semibold text-green-500">
                      65%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-black/30">
                    <div className="w-2/3 bg-gradient-to-r from-green-500 to-green-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Enhanced Achievements & Loadout */}
          <div className="space-y-6">
            {/* Preferred Loadout Section */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CrosshairIcon className="text-purple-500" />
                Preferred Loadout
              </h2>
              <div className="space-y-4">
                {Object.entries(playerDetails.preferredLoadout).map(
                  ([key, value], index) => (
                    <div
                      key={key}
                      className="bg-black/30 p-4 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-gray-400 capitalize">{key}</span>
                      <span className="font-bold text-white">{value}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Season History */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Season History
              </h2>
              <div className="space-y-4">
                {playerDetails.seasonalRanks.map((season, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{season.season}</h3>
                        <p className="text-sm text-gray-400">{season.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-500">
                          {season.points}
                        </p>
                        <p className="text-xs text-gray-400">Points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Recent Activity */}
          <div className="space-y-6">
            {/* Match History with More Details */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-green-500" />
                Recent Matches
              </h2>
              <div className="space-y-3">
                {[
                  {
                    type: "Ranked Squad",
                    position: "#1",
                    kills: 12,
                    survival: "18:45",
                    damage: 2456,
                    assists: 3,
                    map: "Bermuda",
                  },
                  {
                    type: "Tournament",
                    position: "#1",
                    kills: 15,
                    survival: "21:30",
                    damage: 3100,
                    assists: 5,
                    map: "Kalahari",
                  },
                  {
                    type: "Ranked Solo",
                    position: "#2",
                    kills: 8,
                    survival: "15:20",
                    damage: 1850,
                    assists: 1,
                    map: "Purgatory",
                  },
                ].map((match, index) => (
                  <div
                    key={index}
                    className="bg-black/30 p-4 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm px-2 py-1 rounded bg-gray-700/50">
                        {match.type}
                      </span>
                      <span className="text-sm text-gray-400">{match.map}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Position</p>
                        <p className="font-bold text-yellow-500">
                          {match.position}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Kills</p>
                        <p className="font-bold text-red-500">{match.kills}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Damage</p>
                        <p className="font-bold text-orange-500">
                          {match.damage}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Assists</p>
                        <p className="font-bold text-blue-500">
                          {match.assists}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playing History Timeline */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" />
                Career Milestones
              </h2>
              <div className="space-y-4">
                <div className="relative pl-6 border-l-2 border-gray-700">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-gray-400">2023</p>
                  <p className="font-bold">Won First Major Tournament</p>
                </div>
                <div className="relative pl-6 border-l-2 border-gray-700">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-gray-400">2022</p>
                  <p className="font-bold">Joined Team Elite Dragons</p>
                </div>
                <div className="relative pl-6 border-l-2 border-gray-700">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-green-500"></div>
                  <p className="text-sm text-gray-400">2021</p>
                  <p className="font-bold">Reached Grandmaster Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
