/* eslint-disable react-hooks/exhaustive-deps */
import { useTeamStore } from "@/store/useTeamStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import PageLayout from "@/pages/PageLayout";

const AllTeams = () => {
  const { fetchTeams, teams, isLoading } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <PageLayout title="Find Your Dream Team here" description="xyz">
      <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Content container with glass effect */}
        <div className="relative z-10">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-[#00ff88] blur-[120px] opacity-10"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find your perfect team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-[#111111] backdrop-blur-lg rounded-2xl text-white focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/50 transition-all placeholder-gray-500 pl-14"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00ff88]/40 w-6 h-6" />
              </div>
            </div>
          </motion.div>

          {/* Loading Animation */}
          {isLoading && (
            <div className="flex items-center justify-center mb-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00ff88]" />
              <span className="ml-2 text-gray-400">Loading teams...</span>
            </div>
          )}

          {/* Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/team-profile/${team._id}`}
                  className="block h-full bg-[#111111]/80 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-800 hover:border-[#00ff88]/50 transition-all duration-300"
                >
                  <div className="p-5 h-full flex flex-col">
                    {team.teamLogo && (
                      <div className="w-20 h-20 mx-auto mb-4">
                        <img
                          src={team.teamLogo}
                          alt={`${team.teamName} logo`}
                          className="w-full h-full object-contain rounded-full bg-black/50 p-2"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-white mb-2 text-center">
                      {team.teamName}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-4 flex-grow">
                      {team.description?.slice(0, 100)}
                      {team.description?.length > 100 ? "..." : ""}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        👥 {team.members?.length || 0} members
                      </span>
                      <span className="text-[#00ff88]/70 hover:text-[#00ff88] transition-colors">
                        View Team →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="text-center text-gray-400 mt-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#111111] border-2 border-[#222] flex items-center justify-center">
                <FaSearch className="text-2xl text-[#00ff88]/50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Teams Found
              </h3>
              <p className="text-gray-500">Try different search terms</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AllTeams;
