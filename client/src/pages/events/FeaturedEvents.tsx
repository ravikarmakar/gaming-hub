import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { eventData } from "@/lib/constants";
import { memo, lazy, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChevronRight } from "lucide-react";

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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const displayLimit = isMobile ? 3 : 6;
    const featuredEvents = eventData.slice(0, displayLimit);

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <section
          className={`py-12 sm:py-16 md:py-20 relative overflow-hidden bg-[#0A0A0A] ${className}`}
          aria-label="Featured Events Section"
        >
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#3B82F6_0%,_transparent_35%)] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_#8B5CF6_0%,_transparent_35%)] opacity-20" />
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
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
                transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 border border-purple-500/20">
                    Featured Events
                  </span>
                </motion.div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500">
                  Epic Tournaments
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                  Join the most prestigious gaming events and compete with the
                  best
                </p>
              </motion.div>
            )}

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Link to={`/events/${event.id}`} className="block h-full">
                    <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-800/50 transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:-translate-y-1">
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

                        {/* Game Tag */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 backdrop-blur-sm border border-blue-500/20">
                            {event.game}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm border ${
                              event.status === "registration-open"
                                ? "bg-green-500/10 text-green-300 border-green-500/20"
                                : "bg-red-500/10 text-red-300 border-red-500/20"
                            }`}
                          >
                            {event.status === "registration-open"
                              ? "Registration Open"
                              : "Registration Closed"}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/20">
                            {event.mode}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/20">
                            {event.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                          {event.title}
                        </h3>

                        <div className="space-y-4">
                          {/* Event Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <span className="text-blue-400">📅</span>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Date</p>
                                <p className="text-gray-300">
                                  {formatDate(event.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <span className="text-purple-400">📍</span>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">
                                  Location
                                </p>
                                <p className="text-gray-300">
                                  {event.location}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Prize & Progress */}
                          <div className="pt-4 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Prize Pool
                                </p>
                                <p className="text-lg font-bold text-purple-400">
                                  ₹{event.prize.total}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Slots Filled
                                </p>
                                <p className="text-lg font-bold text-blue-400">
                                  {event.registeredTeams}/{event.maxTeams}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View More Button */}
            {isRoot && eventData.length > displayLimit && (
              <motion.div
                className="mt-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/events"
                  className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 group border border-purple-500/20"
                >
                  <span className="font-medium">Explore All Events</span>
                  <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
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
