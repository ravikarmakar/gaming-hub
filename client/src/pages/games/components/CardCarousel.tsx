import React, { useState, useCallback, memo } from "react";
import { motion, useAnimation } from "framer-motion";
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

const CardCarousel: React.FC<CardCarouselProps> = memo(({ gameData, onRatingClick }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const controls = useAnimation();

  // Minimum swipe distance for gesture detection (in pixels)
  const minSwipeDistance = 50;

  const startAnimation = useCallback(() => {
    if (!isPaused) {
      controls.start({
        x: [0, -(gameData.length * 320)],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: gameData.length * 5,
            ease: "linear",
          },
        },
      });
    } else {
      controls.stop();
    }
  }, [controls, gameData.length, isPaused]);

  React.useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      // Handle swipe if needed
    }
    
    setIsPaused(false);
    startAnimation();
  };

  return (
    <div 
      className="overflow-hidden w-full py-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <motion.div
        className="flex space-x-6"
        animate={controls}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => {
          setIsPaused(false);
          startAnimation();
        }}
      >
        {[...gameData, ...gameData].map((game, index) => (
          <motion.div
            key={`${game.id}-${index}`}
            className="flex-shrink-0 w-80 h-64 bg-gray-900 rounded-lg overflow-hidden relative shadow-lg transform transition-transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-yellow-400 text-lg font-bold truncate pr-2">
                    {game.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRatingClick(game.id);
                    }}
                    className="flex items-center gap-2 bg-slate-800/90 px-2 py-1 rounded-full hover:bg-slate-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label={`Rate ${game.title}`}
                  >
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium text-sm">4.5</span>
                  </button>
                </div>
                <p className="text-slate-300 text-sm mt-2 line-clamp-2">
                  {game.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

CardCarousel.displayName = "CardCarousel";

export default CardCarousel;
