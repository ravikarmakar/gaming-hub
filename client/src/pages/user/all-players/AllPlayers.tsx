import { useEffect } from "react";
import { motion } from "framer-motion";
import useUserStore from "@/store/useUserStore";
import { Gamepad, Gamepad2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AllPlayers = () => {
  const { payers, getAllUsers } = useUserStore();

  useEffect(() => {
    if (!payers || payers.length === 0) {
      getAllUsers();
    }
  }, [getAllUsers, payers]);

  if (!payers) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-12 text-center">
          Elite Esports Warriors
        </h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {payers.length > 0 &&
            payers.map((player) => (
              <motion.div
                key={player._id}
                variants={cardVariants}
                className="relative bg-gray-800 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 10px 30px rgba(88, 28, 135, 0.3)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-20" />

                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-purple-500">
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {player.name}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Gamepad2 className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-300">{player.game}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-100">
                        Team
                      </span>
                      <span className="text-white font-semibold">
                        {player.team}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <div>
                        <p className="text-xs text-gray-300">Wins</p>
                        <p className="text-white font-bold">{player.rank}</p>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-2">
                      <Gamepad className="h-6 w-6 text-red-400" />
                      <div>
                        <p className="text-xs text-gray-300">Kills</p>
                        <p className="text-white font-bold">
                          {player.globalRank}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-4 px-3 py-1 rounded-full text-sm font-medium ${
                      player.role === "admin"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    } w-fit`}
                  >
                    {player.role}
                  </div>

                  <Link
                    to={`/profile/${player._id}`}
                    className="relative z-10 mt-4 block w-full text-center py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AllPlayers;
