import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GameCard from "./components/GameCard";
import SideGameList from "./components/SideGameList";
import CardCarousel from "./components/CardCarousel";

// Main Store component
const GameStore: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

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

    // Initial check on mount
    handleResize();

    // Debounced resize handler
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
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gameData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, gameData.length]);

  const handleGameSelect = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const featuredGame = gameData[currentIndex];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />

      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Headers */}
        <motion.div
          className="text-center mb-16 mx-10"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 tracking-tight">
            Featured Games
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            We are in multiple game genres such as Action, Adventure, Strategy,
            and more.
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left section - Featured game */}
          <motion.div
            className="relative flex-1 justify-center items-center lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* GameCard */}
            <GameCard
              game={featuredGame}
              onRatingClick={handleRating}
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            />
          </motion.div>

          {/* Right section - Game list */}
          {isMobileView ? (
            <CardCarousel gameData={gameData} onRatingClick={handleRating} />
          ) : (
            <SideGameList
              currentIndex={currentIndex}
              gameData={gameData}
              onGameSelect={handleGameSelect}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GameStore;
