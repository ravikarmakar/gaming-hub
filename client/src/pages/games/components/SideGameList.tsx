import React, { memo } from "react";
import { motion } from "framer-motion";

type SideGame = {
  title: string;
  image: string;
  description: string;
};

type SideGameListProps = {
  gameData: SideGame[];
  currentIndex: number;
  onGameSelect: (index: number) => void;
};

const SideGameList: React.FC<SideGameListProps> = memo(
  ({ currentIndex, gameData, onGameSelect }) => {
    const containerVariants = {
      hidden: { opacity: 0, x: 50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.5,
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
    };

    return (
      <motion.div
        className="w-full lg:w-[380px] xl:w-[420px] space-y-2 hidden lg:block"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {gameData.map((game, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
              index === currentIndex
                ? "bg-blue-900/30 hover:bg-blue-900/40"
                : "bg-white/5 hover:bg-white/10"
            }`}
            onClick={() => onGameSelect(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{game.title}</h3>
              <p className="text-slate-400 text-sm truncate">
                {game.description}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    );
  }
);

SideGameList.displayName = "SideGameList";

export default SideGameList;
