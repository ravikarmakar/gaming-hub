import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Gamepad,
  Sword,
  Timer,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import CreateTeamModal from "../team/CreateTeamModal";

const Hero = () => {
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  return (
    <section className="relative min-h-screen py-20 overflow-hidden bg-gradient-to-br from-gray-900/30 via-purple-900/20 to-gray-900/20">
      {/* Animated Background Grid - Enhanced */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Enhanced Gradient Orbs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full top-1/4 -left-32 w-96 h-96 bg-purple-500/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 2,
          ease: "easeInOut",
        }}
        className="absolute rounded-full bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/40 blur-3xl"
      />

      {/* Additional Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0, 1, 0],
              y: [-100, -200],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut",
            }}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container relative z-10 flex flex-col items-center justify-center h-full px-6 mx-auto py-18">
        <CreateTeamModal
          isOpen={isCreateTeamOpen}
          setIsOpen={setIsCreateTeamOpen}
        />
        {/* Enhanced Live Tournament Badge */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="flex justify-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="relative flex items-center gap-3 px-6 py-3 border rounded-full shadow-lg group bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-cyan-500/20 border-purple-500/30 backdrop-blur-sm shadow-purple-500/10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Timer className="w-5 h-5 text-purple-300" />
            </motion.div>
            <span className="font-medium text-purple-200">
              Next Tournament Starts In
            </span>
            <motion.span
              key="timer"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-3 py-1 font-mono font-bold tracking-wider text-white rounded-lg bg-purple-600/30"
            >
              02:14:33
            </motion.span>
            <motion.div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
          </motion.div>
        </motion.div>

        {/* Enhanced Main Heading */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
          className="max-w-5xl mx-auto mb-8 text-center"
        >
          <motion.h1
            className="mb-8 text-5xl font-black leading-tight md:text-7xl lg:text-8xl"
            initial={{ filter: "blur(10px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="relative inline-block text-transparent bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text"
            >
              Dominate
              <motion.div
                className="absolute left-0 w-full h-1 rounded-full -bottom-2 bg-gradient-to-r from-purple-400 to-cyan-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="inline-block text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-purple-400 bg-clip-text"
            >
              The Future
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
              className="inline-block text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text"
            >
              of
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, rotateX: 90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 100 }}
              className="relative inline-block font-black tracking-wide text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text"
            >
              GAMING
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute text-yellow-400 -top-4 -right-4"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="max-w-3xl mx-auto text-lg font-light leading-relaxed text-gray-300 md:text-xl lg:text-2xl"
          >
            Join the ultimate gaming ecosystem where champions are born, legends
            compete, and the impossible becomes reality.
          </motion.p>
        </motion.div>

        {/* Enhanced CTA Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center justify-center gap-6 mb-20 sm:flex-row"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              borderColor: "rgb(168, 85, 247)",
              backgroundColor: "rgba(168, 85, 247, 0.1)",
            }}
            onClick={() => setIsCreateTeamOpen(true)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-10 py-5 text-lg font-semibold text-gray-200 transition-all duration-300 border-2 border-gray-600 group bg-gray-800/40 backdrop-blur-sm rounded-2xl hover:text-white"
          >
            <Gamepad className="w-6 h-6 transition-colors group-hover:text-purple-400" />
            Create Team
          </motion.button>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 80 }}
          className="grid max-w-5xl grid-cols-2 gap-6 mx-auto mb-16 md:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 + index * 0.1 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
              className="relative p-6 transition-all duration-300 border cursor-pointer group bg-gray-800/60 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:border-purple-500/50"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {stat.icon}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(168, 85, 247, 0)",
                        "0 0 20px rgba(168, 85, 247, 0.3)",
                        "0 0 0 rgba(168, 85, 247, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <Star className="w-4 h-4 text-gray-500 transition-colors group-hover:text-yellow-400" />
              </div>
              <motion.h3
                className={`text-3xl md:text-4xl font-black mb-2 ${stat.color} group-hover:scale-110 transition-transform`}
                whileHover={{ scale: 1.1 }}
              >
                {stat.value}
              </motion.h3>
              <p className="font-medium text-gray-400 transition-colors group-hover:text-gray-300">
                {stat.label}
              </p>
              <motion.div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Featured Players Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.5, type: "spring", stiffness: 80 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div className="flex -space-x-3" whileHover={{ scale: 1.05 }}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 2.7 + i * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.15,
                  zIndex: 10,
                  boxShadow: "0 10px 30px rgba(168, 85, 247, 0.5)",
                }}
                className="relative cursor-pointer"
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 p-[3px]"
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="w-full h-full overflow-hidden bg-gray-900 rounded-full">
                    <img
                      src={`/api/placeholder/64/64`}
                      alt={`Top Player ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </motion.div>
                {i === 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full -top-1 -right-1"
                  >
                    <Star className="w-3 h-3 text-gray-900" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
            className="flex items-center gap-3 text-gray-300"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-6 h-6 text-purple-400" />
            </motion.div>
            <span className="text-lg font-medium">
              Join <span className="font-bold text-purple-400">50,000+</span>{" "}
              elite gamers worldwide
            </span>
            <Zap className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Floating Game Elements */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.2, rotate: 15 }}
        className="absolute hidden cursor-pointer bottom-20 right-10 text-purple-400/60 lg:block"
      >
        <Gamepad className="w-24 h-24 drop-shadow-2xl" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 25, 0],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        whileHover={{ scale: 1.3, rotate: -30 }}
        className="absolute hidden cursor-pointer top-32 left-10 text-cyan-400/60 lg:block"
      >
        <Sparkles className="w-20 h-20 drop-shadow-2xl" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        whileHover={{ scale: 1.15 }}
        className="absolute hidden top-1/2 right-20 text-pink-400/50 xl:block"
      >
        <Trophy className="w-16 h-16 drop-shadow-2xl" />
      </motion.div>
    </section>
  );
};

const stats = [
  {
    value: "50K+",
    label: "Active Champions",
    color: "text-purple-400",
    icon: <Users className="text-purple-400 w-7 h-7" />,
  },
  {
    value: "$2.5M",
    label: "Total Prize Pool",
    color: "text-cyan-400",
    icon: <Trophy className="w-7 h-7 text-cyan-400" />,
  },
  {
    value: "10K+",
    label: "Tournaments Won",
    color: "text-pink-400",
    icon: <Sword className="text-pink-400 w-7 h-7" />,
  },
  {
    value: "24/7",
    label: "Non-Stop Action",
    color: "text-blue-400",
    icon: <Gamepad className="text-blue-400 w-7 h-7" />,
  },
];

export default Hero;
