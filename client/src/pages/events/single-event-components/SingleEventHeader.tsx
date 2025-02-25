import { motion } from "framer-motion";
import { Event } from "@/types";

interface SingleEventHeaderProps {
  event: Event;
}

const SingleEventHeader = ({ event }: SingleEventHeaderProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden h-[500px] group"
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-8"
        >
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                {event.title}
              </h1>
              <p className="text-zinc-300 text-lg max-w-2xl">
                {event.description}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SingleEventHeader;
