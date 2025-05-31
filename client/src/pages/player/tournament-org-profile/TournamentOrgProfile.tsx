import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Globe,
  Calendar,
  // Clock,
  Award,
  Target,
  BarChart,
} from "lucide-react";

const TournamentOrgProfile = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="relative mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Organization Logo */}
          <motion.div
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl font-bold">TE</span>
          </motion.div>

          <h1 className="text-4xl font-bold mb-2">Tournament Elite</h1>
          <div className="flex items-center justify-center gap-4 text-gray-400 mb-4">
            <span className="bg-blue-500 px-3 py-1 rounded-full text-sm text-white">
              Premier
            </span>
            <span className="flex items-center">
              <Globe className="w-4 h-4 mr-1" /> Global
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" /> 50K+ Players
            </span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">
              Tournaments Hosted
            </h3>
            <div className="text-3xl font-bold">124</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">
              Total Prize Pool
            </h3>
            <div className="text-3xl font-bold">$250K</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-green-400">
              Teams Participated
            </h3>
            <div className="text-3xl font-bold">1.2K</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">
              Success Rate
            </h3>
            <div className="text-3xl font-bold">98%</div>
          </div>
        </motion.div>

        {/* Active Tournaments */}
        <motion.div
          className="bg-slate-800 rounded-xl p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Active Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">
                  Spring Championship 2025
                </h3>
                <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                  Registration Open
                </span>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                  Prize Pool: $50,000
                </li>
                <li className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                  Starts: March 15, 2025
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-400" />
                  32 Teams Maximum
                </li>
              </ul>
              <motion.button
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Register Now
              </motion.button>
            </div>

            <div className="bg-slate-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Pro League Season 5</h3>
                <span className="bg-yellow-500 px-3 py-1 rounded-full text-sm">
                  Qualifiers
                </span>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                  Prize Pool: $75,000
                </li>
                <li className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                  Starts: February 1, 2025
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-400" />
                  16 Teams Maximum
                </li>
              </ul>
              <motion.button
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Qualifiers
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tournament Features */}
        <motion.div
          className="bg-slate-800 rounded-xl p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <Award className="w-8 h-8 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Professional Organization
              </h3>
              <p className="text-gray-300">
                Expert tournament management with dedicated support staff and
                real-time updates.
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <Target className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Fair Competition</h3>
              <p className="text-gray-300">
                Advanced anti-cheat systems and professional referees for all
                matches.
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <BarChart className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Statistics & Analytics
              </h3>
              <p className="text-gray-300">
                Comprehensive match statistics and performance analytics for
                teams.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Past Tournaments */}
        <motion.div
          className="bg-slate-800 rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">Past Tournaments</h2>
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Winter Championship 2024</h3>
                <p className="text-gray-400">32 Teams • $45,000 Prize Pool</p>
              </div>
              <span className="text-green-400">Completed</span>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Pro League Season 4</h3>
                <p className="text-gray-400">16 Teams • $60,000 Prize Pool</p>
              </div>
              <span className="text-green-400">Completed</span>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Fall Invitational 2024</h3>
                <p className="text-gray-400">24 Teams • $30,000 Prize Pool</p>
              </div>
              <span className="text-green-400">Completed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TournamentOrgProfile;
