import PageLayout from "../PageLayout";
import { motion } from "framer-motion";
import useEventStore from "@/store/useEventStore";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router-dom";

const EventsPage = () => {
  const {
    events,
    fetchEvents,
    hasMore,
    setSearchQuery,
    searchQuery,
    loadMoreEvents,
    isLoading,
  } = useEventStore();

  const [query, setQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery !== searchQuery) {
      setSearchQuery(debouncedQuery);
    }
  }, [debouncedQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, searchQuery]);

  const handleLoadMore = async () => {
    if (hasMore) {
      await loadMoreEvents();
    }
  };

  console.log(events);

  return (
    <PageLayout
      title="Gaming Events Hub"
      description="Discover and join epic gaming tournaments, meetups, and competitions happening around the globe"
    >
      {/* Search and Filters Bar */}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events by title, game, or organizer..."
                  className="w-full px-6 py-4 bg-gray-900/50 rounded-2xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-500 pl-14"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      {isLoading && (
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading events...
          </span>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl"
          >
            {/* Event Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" />

            {/* Event Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={
                  event.image ||
                  "https://source.unsplash.com/random/800x600/?gaming"
                }
                alt={event.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F2D] to-transparent opacity-60" />

              {/* Registration Status */}
              <div className="absolute top-4 right-4">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === "closed"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  Registration {event.status || "Open"}
                </motion.span>
              </div>
            </div>

            {/* Event Details */}
            <div className="relative p-4">
              <h3 className="text-xl font-bold text-white mb-2">
                {event.title || "World Gaming Expo 2024"}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {event.game || "Multiple Games"}
              </p>

              {/* Event Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-purple-400 text-sm">
                    {event.startDate || "Coming Soon"}
                  </span>
                </div>
                <Link to={`/events/${event._id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium hover:bg-purple-500/30 transition-colors"
                  >
                    View Details
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="flex items-center justify-center mt-8 mb-12 cursor-pointer">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span className="text-sm cursor-pointer">
                    Load More Events
                  </span>
                  {events.length > 0 && (
                    <span className="text-sm opacity-75 cursor-pointer">
                      ({events.length} shown)
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-block p-6 bg-purple-500/10 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No Events Found
          </h3>
          <p className="text-gray-400">
            Try adjusting your filters or check back later for new events
          </p>
        </motion.div>
      )}
    </PageLayout>
  );
};

export default EventsPage;
