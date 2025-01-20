import { motion, useAnimationControls } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react";
import { useState, useEffect } from "react";

const topTeams = [
  {
    rank: 1,
    team: "Cyber Dragons",
    points: 2500,
    members: ["Alex", "Sarah", "Mike"],
    achievements: ["Perfect Score", "Fastest Clear"],
    icon: Crown,
    color: "from-yellow-400 via-yellow-300 to-yellow-500",
    shadowColor: "shadow-yellow-500/50",
    borderColor: "border-yellow-400/30",
  },
  {
    rank: 2,
    team: "Pixel Pirates",
    points: 2350,
    members: ["John", "Emma", "David"],
    achievements: ["Team Spirit", "Most Consistent"],
    icon: Trophy,
    color: "from-gray-300 via-gray-200 to-gray-400",
    shadowColor: "shadow-gray-400/50",
    borderColor: "border-gray-400/30",
  },
  {
    rank: 3,
    team: "Neo Ninjas",
    points: 2200,
    members: ["Lisa", "Tom", "Kate"],
    achievements: ["Best Strategy", "Fan Favorite"],
    icon: Medal,
    color: "from-amber-600 via-amber-500 to-amber-700",
    shadowColor: "shadow-amber-500/50",
    borderColor: "border-amber-500/30",
  },
];

const runnerUps = [
  {
    rank: 4,
    team: "Digital Demons",
    points: 2100,
    members: ["Ryan", "Nina"],
    speciality: "Speed Running",
  },
  {
    rank: 5,
    team: "Tech Titans",
    points: 2000,
    members: ["Jack", "Zoe"],
    speciality: "Team Coordination",
  },
  {
    rank: 6,
    team: "Quantum Queens",
    points: 1950,
    members: ["Maya", "Liam"],
    speciality: "Strategic Planning",
  },
  {
    rank: 7,
    team: "Binary Bandits",
    points: 1900,
    members: ["Noah", "Emma"],
    speciality: "Resource Management",
  },
  {
    rank: 8,
    team: "Code Crusaders",
    points: 1850,
    members: ["Oliver", "Ava"],
    speciality: "Defensive Tactics",
  },
  {
    rank: 9,
    team: "Data Dragons",
    points: 1800,
    members: ["Lucas", "Mia"],
    speciality: "Aggressive Strategy",
  },
  {
    rank: 10,
    team: "Pixel Pioneers",
    points: 1750,
    members: ["Ethan", "Sophia"],
    speciality: "Adaptability",
  },
];

export function TopWinners() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const controls = useAnimationControls();

  const visibleCards = 3;
  const maxIndex = runnerUps.length - visibleCards;

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeIndex < maxIndex) {
        setDirection(1);
        setActiveIndex((prev) => prev + 1);
      } else {
        setDirection(-1);
        setActiveIndex(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, maxIndex]);

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < maxIndex) {
      setDirection(1);
      setActiveIndex((prev) => prev + 1);
    }
  };

  return (
    <article className="relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 flex items-center gap-3"
        >
          <Trophy className="w-10 h-10 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Event Champions</h2>
        </motion.div>

        {/* Top 3 Winners */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-20">
          {topTeams.map((team, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Background Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${team.color} blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`}
              />

              {/* Card Content */}
              <div
                className={`relative bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl border ${team.borderColor} ${team.shadowColor} shadow-lg`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                  viewport={{ once: true }}
                  className={`absolute -top-6 -right-6 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r ${team.color}`}
                >
                  <team.icon className="w-6 h-6 text-gray-900" />
                </motion.div>

                <div
                  className={`text-4xl flex gap-5 font-bold mb-4 bg-gradient-to-r ${team.color} text-transparent bg-clip-text`}
                >
                  #{team.rank}
                  <h3 className={`text-3xl font-bold ${team.color}  mb-4`}>
                    {team.team}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      Team Members
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      Achievements
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.achievements.map((achievement, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                        >
                          <Star className="w-3 h-3 text-purple-400" />
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-white">
                    {team.points.toLocaleString()} pts
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Runner Ups Carousel */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Runner Ups
            </h3>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                animate={controls}
                className="flex gap-6 px-4"
                style={{
                  transform: `translateX(-${
                    activeIndex * (100 / visibleCards)
                  }%)`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
              >
                {runnerUps.map((team, index) => (
                  <motion.div
                    key={index}
                    className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 blur-xl rounded-2xl transition-all duration-300" />
                      <div className="relative bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 shadow-lg">
                        <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                          <span className="text-xl font-bold">
                            #{team.rank}
                          </span>
                        </div>

                        <div className="mb-4">
                          <Gamepad2 className="w-8 h-8 text-purple-400 mb-2" />
                          <h4 className="text-xl font-bold text-white">
                            {team.team}
                          </h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-400">
                              Team Members
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {team.members.map((member, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-700/50 rounded-lg text-sm text-gray-300"
                                >
                                  {member}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-400">
                              Speciality
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-purple-400" />
                              <span className="text-gray-300">
                                {team.speciality}
                              </span>
                            </div>
                          </div>

                          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {team.points.toLocaleString()} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gray-800/80 p-2 rounded-full backdrop-blur-xl border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-purple-400" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gray-800/80 p-2 rounded-full backdrop-blur-xl border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-purple-400" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
