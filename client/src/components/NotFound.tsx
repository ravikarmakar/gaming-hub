import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-[#181825] sm:p-6 md:p-8">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#181825]/90 via-[#2d193c]/90 to-[#181825]">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(to right bottom, #181825, #2d193c, #181825)",
              "linear-gradient(to right bottom, #2d193c, #181825, #181825)",
              "linear-gradient(to right bottom, #181825, #181825, #2d193c)",
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
          className="absolute text-4xl text-[#2d193c]/30 sm:text-5xl md:text-6xl"
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

      <div className="relative z-10 px-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
          }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h1
            className="text-[80px] sm:text-[120px] md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#a78bfa] to-[#6d28d9] leading-none
            drop-shadow-[0_0_15px_rgba(109,40,217,0.5)]"
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
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#a78bfa] mb-2 sm:mb-4
            drop-shadow-[0_0_10px_rgba(109,40,217,0.3)]"
          >
            Game Over! Page Not Found
          </h2>
          <p className="max-w-lg px-4 mx-auto mb-4 text-base sm:text-lg md:text-xl text-[#a78bfa]/80 sm:mb-6 md:mb-8">
            Looks like you've ventured into uncharted territory! This level
            doesn't exist in our gaming universe.
          </p>
        </motion.div>

        <Button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-6 sm:px-8 py-2.5 text-base sm:text-lg font-bold leading-none text-[#ede9fe] bg-gradient-to-r from-[#2d193c] via-[#6d28d9] to-[#2d193c] rounded-full transition-all duration-200 hover:shadow-[0_0_30px_rgba(109,40,217,0.5)] border border-[#6d28d9]/30 backdrop-blur-sm"
        >
          Back to
        </Button>

        {/* Animated dots */}
        <motion.div className="mt-12 space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.span
              key={i}
              className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#a78bfa]"
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
