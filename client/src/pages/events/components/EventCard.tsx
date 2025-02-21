import { Timer, Users, MapPin, Calendar } from "lucide-react";
import { EventBadge } from "./EventBadge";
import { PrizeTier } from "./PrizeTier";
import type { Event } from "./types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface EventCardProps {
  event: Event;
  index: number;
  featured?: boolean;
}

export const EventCard = ({
  event,
  index,
  featured = false,
}: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
        featured ? "col-span-1 sm:col-span-2 lg:col-span-1" : ""
      }`}
    >
      {/* Card Background with Gaming Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#2563eb_0%,_transparent_70%)] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#7c3aed_0%,_transparent_70%)] opacity-10" />
      </div>

      {/* Glowing Border Effect */}
      <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <Link to={`/events/${event.id}`} className="block h-full relative">
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Event Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7 }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          <EventBadge
            status={event.status}
            className="absolute top-4 right-4 z-20"
          />
        </div>

        {/* Content */}
        <div className="relative p-6 z-20">
          <div className="space-y-4">
            {/* Title & Game */}
            <div>
              <motion.h3
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2 line-clamp-2 group-hover:from-cyan-400 group-hover:via-purple-400 group-hover:to-blue-400"
                transition={{ duration: 0.3 }}
              >
                {event.title}
              </motion.h3>
              <p className="text-base sm:text-lg text-gray-400">{event.game}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
              <motion.div
                className="flex items-center text-gray-400 group-hover:text-cyan-400 transition-colors"
                whileHover={{ x: 5 }}
              >
                <Calendar
                  size={18}
                  className="mr-2 text-cyan-500 flex-shrink-0"
                />
                <span className="truncate">{event.date}</span>
              </motion.div>
              <motion.div
                className="flex items-center text-gray-400 group-hover:text-purple-400 transition-colors"
                whileHover={{ x: 5 }}
              >
                <MapPin
                  size={18}
                  className="mr-2 text-purple-500 flex-shrink-0"
                />
                <span className="truncate">{event.location}</span>
              </motion.div>
            </div>

            {/* Prize Pool & Registration */}
            <div className="space-y-4">
              <div className="transform group-hover:scale-105 transition-transform duration-300">
                <PrizeTier tiers={event.prize.distribution} />
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base">
                <motion.div
                  className="flex items-center text-gray-400 group-hover:text-blue-400 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <Users size={18} className="mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {event.registeredTeams}/{event.maxTeams} Teams
                  </span>
                </motion.div>
                <motion.div
                  className="flex items-center text-cyan-400"
                  whileHover={{ x: -5 }}
                >
                  <Timer size={18} className="mr-2 flex-shrink-0" />
                  <span className="truncate font-medium">
                    {event.registrationEnds}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
