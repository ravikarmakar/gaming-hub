import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Users, Calendar, Trophy, Star, ArrowUpRight } from "lucide-react";
import { Event } from "@/types/event";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface TrendingEventCardProps {
  event: Event;
  index: number;
}

const TrendingEventCard = ({ event, index }: TrendingEventCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mounted, setMounted] = useState(false);

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);
  const glowX = useTransform(mouseX, [-100, 100], [0, 100]);
  const glowY = useTransform(mouseY, [-100, 100], [0, 100]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    animate(mouseX, 0);
    animate(mouseY, 0);
    setIsHovered(false);
  };

  return (
    <Link to={`/events/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: mounted ? 1 : 0, 
          y: mounted ? 0 : 50,
          transition: { delay: index * 0.2 }
        }}
        className="relative"
      >
        <motion.div
          style={{ 
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.02 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="group relative h-[450px] rounded-2xl overflow-hidden perspective"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(167, 139, 250, 0.3), transparent)`
              ),
              filter: "blur(1px)",
            }}
          />

          {/* Card content container */}
          <div className="absolute inset-[2px] rounded-2xl overflow-hidden bg-gray-900/95 p-1">
            <div className="relative h-56 overflow-hidden rounded-xl">
              <motion.img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
                style={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              
              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex gap-2 items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: index * 0.1 }}
                  className="px-3 py-1 rounded-full bg-violet-500/30 backdrop-blur-sm border border-violet-500/20"
                >
                  <span className="text-xs font-medium text-violet-200">{event.category}</span>
                </motion.div>
                {event.trending && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: index * 0.1 + 0.1 }}
                    className="px-3 py-1 rounded-full bg-rose-500/30 backdrop-blur-sm border border-rose-500/20"
                  >
                    <span className="text-xs font-medium text-rose-200 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Trending
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-fuchsia-200">
                  {event.title}
                </h3>
                
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span className="text-sm">{event.participants} Players</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 text-fuchsia-400" />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">{event.prizePool}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Learn More <ArrowUpRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Hover effects */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([gx, gy]) => `
                  radial-gradient(
                    circle at ${gx}% ${gy}%, 
                    rgba(139, 92, 246, 0.15), 
                    transparent 40%
                  )
                `
              ),
            }}
          />
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default TrendingEventCard;
