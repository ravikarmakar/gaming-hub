import { AnimatePresence, motion } from "framer-motion";
import { EventCard } from "./EventCard";
import type { Event } from "./types";

interface EventGridProps {
  events: Event[];
  currentSlide?: number;
  isMobile?: boolean;
}

const EventGrid = ({
  events,
  currentSlide = 0,
  isMobile = false,
}: EventGridProps) => {
  if (!events?.length) {
    return (
      <div className="text-center text-gray-400 py-12">
        No events available at the moment
      </div>
    );
  }

  const displayEvents = isMobile
    ? events.slice(currentSlide * 2, (currentSlide + 1) * 2)
    : events;

  return (
    <motion.div
      className={`grid gap-6 sm:gap-8 ${
        isMobile
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      } max-w-[2000px] mx-auto`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {displayEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
            }}
          >
            <EventCard event={event} index={index} featured={index === 0} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventGrid;
