/* eslint-disable react-hooks/exhaustive-deps */
import { useTeamStore } from "@/store/useTeamStore";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaGamepad, FaTrophy, FaUsers } from "react-icons/fa";
import PageLayout from "@/pages/PageLayout";
import { Team } from "@/types/team";

interface AllTeamsCardProps {
  team: Team;
  index: number;
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// Card component for each team
const TeamCard = ({ team, index }: AllTeamsCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  // Generate a random gradient for each card
  const gradients = [
    "from-purple-600 to-blue-500",
    "from-emerald-500 to-teal-400",
    "from-pink-500 to-rose-400",
    "from-amber-500 to-orange-400",
    "from-indigo-500 to-blue-400",
    "from-cyan-500 to-blue-400",
    "from-fuchsia-500 to-purple-400",
  ];

  const randomGradient = gradients[index % gradients.length];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Link
        to={`/team-profile/${team._id}`}
        className="block h-full relative group overflow-hidden"
      >
        {/* Card with glassmorphism effect */}
        <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/95 backdrop-blur-xl border border-gray-800 group-hover:border-[#00ff88]/50 transition-all duration-500 shadow-lg group-hover:shadow-[#00ff88]/20 group-hover:shadow-xl">
          {/* Background gradient effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${randomGradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
          ></div>

          {/* Top accent line with gradient */}
          <div
            className={`h-1 w-full bg-gradient-to-r ${randomGradient}`}
          ></div>

          <div className="p-6 flex flex-col h-full">
            {/* Team logo with glow effect */}
            <div className="relative mb-4 mx-auto">
              <div
                className={`absolute -inset-1 rounded-full blur-md bg-gradient-to-r ${randomGradient} opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
              ></div>
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-black/50 p-3 border border-gray-700 group-hover:border-white/30 transition-all duration-300">
                {team.teamLogo ? (
                  <img
                    src={team.teamLogo}
                    alt={`${team.teamName} logo`}
                    className="w-full h-full object-contain rounded-full"
                  />
                ) : (
                  <FaGamepad className="w-10 h-10 text-[#00ff88]/70" />
                )}
              </div>
            </div>

            {/* Team name with animated underline */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors duration-300">
                {team.teamName}
              </h3>
              <div className="h-0.5 w-0 mx-auto bg-[#00ff88] group-hover:w-1/2 transition-all duration-500"></div>
            </div>

            {/* Team description */}
            <p className="text-gray-400 text-sm text-center mb-5 flex-grow line-clamp-3">
              {team.description ||
                "A competitive gaming team looking for new challenges and victories."}
            </p>

            {/* Team stats with icons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center justify-center space-x-1 bg-gray-800/50 rounded-lg p-2">
                <FaUsers className="text-[#00ff88]/70" />
                <span className="text-gray-300 text-sm">
                  {team.members?.length || 0} Members
                </span>
              </div>
              <div className="flex items-center justify-center space-x-1 bg-gray-800/50 rounded-lg p-2">
                <FaTrophy className="text-amber-400/70" />
                <span className="text-gray-300 text-sm">
                  {team.playedTournaments?.length || 0} Tournaments
                </span>
              </div>
            </div>

            {/* View team button */}
            <div className="mt-auto">
              <div className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 group-hover:from-[#00ff88]/20 group-hover:to-[#00ff88]/5 transition-all duration-300 text-center">
                <span className="text-gray-300 group-hover:text-[#00ff88] font-medium transition-colors duration-300">
                  View Team Profile
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const AllTeams = () => {
  const { fetchTeams, teams, isLoading } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams) {
      setFilteredTeams(
        teams.filter((team) =>
          team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, teams]);

  return (
    <PageLayout
      title="Find Your Dream Team"
      description="Discover and join the best gaming teams"
    >
      <div className="relative min-h-screen px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Content container */}
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Search Section with floating animation */}

          <div className="relative max-w-2xl mx-auto mt-4">
            <motion.div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for your perfect team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-gray-900/80 backdrop-blur-xl rounded-2xl text-white border border-gray-800 focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/30 transition-all placeholder-gray-500 pl-14 shadow-lg"
              />
              <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#00ff88]/60 w-5 h-5" />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </motion.div>
          </div>

          {/* Loading Animation */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center mb-12"
              >
                <div className="relative w-16 h-16 mb-3">
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#00ff88] animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin animate-reverse"></div>
                  <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin animate-delay-500"></div>
                </div>
                <p className="text-gray-400 animate-pulse">
                  Loading amazing teams...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Teams Grid with staggered animation */}
          {!isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 py-12"
            >
              {filteredTeams.map((team, index) => (
                <TeamCard key={team._id} team={team} index={index} />
              ))}
            </motion.div>
          )}

          {/* No teams found state */}
          {!isLoading && filteredTeams.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-[#00ff88]/30 rounded-full blur-xl"></div>
                <div className="relative w-full h-full rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-center">
                  <FaSearch className="text-3xl text-[#00ff88]/70" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Teams Found
              </h3>
              <p className="text-gray-400 mb-6">
                Try different search terms or create your own team
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-team")}
                className="px-6 py-3 bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/10 hover:from-[#00ff88]/30 hover:to-[#00ff88]/20 border border-[#00ff88]/50 rounded-xl text-[#00ff88] font-medium transition-all duration-300 shadow-lg shadow-[#00ff88]/5"
              >
                Create Your Team
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AllTeams;
