import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { eventData } from "@/lib/constants";
import EventGrid from "./components/EventGrid";

export default function FeaturedEvents() {
  const location = useLocation();

  // Check if we are at the root ('/')
  const isRoot = location.pathname === "/";

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl" />

      {/* top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-b from-black to-transparent" />

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black to-transparent" />

      <div className="container mx-auto px-6 relative">
        {isRoot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold font-orbitron"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Latest Events
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Discover and Join the Best Esports Tournaments Across All
              Organizations!
            </motion.p>
          </motion.div>
        )}

        {/* Event Grid */}
        <EventGrid events={eventData} />

        {isRoot && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/events">
              <button className="px-8 mt-10 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                View Events
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
