import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Star, Activity } from "lucide-react";

import { usePlayerStore } from "@/features/player/store/usePlayerStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
};

const statsVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.2 },
  },
};

const AllPlayerPage = () => {
  const { isLoading, fetchAllPlayers, players, error } = usePlayerStore();

  useEffect(() => {
    fetchAllPlayers();
  }, [fetchAllPlayers]);

  console.log("Players:", players);

  if (!players || isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-t-2 border-b-2 rounded-full animate-spin border-violet-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0b0f] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(88,28,135,0.15),rgba(124,58,237,0.15),rgba(255,255,255,0))] py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[90rem] mx-auto"
      >
        <div className="relative mb-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.3),rgba(88,28,135,0)_70%)] blur-3xl" />

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4 text-3xl font-bold md:text-5xl"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500">
              You Can Find Best Elite Esports Warriors here
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto font-light text-gray-300 text-md md:text-lg"
          >
            Discover top players and their achievements in the gaming world
          </motion.p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div
              className="relative px-4 py-3 text-red-200 border border-red-500 rounded bg-red-900/50"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}

        {/* Search Input with improved styling */}
        {/* <div className="relative max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search Players..."
            defaultValue={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div> */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {players.map((player) => (
            <Link key={player._id} to={`/player/${player._id}`}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#13141a] border border-violet-900/20 backdrop-blur-xl"
              >
                <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 group-hover:opacity-100" />
                <div className="absolute top-0 left-0 w-full h-1 transition-transform duration-500 transform scale-x-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 group-hover:scale-x-100" />

                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 overflow-hidden rounded-full ring-2 ring-violet-500/30">
                          <img
                            src={player?.avatar}
                            alt={player.username}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute p-1 rounded-full -bottom-1 -right-1 bg-gradient-to-r from-violet-500 to-fuchsia-500">
                          <Gamepad2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-violet-400">
                          {player.username}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {player?.esportsRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <motion.div
                      variants={statsVariants}
                      className="flex items-center p-3 space-x-2 rounded-lg bg-violet-950/30"
                    >
                      <Trophy className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-sm text-gray-400">Tournaments</p>
                        <p className="text-lg font-semibold text-violet-400">
                          {/* {player.email} */}
                          10
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      variants={statsVariants}
                      className="flex items-center p-3 space-x-2 rounded-lg bg-fuchsia-950/30"
                    >
                      <Star className="w-5 h-5 text-fuchsia-400" />
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <p className="text-lg font-semibold text-fuchsia-400">
                          {/* {player.username} */}
                          4.5
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">
                        Experience: {player.esportsRole} years
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* <div className="flex items-center justify-center mt-8 mb-12">
          {hasMore && (
            <button
              onClick={() => fetchPlayers()}
              disabled={isLoading}
              className={`px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More Players</span>
                  {players.length > 0 && (
                    <span className="text-sm opacity-75">
                      ({players.length} shown)
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div> */}
      </motion.div>
    </div>
  );
};

export default AllPlayerPage;
