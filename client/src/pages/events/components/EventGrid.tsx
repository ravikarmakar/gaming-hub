import { AnimatePresence, motion } from "framer-motion";
import { EventCard } from "./EventCard";
import type { Event } from "./types";

interface EventGridProps {
  events: Event[];
}

const EventGrid = ({ events }: EventGridProps) => {
  if (!events?.length) {
    return (
      <div className="text-center text-gray-400 py-12">
        No events available at the moment
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 max-w-[2000px] mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="popLayout">
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventGrid;
