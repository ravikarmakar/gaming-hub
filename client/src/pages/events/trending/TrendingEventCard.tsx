import { motion } from "framer-motion";
import { Users, Calendar, Trophy, Star, Globe, MapPin } from "lucide-react";
import { Event } from "@/types/event";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface TrendingEventCardProps {
  event: Event;
  index: number;
}

const TrendingEventCard = ({ event, index }: TrendingEventCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link to={`/events/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: mounted ? 1 : 0,
          y: mounted ? 0 : 50,
          transition: { delay: index * 0.2 },
        }}
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative min-h-[450px] rounded-xl bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-gray-950/95 border border-gray-800/50 backdrop-blur-xl overflow-hidden flex flex-col shadow-xl shadow-violet-500/5"
        >
          {/* Image container with overlay */}
          <div className="relative h-48 shrink-0 overflow-hidden">
            <motion.img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              style={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1.5 rounded-lg bg-violet-500/20 backdrop-blur-md border border-violet-500/20"
              >
                <span className="text-xs font-medium text-violet-200">
                  {event.category}
                </span>
              </motion.div>
            </div>

            {/* Trending badge */}
            {event.trending && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 backdrop-blur-md border border-rose-500/20"
              >
                <Star
                  className="w-3.5 h-3.5 text-rose-300"
                  fill="currentColor"
                />
                <span className="text-xs font-medium text-rose-200">
                  Trending
                </span>
              </motion.div>
            )}
          </div>

          {/* Content section */}
          <div className="relative flex-grow p-6 flex flex-col gap-4">
            {/* Title and description */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-violet-200 to-rose-200 bg-clip-text text-transparent">{event.title}</h3>
              <p className="text-md tracking-tight text-gray-300">
                {event.game}
              </p>
            </div>

            {/* Host and Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-blue-500/15 px-3 py-2 rounded-lg border border-blue-500/10 hover:bg-blue-500/20 transition-colors">
                <Users className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-200 truncate">
                  {event.host}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/15 px-3 py-2 rounded-lg border border-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                {event.mode === "online" ? (
                  <Globe className="w-4 h-4 text-emerald-300" />
                ) : (
                  <MapPin className="w-4 h-4 text-emerald-300" />
                )}
                <span className="text-sm text-emerald-200 capitalize truncate">
                  {event.mode.length > 10
                    ? `${event.mode.slice(0, 10)}...`
                    : event.mode}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 bg-fuchsia-500/15 px-3 py-2 rounded-lg border border-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-colors">
              <Calendar className="w-4 h-4 text-fuchsia-300" />
              <span className="text-sm text-fuchsia-200">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/10">
                  <Users className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {event.participants}
                  </p>
                  <p className="text-xs text-gray-400">Players</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/10">
                  <Trophy className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {event.prizePool}
                  </p>
                  <p className="text-xs text-gray-400">Prize Pool</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hover accent */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
            style={{
              background: `
                linear-gradient(to bottom,
                  transparent,
                  transparent 60%,
                  rgba(139, 92, 246, 0.1)
                )
              `,
            }}
          />
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default TrendingEventCard;
