import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-black p-4 sm:p-6 md:p-8">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 opacity-80">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(to right bottom, #0f172a, #3b0764, #18181b)",
              "linear-gradient(to right bottom, #3b0764, #18181b, #0f172a)",
              "linear-gradient(to right bottom, #18181b, #0f172a, #3b0764)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Floating game controller icons */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-purple-900/20 text-4xl sm:text-5xl md:text-6xl"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360,
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        >
          🎮
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h1
            className="text-[80px] sm:text-[120px] md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-purple-300 to-purple-700 leading-none
            drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]"
          >
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 sm:space-y-6"
        >
          <h2
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-purple-200 mb-2 sm:mb-4
            drop-shadow-[0_0_10px_rgba(147,51,234,0.3)]"
          >
            Game Over! Page Not Found
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-200/80 mb-4 sm:mb-6 md:mb-8 max-w-lg mx-auto px-4">
            Looks like you've ventured into uncharted territory! This level
            doesn't exist in our gaming universe.
          </p>
        </motion.div>

        <motion.div
          className="relative mt-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-purple-100
              bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900
              rounded-full transform transition-all duration-200
              hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]
              border border-purple-500/20 backdrop-blur-sm"
          >
            Return to{" "}
            <span className="font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              GamerX
            </span>
          </Link>
        </motion.div>

        {/* Animated dots */}
        <motion.div className="mt-12 space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.span
              key={i}
              className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-purple-700 to-purple-400"
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
