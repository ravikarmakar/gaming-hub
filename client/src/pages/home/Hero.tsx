import { motion } from "framer-motion";
import AnimatedText from "../../components/elements/AnimatedTextProps";
import Particles from "react-tsparticles";
import { Trophy, Gamepad2, Zap } from "lucide-react";
import HeaderButton from "./Button";
import { Link } from "react-router-dom";

const particleOptions = {
  fullScreen: { enable: false },
  particles: {
    number: { value: 50 },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.6, random: true },
    size: { value: 2, random: true },
    move: { enable: true, speed: 1.5 },
  },
};

export default function HeroSection() {
  return (
    <section className="relative py-20">
      {/* Background gradient */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-6 blur-[100px] h-[600px] w-[800px] bg-gray-900"></div>

      <div className="relative mx-auto max-w-screen-xl flex flex-col justify-center items-center pt-20">
        {/* Dynamic Particles */}
        <Particles options={particleOptions} className="absolute inset-0" />

        {/* Main Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Animated Text */}
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-orbitron text-white mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedText text="Welcome to the" className="block mb-2" />
                <AnimatedText
                  text="Ultimate Gaming Platform"
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 text-transparent bg-clip-text block"
                />
              </motion.div>
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gray-400 text-sm sm:text-base md:text-lg font-audiowide max-w-2xl mx-auto mb-8"
            >
              Compete, Connect, Conquer: The Future of Gaming Awaits
            </motion.p>
          </motion.div>
        </div>

        {/* Quick Actions Buttons - Fixed positioning and z-index */}
        <div className="relative z-20 w-full mt-12">
          <div className="container mx-auto px-4">
            {/* Responsive Flexbox */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Free Tournament Button */}
              {/* <div className="flex justify-center items-center px-4">
                <Link
                  to="/free-tournaments"
                  className="w-full max-w-xs sm:max-w-sm"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 4px 12px rgba(59, 130, 246, 0.5)", // Blue shadow
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-500/20 border-2 border-blue-500/20 py-4 px-6 flex justify-center items-center gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Trophy className="h-6 w-6 text-blue-500" />
                    <p className="text-white font-semibold text-base sm:text-lg">
                      Free Tournament
                    </p>
                  </motion.div>
                </Link>
              </div> */}

              {/* <motion.div
                className="bg-blue-800/30 py-4 px-6 sm:px-10 md:px-20 flex justify-center items-center gap-2 rounded-xl shadow-lg hover:shadow-blue-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.07 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Gamepad2 className="h-6 w-6 text-cyan-400" />
                <p className="text-white font-medium text-lg">
                  Find Future Teams
                </p>
              </motion.div> */}

              {/* Find Future Team Button */}
              {/* <Link to="/teams">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0px 4px 12px rgba(255, 223, 0, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-yellow-500/20 py-3 px-6 flex justify-center items-center rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Gamepad2 className="mr-2 h-6 w-6 text-yellow-500" />
                  <p className="text-white font-semibold text-lg">
                    Find Future Team
                  </p>
                </motion.div>
              </Link> */}

              {/* Play Scrims Button */}
              {/* <Link to="/scrims">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0px 4px 12px rgba(0, 191, 255, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500/20 py-3 px-6 flex justify-center items-center rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Zap className="mr-2 h-6 w-6 text-blue-500" />
                  <p className="text-white font-semibold text-lg">
                    Play Scrims
                  </p>
                </motion.div>
              </Link> */}
            </div>
          </div>
        </div>

        {/* Organization trusted */}
        <div className="relative z-20 mt-20">
          <div className="mx-auto px-6 md:px-10 max-w-screen-md">
            <h5 className="text-sm opacity-50 text-white">
              Trusted By Leading Organizations
            </h5>
          </div>
        </div>
      </div>
    </section>
  );
}
