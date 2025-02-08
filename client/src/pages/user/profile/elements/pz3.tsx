import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Trophy,
  Users,
  Globe,
  Activity,
  Gamepad,
  Heart,
  Target,
  Flame,
  Shield,
  Sword,
  Award,
  Crown,
  Crosshair,
  Flag,
  Zap,
  Star,
} from "lucide-react";

const defaultPlayerStats = {
  name: "ShadowStrike",
  title: "The Unstoppable",
  level: 150,
  rank: "Mythical Legend",
  exp: 85,
  totalMatches: 12547,
  winRate: 78,
  killStats: {
    total: 48293,
    headshots: 28976,
    longRange: 12435,
    melee: 1842,
  },
  weaponMastery: [
    { name: "AK47", mastery: 98, kills: 12435 },
    { name: "M416", mastery: 95, kills: 10234 },
    { name: "AWM", mastery: 92, kills: 5632 },
    { name: "Desert Eagle", mastery: 88, kills: 3421 },
  ],
  achievements: [
    { name: "Apex Predator", rarity: "Mythical", progress: 100 },
    { name: "Headshot Master", rarity: "Legendary", progress: 95 },
    { name: "Last One Standing", rarity: "Epic", progress: 85 },
  ],
  specializations: {
    assault: 95,
    sniper: 88,
    support: 75,
    tactics: 92,
  },
};

const performanceData = [
  { month: "Jan", kd: 4.2, winRate: 65, accuracy: 82 },
  { month: "Feb", kd: 4.5, winRate: 68, accuracy: 85 },
  { month: "Mar", kd: 5.1, winRate: 72, accuracy: 87 },
  { month: "Apr", kd: 4.8, winRate: 70, accuracy: 84 },
  { month: "May", kd: 5.3, winRate: 75, accuracy: 89 },
  { month: "Jun", kd: 5.8, winRate: 78, accuracy: 91 },
];

const PlayerProfile = ({ stats = defaultPlayerStats }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAchievement, setShowAchievement] = useState(false);
  const [playerStats, setPlayerStats] = useState(stats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />

          {/* Player Info */}
          <div className="relative p-8 pt-16">
            <div className="flex items-end gap-8">
              {/* Level Ring */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-1">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <div>
                      <p className="text-3xl font-bold text-center">
                        {playerStats.level}
                      </p>
                      <p className="text-xs text-yellow-500">LEVEL</p>
                    </div>
                  </div>
                </div>
                {/* Rank Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3">
                  <Crown className="w-6 h-6" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-bold tracking-tight">
                    {playerStats.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600">
                    {playerStats.rank}
                  </span>
                </div>
                <p className="text-xl text-gray-300 mt-1">
                  {playerStats.title}
                </p>

                {/* Quick Stats */}
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="font-bold">{playerStats.totalMatches}</p>
                    <p className="text-xs text-gray-400">Matches</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="font-bold">{playerStats.killStats.total}</p>
                    <p className="text-xs text-gray-400">Kills</p>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="font-bold">{playerStats.winRate}%</p>
                    <p className="text-xs text-gray-400">Win Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mt-8">
              {["overview", "weapons", "achievements", "history"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                    ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Combat Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sword className="text-red-500" />
                Combat Mastery
              </h2>
              <div className="space-y-6">
                {Object.entries(playerStats.specializations).map(
                  ([skill, value]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold capitalize">
                          {skill}
                        </span>
                        <span className="text-sm font-semibold text-blue-400">
                          {value}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="text-green-500" />
                Performance Trends
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="kd"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Weapon Mastery */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Crosshair className="text-purple-500" />
                Weapon Mastery
              </h2>
              <div className="space-y-6">
                {playerStats.weaponMastery.map((weapon) => (
                  <div key={weapon.name} className="relative">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{weapon.name}</span>
                      <span className="text-sm text-gray-400">
                        {weapon.kills} kills
                      </span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                        style={{ width: `${weapon.mastery}%` }}
                      />
                    </div>
                    <span className="absolute right-0 -bottom-5 text-sm text-purple-400">
                      {weapon.mastery}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Latest Achievements
              </h2>
              <div className="space-y-4">
                {playerStats.achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className="p-4 rounded-lg bg-gradient-to-r from-gray-700/50 to-gray-600/30"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-bold">{achievement.name}</h3>
                        <span
                          className={`text-sm ${
                            achievement.rarity === "Mythical"
                              ? "text-red-400"
                              : achievement.rarity === "Legendary"
                              ? "text-yellow-400"
                              : "text-purple-400"
                          }`}
                        >
                          {achievement.rarity}
                        </span>
                      </div>
                      <Star
                        className={`w-5 h-5 ${
                          achievement.rarity === "Mythical"
                            ? "text-red-400"
                            : achievement.rarity === "Legendary"
                            ? "text-yellow-400"
                            : "text-purple-400"
                        }`}
                      />
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          achievement.rarity === "Mythical"
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : achievement.rarity === "Legendary"
                            ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kill Stats & Recent Activity */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="text-red-500" />
                Kill Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Kills</span>
                    <Target className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {playerStats.killStats.total}
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Headshots</span>
                    <Crosshair className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {playerStats.killStats.headshots}
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Long Range</span>
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {playerStats.killStats.longRange}
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Melee</span>
                    <Sword className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {playerStats.killStats.melee}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="text-yellow-500" />
                  Experience Progress
                </h2>
                <span className="text-sm text-gray-400">
                  Level {playerStats.level}
                </span>
              </div>
              <div className="relative pt-4">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-1000"
                    style={{ width: `${playerStats.exp}%` }}
                  />
                </div>
                <span className="absolute right-0 -top-2 text-sm text-yellow-400">
                  {playerStats.exp}%
                </span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur mt-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-blue-500" />
                Recent Activity
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-500" />
                    <div>
                      <p className="font-semibold">Victory Royale</p>
                      <p className="text-sm text-gray-400">
                        Won match with 15 kills
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="text-purple-500" />
                    <div>
                      <p className="font-semibold">Achievement Unlocked</p>
                      <p className="text-sm text-gray-400">
                        Earned "Headshot Master"
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">5h ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="text-green-500" />
                    <div>
                      <p className="font-semibold">Rank Up</p>
                      <p className="text-sm text-gray-400">
                        Advanced to Mythical Legend
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">1d ago</span>
                </div>
              </div>
            </div>

            {/* Achievement Popup */}
            {showAchievement && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      New Achievement Unlocked!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      You've earned the "Apex Predator" achievement
                    </p>
                    <button
                      onClick={() => setShowAchievement(false)}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Awesome!
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
