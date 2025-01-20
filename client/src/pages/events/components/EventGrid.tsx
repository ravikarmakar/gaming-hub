import { motion, AnimatePresence } from "framer-motion";
import { EventCard } from "./EventCard";

import { Event } from "./types";

interface EventGridProps {
  events: Event[];
}

const EventGrid = ({ events }: EventGridProps) => {
  if (!events) return <div>Something went wrong</div>;
  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 lg:px-10">
      <AnimatePresence>
        {events.map((event, index) => (
          <EventCard event={event} index={index} key={event.id} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventGrid;
