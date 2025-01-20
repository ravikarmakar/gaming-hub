import { Timer, Users, MapPin, Calendar } from "lucide-react";
import { Button } from "../../../components/elements/Button";
import { EventBadge } from "./EventBadge";
import { PrizeTier } from "./PrizeTier";
import type { Event } from "./types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface EventCardProps {
  event: Event;
  index: number;
}

export const EventCard = ({ event, index }: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
    >
      <Link to={`/events/${event.id}`}>
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          <EventBadge
            status={event.status}
            className="absolute top-4 right-4"
          />
          {}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Title & Game */}
            <div>
              <h3 className="text-xl font-orbitron font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                {event.title}
              </h3>
              <p className="text-gray-400">{event.game}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-400">
                <Calendar size={16} className="mr-2 text-cyan-500" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin size={16} className="mr-2 text-purple-500" />
                <span>{event.location}</span>
              </div>
            </div>

            {/* Prize Pool & Registration */}
            <div className="space-y-4">
              <PrizeTier tiers={event.prize.distribution} />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400">
                  <Users size={16} className="mr-2" />
                  <span>
                    {event.registeredTeams}/{event.maxTeams} Teams
                  </span>
                </div>
                <div className="flex items-center text-cyan-400">
                  <Timer size={16} className="mr-2" />
                  <span>{event.registrationEnds}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {/* <Button
              variant="register"
              className="w-full group-hover:animate-pulse"
            >
              Register Now
            </Button> */}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
