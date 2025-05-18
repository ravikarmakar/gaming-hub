import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

const hexagonPath =
  "M17.547 0l17.547 10.137v20.274L17.547 40.548 0 30.41V10.137L17.547 0z";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0f1d]/90 backdrop-blur-md z-50">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e510,transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#4f46e510,transparent_100px)] opacity-10" />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(45deg,#00ff8705,#60efff05,#ff3d8705)]"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center space-y-8"
      >
        {/* Hexagon container */}
        <div className="relative w-32 h-32">
          {/* Outer rotating hexagon */}
          <motion.svg
            viewBox="0 0 35.094 41.548"
            className="absolute inset-0 w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <motion.path
              d={hexagonPath}
              className="fill-none stroke-[#4f46e5] stroke-[0.5]"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.svg>

          {/* Inner rotating hexagon */}
          <motion.svg
            viewBox="0 0 35.094 41.548"
            className="absolute inset-0 w-full h-full scale-90"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <motion.path
              d={hexagonPath}
              className="fill-none stroke-[#60efff] stroke-[0.5]"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
            />
          </motion.svg>

          {/* Center gamepad with glow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5] to-[#60efff] blur-xl opacity-50" />
              <div className="relative bg-gradient-to-r from-[#4f46e5] to-[#60efff] p-4 rounded-xl">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Orbiting dots */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 left-1/2 top-1/2"
              animate={{
                rotate: 360,
                scale: [1, 1.5, 1],
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, delay: i * 0.1 },
              }}
              style={{
                transformOrigin: "0 0",
                transform: `rotate(${i * 45}deg) translateX(60px)`,
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-[#00ff87] to-[#60efff]" />
            </motion.div>
          ))}
        </div>

        {/* Loading text with cyber effect */}
        <div className="relative">
          <motion.div
            className="text-transparent bg-gradient-to-r from-[#00ff87] via-[#60efff] to-[#00ff87] bg-clip-text font-orbitron text-2xl font-bold relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Loading...
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00ff87]/20 to-[#60efff]/20 blur-lg"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Progress bar with particles */}
        <div className="relative w-64">
          <motion.div
            className="h-2 bg-[#151c3b] rounded-full overflow-hidden shadow-lg shadow-[#4f46e5]/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full"
              initial={{ width: "0%" }}
              animate={{
                width: "100%",
                background: [
                  "linear-gradient(to right, #4f46e5, #60efff, #4f46e5)",
                  "linear-gradient(to right, #00ff87, #60efff, #00ff87)",
                  "linear-gradient(to right, #ff3d87, #ffa64d, #ff3d87)",
                  "linear-gradient(to right, #4f46e5, #60efff, #4f46e5)",
                ],
              }}
              transition={{
                width: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                background: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          </motion.div>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 w-1 h-1 rounded-full bg-[#60efff]"
              animate={{
                x: ["0%", "100%"],
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
