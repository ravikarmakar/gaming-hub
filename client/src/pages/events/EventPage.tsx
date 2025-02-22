import { useEventFilters } from "./hook/useEventFilters";
import PageLayout from "../PageLayout";

import { EventSearch } from "./components/EventSearch";

import { motion } from "framer-motion";

const EventsPage = () => {
  const { events, searchQuery, setSearchQuery } = useEventFilters();

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
              className="absolute inset-0 bg-purple-500/20 blur-xl"
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <EventSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id || index}
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
                    {event.date || "Coming Soon"}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium hover:bg-purple-500/30 transition-colors"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
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
