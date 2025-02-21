import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Event } from "@/types/event";
import { cn } from "@/lib/utils";
import TrendingEventCard from "./TrendingEventCard";

interface TrendingEventsProps {
  className?: string;
  events: Event[];
}

const TrendingEvents = ({ className = "", events }: TrendingEventsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % events.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered, events.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      filter: "blur(8px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      filter: "blur(8px)",
    }),
  };

  const navigate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % events.length;
      }
      return prev === 0 ? events.length - 1 : prev - 1;
    });
  };

  const visibleEvents = isMobile
    ? [events[currentIndex]]
    : [
        events[currentIndex],
        events[(currentIndex + 1) % events.length],
        events[(currentIndex + 2) % events.length],
      ];

  const totalDots = isMobile ? events.length : Math.ceil(events.length / 3);

  const handleDotClick = (idx: number) => {
    const newIndex = isMobile ? idx : idx * 3;
    const newDirection = newIndex > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(newIndex);
  };

  return (
    <section
      ref={containerRef}
      className={cn("relative py-24 overflow-hidden", className)}
    >
      {/* Dynamic background */}
      <div className="absolute inset-0 bg-[#030304]">
        {/* Noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />

        {/* Gaming-themed accent lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <div className="absolute -left-40 top-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute -right-40 bottom-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Animated grid */}
        <div
          className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"
          style={{
            maskImage: "radial-gradient(circle at 50% 50%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, black, transparent)",
          }}
        />
      </div>

      <motion.div className="container max-w-7xl mx-auto px-4 relative">
        {/* Header section */}
        <div className="flex flex-col items-center justify-center mb-16 gap-4 text-center">
          <motion.div className="relative">
            <div className="absolute inset-0 blur-xl bg-violet-500/20 rounded-full" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
              Trending Events
            </h2>
          </motion.div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the hottest gaming tournaments and events happening right
            now
          </p>
        </div>

        {/* Events carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={cn(
              "grid gap-8 mb-12",
              isMobile ? "grid-cols-1" : "grid-cols-3"
            )}
          >
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              {visibleEvents.map((event, index) => (
                <motion.div
                  key={`${event.id}-${index}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                    filter: { duration: 0.2 },
                  }}
                >
                  <TrendingEventCard event={event} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation and Dots */}
        <div className="relative mt-8 mb-4">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center gap-6">
              {/* Dots Navigation */}

              {/* Arrow Navigation */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate(-1)}
                  className="p-3 rounded-full bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-300 group" />
                </motion.button>

                <div className="flex items-center gap-3 justify-center w-full">
                  {Array.from({ length: totalDots }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      className="relative py-4 px-2"
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-300 ease-in-out",
                          (
                            isMobile
                              ? currentIndex === idx
                              : Math.floor(currentIndex / 3) === idx
                          )
                            ? "bg-violet-400 scale-110"
                            : "bg-gray-600/50 hover:bg-gray-500/50"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <motion.button
                  onClick={() => navigate(1)}
                  className="p-3 rounded-full bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm group"
                >
                  <ChevronRight className="w-6 h-6 text-gray-300 group" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default TrendingEvents;
