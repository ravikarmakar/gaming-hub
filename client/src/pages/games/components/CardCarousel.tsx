import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Card = {
  id: string;
  title: string;
  description: string;
  image: string;
};

interface CardCarouselProps {
  gameData: Card[];
  onRatingClick: (id: string) => void;
}

const CardCarousel: React.FC<CardCarouselProps> = ({
  gameData,
  onRatingClick,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="overflow-hidden w-full py-6">
      <motion.div
        className="flex space-x-6"
        animate={isPaused ? undefined : { x: ["-100%", "0%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: gameData.length * 3,
        }}
      >
        {gameData.concat(gameData).map((game, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-80 h-64 bg-gray-900 rounded-lg overflow-hidden relative shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end">
              <div className="p-4 flex justify-between items-center">
                <div className="text-yellow-400 text-lg font-bold">
                  {game.title}
                </div>
                <div className="flex items-center gap-2">
                  <Star
                    className="w-5 h-5 text-yellow-400"
                    onClick={() => {
                      setIsPaused(true);
                      onRatingClick(game.id);
                      setTimeout(() => setIsPaused(false), 2000);
                    }}
                  />
                  <span className="text-yellow-400 font-medium text-sm">
                    4.5
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CardCarousel;
