import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { eventData } from "@/lib/constants";
import EventGrid from "./components/EventGrid";
import { memo, lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Types
interface FeaturedEventsProps {
  className?: string;
}

// Lazy loaded components
const ErrorFallback = lazy(() => import("@/components/ErrorFallback"));

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeaturedEvents: React.FC<FeaturedEventsProps> = memo(
  ({ className = "" }) => {
    const location = useLocation();
    const isRoot = location.pathname === "/";
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const featuredEvents = eventData.slice(0, 6);
    const mobileSlides = Math.ceil(featuredEvents.length / 2);

    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % mobileSlides);
    };

    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + mobileSlides) % mobileSlides);
    };

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <section
          className={`py-12 sm:py-16 md:py-20 bg-black relative overflow-hidden ${className}`}
          aria-label="Featured Events Section"
        >
          {/* Animated gaming-themed background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#2563eb_0%,_transparent_50%)] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#7c3aed_0%,_transparent_50%)] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_#0891b2_0%,_transparent_50%)] opacity-20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>

          {/* Content Container */}
          <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 relative">
            {isRoot && (
              <motion.div
                className="text-center mb-16"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99],
                }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                  Featured Events
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                  Join the most epic gaming tournaments and create legendary
                  moments with fellow gamers!
                </p>
              </motion.div>
            )}

            <Suspense
              fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              }
            >
              <div className="relative">
                {isMobile && featuredEvents.length > 2 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800 transition-colors"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800 transition-colors"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <EventGrid
                  events={featuredEvents}
                  currentSlide={currentSlide}
                  isMobile={isMobile}
                />
              </div>
            </Suspense>

            {isRoot && (
              <motion.div
                className="mt-12 sm:mt-16 text-center"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Link
                  to="/events"
                  className="inline-block group"
                  aria-label="View all events"
                >
                  <motion.button
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600 text-white font-bold 
                    relative overflow-hidden shadow-lg hover:shadow-cyan-500/25 transition-shadow duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Explore All Events</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400"
                      initial={{ x: "100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </ErrorBoundary>
    );
  }
);

export default FeaturedEvents;
