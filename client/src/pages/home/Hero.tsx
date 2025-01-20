import { motion } from "framer-motion";
import AnimatedText from "../../components/elements/AnimatedTextProps";
import Particles from "react-tsparticles";
import { Trophy, Gamepad2, Zap } from "lucide-react";
import QuickActionButton from "./Button";

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

const icon = [
  {
    icon: <Trophy className="h-5 w-5 text-white/80 group-hover:text-white" />,
    label: "Free Tournaments",
    to: "/free-tournaments",
  },

  {
    icon: <Gamepad2 className="h-5 w-5 text-white/80 group-hover:text-white" />,
    label: "Find Teams",
    to: "/teams",
  },

  {
    icon: <Zap className="h-5 w-5 text-white/80 group-hover:text-white" />,
    label: "Play Scrims",
    to: "/scrims",
  },
];

const HeroSection = () => {
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

        {/* Quick Actions Buttons - Professional & Mobile Friendly */}
        <div className="relative z-20 w-full mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-stretch">
              {icon.map((item, index) => (
                <QuickActionButton
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
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
};

export default HeroSection;
