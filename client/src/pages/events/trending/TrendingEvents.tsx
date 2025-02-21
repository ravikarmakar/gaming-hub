import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles } from "lucide-react";
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

  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

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

  return (
    <section
      ref={containerRef}
      className={cn("relative py-24 overflow-hidden", className)}
    >
      {/* Dynamic background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a0b2e,#2d1b4e)]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)",
            y,
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
            y: useTransform(y, (value) => value * -1),
          }}
        />
      </div>

      <motion.div
        style={{ opacity }}
        className="container max-w-7xl mx-auto px-4 relative"
      >
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-violet-500/30 rounded-full" />
              <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-violet-400 font-medium">
                  Hot & Trending
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
                Featured Events
              </h2>
            </div>
          </motion.div>
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                  className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700/50 backdrop-blur-sm group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-300 group-hover:text-violet-400 transition-colors" />
                </motion.button>

                <div className="flex items-center gap-3 justify-center w-full">
                  {events.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        const newDirection = idx > currentIndex ? 1 : -1;
                        setDirection(newDirection);
                        setCurrentIndex(idx);
                      }}
                      className="relative group"
                    >
                      <motion.div
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          currentIndex === idx
                            ? "bg-violet-400"
                            : "bg-gray-600 hover:bg-gray-500"
                        )}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        animate={
                          currentIndex === idx ? { scale: [1, 1.2, 1] } : {}
                        }
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                      {currentIndex === idx && (
                        <motion.div
                          className="absolute -inset-2 rounded-full bg-violet-400/20"
                          layoutId="activeDot"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(1)}
                  className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700/50 backdrop-blur-sm group"
                >
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-violet-400 transition-colors" />
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
