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
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Animated Banner */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1200/400')] opacity-30 hover:opacity-40 transition-opacity" />
          </div>

          {/* Profile Header */}
          <div className="relative px-6 pb-6">
            {/* Avatar with Glow Effect */}
            <div className="absolute -top-16 left-6">
              <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-900 overflow-hidden shadow-lg hover:shadow-blue-500/50 transition-shadow">
                <img
                  src="/api/placeholder/128/128"
                  alt="Player avatar"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Player Details with Social Actions */}
            <div className="pt-20">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">NightPhoenix</h1>
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Pro Player
                    </Badge>
                  </div>
                  <p className="text-gray-400 mt-2">
                    Professional Valorant Player | Team Phoenix Elite
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      isFollowing
                        ? "bg-gray-700 hover:bg-gray-600"
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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="history">Event History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Player Info Card */}
              <Card className="bg-gray-800/50 backdrop-blur hover:bg-gray-800 transition-colors p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Player Info
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span>Region: Asia Pacific</span>
                  </div>
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>Team: Phoenix Elite</span>
                  </div>
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>Active Since: 2020</span>
                  </div>
                </div>
              </Card>

              {/* Stats Card */}
              <Card className="bg-gray-800/50 backdrop-blur hover:bg-gray-800 transition-colors p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Performance
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-700/50 rounded transition-colors">
                    <span>Win Rate</span>
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                      68%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-700/50 rounded transition-colors">
                    <span>K/D Ratio</span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      1.85
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-700/50 rounded transition-colors">
                    <span>Headshot %</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                      42%
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-gray-800/50 backdrop-blur hover:bg-gray-800 transition-colors p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Recent Achievements
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Medal className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1">
                      <p className="font-medium">APAC Championship 2024</p>
                      <p className="text-sm text-gray-400">1st Place</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1">
                      <p className="font-medium">MVP - Spring Season</p>
                      <p className="text-sm text-gray-400">Tournament MVP</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Game Roles & Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-gray-800/50 backdrop-blur hover:bg-gray-800 transition-colors p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Gamepad className="w-5 h-5 text-blue-400" />
                  Main Roles
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-colors cursor-pointer">
                    Duelist
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-colors cursor-pointer">
                    Initiator
                  </Badge>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-colors cursor-pointer">
                    Flex
                  </Badge>
                </div>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur hover:bg-gray-800 transition-colors p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-400" />
                  Gaming Setup
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <span>240Hz Gaming Monitor</span>
                  </div>
                  <div className="flex items-center gap-3 hover:bg-gray-700/50 p-2 rounded transition-colors">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <span>Custom Gaming PC</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <Card className="bg-gray-800/50 p-6">
              <h2 className="text-xl font-bold mb-4">Detailed Statistics</h2>
              <p className="text-gray-400">
                Detailed statistics content coming soon...
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-gray-800/50 p-6">
              <h2 className="text-xl font-bold mb-4">All Achievements</h2>
              <p className="text-gray-400">
                Full achievements list coming soon...
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <Card className="bg-gray-800/50 p-6">
              <h2 className="text-xl font-bold mb-4">Complete Setup Details</h2>
              <p className="text-gray-400">
                Detailed setup information coming soon...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfile;
