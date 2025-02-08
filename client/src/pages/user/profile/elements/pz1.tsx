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
  Star as LucideStar,
} from "lucide-react";

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
const Card = ({ children, className = "" }: CardProps) => (
  <div className={`rounded-lg ${className}`}>{children}</div>
);

// Custom Badge Component
const Badge = ({ children, className = "" }: BadgeProps) => (
  <span className={`px-2 py-1 text-sm font-medium rounded-full ${className}`}>
    {children}
  </span>
);

// Custom Tabs Components
const Tabs = ({ children, defaultValue, className = "" }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const content = React.Children.toArray(children).find(
    (child) => child.props.value === activeTab
  );

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        if (child.type === TabsContent && child.props.value === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: TabsListProps) => (
  <div className="flex space-x-1">
    {React.Children.map(children, (child) =>
      React.isValidElement(child) // Use React.isValidElement instead of null check
        ? React.cloneElement(child, {
            isActive: activeTab === child.props.value,
            onClick: () => setActiveTab(child.props.value),
          })
        : null
    )}
  </div>
);

const TabsTrigger = ({
  children,
  value,
  isActive,
  onClick,
}: TabsTriggerProps) => (
  <button
    className={`px-4 py-2 rounded text-sm font-medium transition-colors
      ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
      }`}
    onClick={onClick}
    key={value}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value }: TabsContentProps) => (
  <div className="mt-4" key={value}>
    {children}
  </div>
);

const PlayerProfile = () => {
  return (
    <div className="min-h-screen bg-gray-900/95 text-white p-6">
      {/* Profile Header with Free Fire Theme */}
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-8">
          {/* Banner with Free Fire Theme */}
          <div className="h-64 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="/free-fire-banner.jpg"
              alt="Free Fire Banner"
              className="w-full h-full object-cover"
            />
            {/* Rank Badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
              <img src="/grandmaster-icon.png" alt="Rank" className="w-8 h-8" />
              <span className="font-bold">Grandmaster</span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="absolute -bottom-16 left-8 flex items-end gap-6 z-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-xl">
                <img
                  src="/player-avatar.jpg"
                  alt="Player Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
            </div>
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-white shadow-text">
                DragonSlayer
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-yellow-500/80 px-3 py-1 rounded-full text-sm font-semibold">
                  Pro Player
                </span>
                <span className="bg-purple-500/80 px-3 py-1 rounded-full text-sm font-semibold">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
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

export default PlayerProfile;
