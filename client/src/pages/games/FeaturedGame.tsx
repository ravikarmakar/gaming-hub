import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameCard from "./components/GameCard";
import SideGameList from "./components/SideGameList";
import CardCarousel from "./components/CardCarousel";

// Main Store component
const GameStore: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const gameData = [
    {
      id: "1",
      title: "Action Quest",
      description:
        "Join the battle in this fast-paced action game where you fight to survive and defeat powerful enemies. Explore new worlds and collect rare items.",
      image:
        "https://plus.unsplash.com/premium_photo-1674374443275-20dae04975ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nfGVufDB8fDB8fHww", // Valid image URL
    },
    {
      id: "2",
      title: "Mystery Puzzle",
      description:
        "Unravel secrets in this thrilling puzzle game. Solve intricate puzzles to uncover a dark and mysterious story that will keep you on the edge of your seat.",
      image:
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Valid image URL
    },
    {
      id: "3",
      title: "Combat Legends",
      description:
        "Enter the battlefield with this action-packed combat game. Fight in brutal arenas, unlock new characters, and take on tough opponents.",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D", // Valid image URL
    },
    {
      id: "4",
      title: "Strategy Mastermind",
      description:
        "Strategize your way to victory in this resource management game. Build your empire, conquer territories, and outsmart your opponents to win.",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D", // Valid image URL
    },
    {
      id: "5",
      title: "Explorer's Journey",
      description:
        "Embark on an adventure across diverse landscapes in this exploration game. Discover hidden treasures, solve puzzles, and unlock new regions.",
      image:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D", // Valid image URL
    },
    {
      id: "6",
      title: "Time Racer",
      description:
        "Race against the clock in this high-speed game. Complete challenges, overcome obstacles, and beat your best time to become the ultimate racer.",
      image:
        "https://plus.unsplash.com/premium_photo-1678112181038-4608d184dd4a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D", // Valid image URL
    },
  ];

  const handleRating = (id: string) => {
    console.log(`Rating clicked for card index: ${id}`);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1020);
    };

    handleResize();
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isAutoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gameData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, gameData.length, isHovered]);

  const handleGameSelect = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const featuredGame = gameData[currentIndex];

  return (
    <section className="h-auto lg:min-h-screen pb-20 pt-10 lg:py-20 bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-sky-500 opacity-30"
              animate={{
                y: ["0vh", "100vh"],
                x: Math.sin(i) * 20,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
              style={{
                left: `${(i / 20) * 100}%`,
                top: `-${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="container relative z-10 px-6 mx-auto sm:px-6">
        {/* Headers */}
        <motion.div
          className="mb-4 text-center lg:mb-16"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <motion.h1 className="mb-2 text-4xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-pink-600">
            Favourite Games
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-sm text-gray-300 sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover our handpicked selection of epic gaming adventures
          </motion.p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-4 lg:gap-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Featured game section - Only shown on desktop */}
          {!isMobileView && (
            <motion.div
              className="relative items-center justify-center flex-1"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                >
                  <GameCard
                    game={featuredGame}
                    onRatingClick={handleRating}
                    onMouseEnter={() => setIsAutoPlay(false)}
                    onMouseLeave={() => setIsAutoPlay(true)}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Game list/carousel section */}
          <motion.div
            className={`${isMobileView ? "w-full" : "w-1/3"}`}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {isMobileView ? (
              <div className="w-full">
                <AnimatePresence>
                  {" "}
                  <CardCarousel
                    gameData={gameData}
                    onRatingClick={handleRating}
                  />
                </AnimatePresence>
              </div>
            ) : (
              <SideGameList
                currentIndex={currentIndex}
                gameData={gameData}
                onGameSelect={handleGameSelect}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GameStore;
