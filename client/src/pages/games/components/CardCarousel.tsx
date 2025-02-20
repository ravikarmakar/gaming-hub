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

const CardCarousel: React.FC<CardCarouselProps> = memo(
  ({ gameData, onRatingClick }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const controls = useAnimation();

    // Minimum swipe distance for gesture detection (in pixels)
    const minSwipeDistance = 50;
    const cardWidth = 340;
    const totalWidth = gameData.length * cardWidth;

    const resetToStart = useCallback(() => {
      setCurrentPosition(0);
      controls.set({ x: 0 });
      startAnimation();
    }, [controls]);

    const startAnimation = useCallback(() => {
      if (!isPaused) {
        controls.start({
          x: [currentPosition, -totalWidth],
          transition: {
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: gameData.length * 8,
              ease: "linear",
              onComplete: () => {
                resetToStart();
              }
            },
          },
        });
      } else {
        controls.stop();
      }
    }, [controls, gameData.length, isPaused, currentPosition, totalWidth, resetToStart]);

    React.useEffect(() => {
      startAnimation();
      
      return () => {
        controls.stop();
      };
    }, [startAnimation, controls]);

    const onTouchStart = (e: React.TouchEvent) => {
      setIsPaused(true);
      setIsDragging(true);
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
      controls.stop();
    };

    const onTouchMove = (e: React.TouchEvent) => {
      if (!touchStart || !isDragging) return;
      
      const currentTouch = e.targetTouches[0].clientX;
      setTouchEnd(currentTouch);
      
      const diff = touchStart - currentTouch;
      const newPosition = currentPosition - diff;
      
      // Add bounds checking
      if (newPosition > 0) {
        controls.set({ x: newPosition * 0.2 }); // Add resistance at start
      } else if (newPosition < -totalWidth) {
        const overscroll = newPosition + totalWidth;
        controls.set({ x: -totalWidth + overscroll * 0.2 }); // Add resistance at end
      } else {
        controls.set({ x: newPosition });
      }
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd || !isDragging) return;
      setIsDragging(false);

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      let newPosition = currentPosition;
      if (isLeftSwipe || isRightSwipe) {
        const moveAmount = isLeftSwipe ? -cardWidth : cardWidth;
        newPosition = currentPosition + moveAmount;
        
        // Check bounds
        if (newPosition > 0) {
          newPosition = 0;
        } else if (newPosition < -totalWidth) {
          resetToStart();
          return;
        }
      }

      // Animate to the new position
      controls.start({
        x: newPosition,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }).then(() => {
        setCurrentPosition(newPosition);
        setIsPaused(false);
        if (newPosition <= -totalWidth) {
          resetToStart();
        } else {
          startAnimation();
        }
      });
    };

    return (
      <div
        className="overflow-hidden w-full py-3"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          className="flex gap-5"
          animate={controls}
          onHoverStart={() => setIsPaused(true)}
          onHoverEnd={() => {
            setIsPaused(false);
            startAnimation();
          }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
        >
          {[...gameData, ...gameData].map((game, index) => (
            <motion.div
              key={`${game.id}-${index}`}
              className="flex-shrink-0 w-[300px] h-56 sm:w-80 sm:h-64 bg-gray-900 rounded-lg overflow-hidden relative shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.98, transition: { duration: 0.2 } }}
            >
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
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
                      <span className="text-yellow-400 font-medium text-sm">
                        4.5
                      </span>
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
  }
);

CardCarousel.displayName = "CardCarousel";

export default CardCarousel;
