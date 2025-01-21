import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { eventData } from "@/lib/constants";
import EventGrid from "./components/EventGrid";
import { memo, lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <section
          className={`py-12 sm:py-16 md:py-20 bg-black relative overflow-hidden ${className}`}
          aria-label="Featured Events Section"
        >
          {/* Animated background gradient - with reduced opacity for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent blur-3xl" />

          {/* Optimized gradients with better performance */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

          {/* Main COntainer */}
          <div className="container max-w-[1400px] mx-auto px-4  sm:px-6 relative">
            {isRoot && (
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
                  Latest Events
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                  Join the most exciting events and create unforgettable
                  memories with your friends!
                </p>
              </motion.div>
            )}

            <Suspense
              fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                  Loading events...
                </div>
              }
            >
              <EventGrid events={eventData} />
            </Suspense>

            {isRoot && (
              <motion.div
                className="mt-8 sm:mt-12 text-center"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Link
                  to="/events"
                  className="inline-block"
                  aria-label="View all events"
                >
                  <button
                    className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-600/95 to-purple-600/75 text-white font-semibold 
                    hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    View All Events
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </ErrorBoundary>
    );
  }
);

FeaturedEvents.displayName = "FeaturedEvents";

export default FeaturedEvents;
