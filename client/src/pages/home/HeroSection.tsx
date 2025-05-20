import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Gamepad,
  Sword,
  Timer,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-10 pt-24">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Animated Gradient Orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute rounded-full top-1/4 -left-32 w-96 h-96 bg-purple-500/30 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        className="absolute rounded-full bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/30 blur-3xl"
      />

      {/* Main Content */}
      <div className="container relative z-10 flex flex-col items-center justify-center h-full px-4 mx-auto">
        {/* Live Tournament Badge */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2 border rounded-full bg-purple-500/10 border-purple-500/20"
          >
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              Tournament Starting In
            </span>
            <span className="font-mono text-purple-100">02:14:33</span>
          </motion.div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-12 text-center"
        >
          <h1 className="mb-6 text-5xl font-bold md:text-6xl lg:text-7xl">
            <span className="inline-block text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
              Dominate
            </span>{" "}
            <span className="inline-block text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text">
              The Games
            </span>{" "}
            <span className="inline-block font-bold text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text">
              with
            </span>{" "}
            <span className="font-extrabold tracking-wider text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text">
              GamerX
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-md md:text-xl">
            Join the ultimate gaming community. Compete in tournaments, earn
            rewards, and become a legend.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 mb-16 sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-8 py-4 font-semibold text-white transition-shadow rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-cyan-600 shadow-purple-500/25 hover:shadow-purple-500/40"
          >
            Start Gaming
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 font-semibold text-gray-300 transition-colors border border-gray-700 rounded-full bg-gray-800/50 hover:border-purple-500/50"
          >
            Watch Tournaments
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid max-w-4xl grid-cols-2 gap-4 mx-auto md:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-4 transition-all border border-gray-700 bg-gray-800/50 rounded-xl hover:border-purple-500/50"
            >
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <h3 className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Players */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-4 mt-16"
        >
          <div className="flex -space-x-4">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-[2px]">
                  <div className="w-full h-full overflow-hidden rounded-full">
                    <img
                      src={`https://api.dicebear.com/6.x/avataaars/svg?seed=player${i}`}
                      alt="Player Avatar"
                      className="object-cover w-full h-full bg-gray-800"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>Join 10,000+ pro gamers worldwide</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Game Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute hidden bottom-10 right-10 text-purple-500/50 sm:block"
      >
        <Gamepad className="w-20 h-20" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute hidden top-20 left-10 text-cyan-500/50 sm:block"
      >
        <Sparkles className="w-16 h-16" />
      </motion.div>

      {/*  Trusted Organization */}
      {/* <div className="relative z-20 mt-20 -mx-6 md:mx-0">
          <TrustedOrgs />
        </div> */}
    </section>
  );
};

const stats = [
  {
    value: "50K+",
    label: "Active Players",
    color: "text-purple-400",
    icon: <Users className="w-5 h-5 text-purple-400" />,
  },
  {
    value: "$100K",
    label: "Prize Pool",
    color: "text-cyan-400",
    icon: <Trophy className="w-5 h-5 text-cyan-400" />,
  },
  {
    value: "1000+",
    label: "Tournaments",
    color: "text-pink-400",
    icon: <Sword className="w-5 h-5 text-pink-400" />,
  },
  {
    value: "24/7",
    label: "Live Gaming",
    color: "text-blue-400",
    icon: <Gamepad className="w-5 h-5 text-blue-400" />,
  },
];

export default HeroSection;
