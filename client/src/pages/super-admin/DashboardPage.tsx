import {
  Users,
  DollarSign,
  Star,
  Activity,
  Zap,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

// Define color palette
const colors = {
  darkBg: "#0F0F13",
  darkerBg: "#09090D",
  purple: {
    primary: "#9333EA", // Purple-600
    light: "#A855F7", // Purple-500
    lighter: "#C084FC", // Purple-400
    dark: "#7E22CE", // Purple-700
    darker: "#581C87", // Purple-900
  },
  text: {
    primary: "#F9FAFB", // Gray-50
    secondary: "#9CA3AF", // Gray-400
  },
};

export default function AdminDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
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

  // Mock data
  const statsData = [
    {
      title: "Total Users",
      value: "38,492",
      change: "+12%",
      icon: <Users size={20} />,
      color: colors.purple.light,
    },
    {
      title: "Revenue",
      value: "$125,430",
      change: "+18%",
      icon: <DollarSign size={20} />,
      color: colors.purple.primary,
    },
    {
      title: "Active Games",
      value: "843",
      change: "+7%",
      icon: <Zap size={20} />,
      color: colors.purple.lighter,
    },
    {
      title: "Reports",
      value: "28",
      change: "-4%",
      icon: <AlertCircle size={20} />,
      color: colors.purple.dark,
    },
  ];

  const recentUsers = [
    { id: 1, name: "Alex Johnson", level: 42, spent: "$432", status: "online" },
    {
      id: 2,
      name: "Sarah Wilson",
      level: 36,
      spent: "$286",
      status: "offline",
    },
    { id: 3, name: "Mike Zhang", level: 51, spent: "$621", status: "online" },
    { id: 4, name: "Jamie Lee", level: 28, spent: "$125", status: "online" },
  ];

  const popularGames = [
    { id: 1, name: "Cyberpunk Adventures", players: 15420, rating: 4.8 },
    { id: 2, name: "Stellar Conquest", players: 12853, rating: 4.6 },
    { id: 3, name: "Mythic Realms", players: 9876, rating: 4.9 },
    { id: 4, name: "Dragon Legends", players: 8532, rating: 4.5 },
  ];

  return (
    <div className="h-screen text-gray-100">
      {/* Main content area */}
      <main className="p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Dashboard Overview
            </h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Weekly
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium bg-purple-700 rounded-lg hover:bg-purple-600"
              >
                Generate Report
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-gray-800 border border-gray-700 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">
                      {stat.value}
                    </h3>
                    <p
                      className={`text-sm mt-2 ${
                        stat.change.includes("+")
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stat.change} from last month
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${stat.color}30` }}
                  >
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts and Tables Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Activity Chart */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  User Activity
                </h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-400">This Month</span>
                  <span className="inline-block w-3 h-3 ml-3 bg-gray-500 rounded-full"></span>
                  <span className="text-gray-400">Last Month</span>
                </div>
              </div>
              <div className="flex items-end justify-between h-64 px-2">
                {[35, 55, 45, 65, 50, 70, 60, 75, 55, 80, 65, 90].map(
                  (height, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{
                          duration: 1,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                        className="w-5 bg-purple-600 rounded-t-sm bg-opacity-80"
                      />
                      <span className="mt-1 text-xs text-gray-500">
                        {i + 1}
                      </span>
                    </div>
                  )
                )}
              </div>
            </motion.div>

            {/* Popular Games */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Popular Games
                </h3>
                <button className="text-sm text-purple-400 hover:text-purple-300">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {popularGames.map((game) => (
                  <div key={game.id} className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 text-purple-300 bg-purple-900 rounded">
                      <Star size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">
                        {game.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">
                          {game.players.toLocaleString()} players
                        </span>
                        <div className="flex items-center ml-3">
                          <Star size={12} className="text-yellow-400" />
                          <span className="ml-1 text-xs text-gray-400">
                            {game.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Users */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-gray-800 border border-gray-700 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Users</h3>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View All Users
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700 bg-opacity-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 rounded-l-lg">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Total Spent
                    </th>
                    <th scope="col" className="px-6 py-3 rounded-r-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="flex items-center px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-purple-700 rounded-full">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">
                          {user.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Activity
                            size={14}
                            className="mr-2 text-purple-400"
                          />
                          <span>Level {user.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{user.spent}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "online"
                              ? "bg-green-900 text-green-300"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
