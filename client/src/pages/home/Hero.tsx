import { motion } from "framer-motion";
import AnimatedText from "../../components/elements/AnimatedTextProps";
import Particles from "react-tsparticles";
import { Trophy, Gamepad2, Zap } from "lucide-react";
import HeaderButton from "./Button";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Dynamic Particles */}
      <Particles options={particleOptions} className="absolute inset-0 z-0" />

      {/* Floating Cubes */}
      <div className="absolute left-6 sm:left-10 md:left-16 lg:left-20 top-10 sm:top-14 md:top-20 lg:top-24 z-10">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg rounded-sm"
        />
      </div>

      {/* Floating Icon - Gamepad */}
      <div className="absolute top-20 sm:top-28 md:top-32 lg:top-40 right-8 sm:right-12 md:right-16 lg:right-20 z-10">
        <motion.img
          src="gamepad-icon.png"
          alt="Gamepad"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
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
            Join the next generation of gaming. Compete, connect, and conquer in
            a world of endless possibilities.
          </motion.p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <HeaderButton
              text="Find Future Teams"
              icon={<Gamepad2 className="mr-2 h-5 w-5" />}
              gradientFrom="cyan-500"
              gradientTo="blue-600"
              hoverColor1="rgba(0,255,255,0.8)"
              hoverColor2="rgba(0,255,255,0.5)"
              link="/teams"
            />
            <HeaderButton
              text="Play Scrims"
              icon={<Zap className="mr-2 h-5 w-5" />} // Lucide Zap icon for energy and action
              gradientFrom="yellow-500" // Vibrant yellow
              gradientTo="red-500" // Bright red
              hoverColor1="rgba(255, 215, 0, 0.8)" // Golden yellow glow
              hoverColor2="rgba(255, 69, 0, 0.5)" // Red-orange glow
              link="/scrims"
            />
            <HeaderButton
              text="Free Tournaments"
              icon={<Trophy className="mr-2 h-5 w-5" />}
              gradientFrom="purple-500"
              gradientTo="pink-600"
              hoverColor1="rgba(160,32,240,0.8)"
              hoverColor2="rgba(160,32,240,0.5)"
              link="/free-tournaments"
            />
          </div>
        </motion.div>
      </div>
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black to-transparent" />
      {/* Floating Icon - Gamepad */}
      <div className="absolute bottom-10 sm:bottom-10 md:bottom-28 lg:bottom-32 left-16">
        <motion.img
          src="/path-to-gamepad-icon.png"
          alt="Gamepad Icon"
          className="w-16 sm:w-20 lg:w-24 h-auto opacity-80"
          animate={{ y: [0, 20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
    </section>
  );
}
