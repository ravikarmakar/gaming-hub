import { useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Star, Users, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import usePlayerStore from "@/store/usePlayerStore";

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

const AllPlayers = () => {
  const { fetchPlayers, hasMore, players, cursor, searchTerm, setSearchTerm } =
    usePlayerStore();

  useEffect(() => {
    if (players.length === 0) fetchPlayers(true);
  }, []);

  useEffect(() => {
    console.log("Players State Updated:", players);
  }, [players]);

  useEffect(() => {
    console.log("Has More Updated:", hasMore);
  }, [hasMore]);

  console.log(hasMore, cursor);

  console.log(players);

  if (!players)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bule-900 to-pink-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl text-purple-400 font-semibold"
        >
          Loading Players...
        </motion.div>
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
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.3),rgba(88,28,135,0)_70%)] blur-3xl" />

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4 relative"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500">
              You Can Find Best Elite Esports Warriors here
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-md md:text-lg max-w-3xl mx-auto font-light"
          >
            Discover top players and their achievements in the gaming world
          </motion.p>
        </div>

        {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Search Players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8"
        >
          {players.map((player) => (
            <Link to={`/profile/${player._id}`} key={player._id}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#13141a] border border-violet-900/20 backdrop-blur-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-violet-500/30">
                          <img
                            src={player?.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full p-1">
                          <Gamepad2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-white group-hover:text-violet-400 transition-colors">
                          {player.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{player?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <motion.div
                      variants={statsVariants}
                      className="flex items-center space-x-2 bg-violet-950/30 rounded-lg p-3"
                    >
                      <Trophy className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-sm text-gray-400">Tournaments</p>
                        <p className="text-lg font-semibold text-violet-400">
                          {player.tournaments}
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      variants={statsVariants}
                      className="flex items-center space-x-2 bg-fuchsia-950/30 rounded-lg p-3"
                    >
                      <Star className="w-5 h-5 text-fuchsia-400" />
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <p className="text-lg font-semibold text-fuchsia-400">
                          {player.rating}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        Team: {player.team || "Solo Player"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">
                        Experience: {player.experience} years
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-center">
        {hasMore && (
          <button
            onClick={(e) => fetchPlayers()}
            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            See More
          </button>
        )}
      </div>
    </div>
  );
};

export default AllPlayers;
