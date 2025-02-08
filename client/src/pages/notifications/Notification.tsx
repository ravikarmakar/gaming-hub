import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

// Mock data
const notifications = [
  {
    id: 1,
    type: "team_request",
    message: 'John Doe wants to join your team "Pro Gamers"',
    time: "2m ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: 2,
    type: "rejection",
    message: 'Your request to join "Elite Squad" was declined',
    time: "1h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elite",
  },
  {
    id: 3,
    type: "tournament",
    message: "New tournament: Winter Championship 2024 is starting soon!",
    time: "3h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament",
  },
];

const suggestedPlayers = [
  {
    id: 1,
    name: "Alex Pro",
    rank: "Diamond",
    game: "Valorant",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    status: "online",
  },
  {
    id: 2,
    name: "Sarah Elite",
    rank: "Master",
    game: "League of Legends",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "in-game",
  },
];

const suggestedTeams = [
  {
    id: 1,
    name: "Phoenix Squad",
    members: 4,
    game: "CS:GO",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Phoenix",
    recruiting: true,
  },
  {
    id: 2,
    name: "Dragon Warriors",
    members: 3,
    game: "Dota 2",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Dragon",
    recruiting: true,
  },
];

const NotificationPage: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 1024 });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1b2e] to-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          {!isMobile && (
            <motion.div
              className="lg:col-span-3"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <nav className="space-y-3">
                <a
                  href="/events"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 transition-all duration-300"
                >
                  <span className="text-purple-400 mr-3">🎮</span>
                  <span className="text-gray-200 font-medium">
                    Latest Events
                  </span>
                </a>
                <a
                  href="/top-players"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300"
                >
                  <span className="text-blue-400 mr-3">👑</span>
                  <span className="text-gray-200 font-medium">Top Players</span>
                </a>
                <a
                  href="/challenges"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-300"
                >
                  <span className="text-red-400 mr-3">⚔️</span>
                  <span className="text-gray-200 font-medium">Challenges</span>
                </a>
                <a
                  href="/tournaments"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300"
                >
                  <span className="text-green-400 mr-3">🏆</span>
                  <span className="text-gray-200 font-medium">Tournaments</span>
                </a>
              </nav>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            className="lg:col-span-6 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Notifications
            </h1>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <img
                      src={notification.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full bg-purple-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 mb-1">
                        {notification.message}
                      </p>
                      <span className="text-sm text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        notification.type === "team_request"
                          ? "bg-green-500"
                          : notification.type === "rejection"
                          ? "bg-red-500"
                          : "bg-purple-500"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Sidebar */}
          {!isMobile && (
            <motion.div
              className="lg:col-span-3 space-y-6"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {/* Suggested Players */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-4">
                <h3 className="text-xl font-semibold mb-4 text-purple-400">
                  Suggested Players
                </h3>
                <div className="space-y-4">
                  {suggestedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
                    >
                      <div className="relative">
                        <img
                          src={player.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full bg-purple-500/20"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                            player.status === "online"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200">
                          {player.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {player.rank} • {player.game}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Teams */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-4">
                <h3 className="text-xl font-semibold mb-4 text-purple-400">
                  Suggested Teams
                </h3>
                <div className="space-y-4">
                  {suggestedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
                    >
                      <img
                        src={team.logo}
                        alt=""
                        className="w-10 h-10 rounded-lg bg-purple-500/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200">{team.name}</p>
                        <p className="text-sm text-gray-400">
                          {team.members} members • {team.game}
                        </p>
                      </div>
                      {team.recruiting && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                          Recruiting
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
