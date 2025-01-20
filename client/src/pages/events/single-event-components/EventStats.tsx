import { motion } from "framer-motion";
import { Event } from "../EventPostPage";

interface StatsProps {
  event: Event[];
}

const EventStats = ({ event }: StatsProps) => {
  // console.log(event);
  return (
    <article>
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Object.entries(event.stats).map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0px 0px 30px rgba(139, 92, 246, 0.7)",
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-gray-900 rounded-xl p-6 shadow-lg transition-all"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl blur-md opacity-30 z-0" />

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.h3
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-4xl font-extrabold bg-gradient-to-r from-cyan-300 to-pink-500 bg-clip-text text-transparent"
              >
                {value}
              </motion.h3>
              <p className="text-zinc-200 mt-2 text-sm sm:text-base">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent hover:border-gray-500 transition-all" />
          </motion.div>
        ))}
      </motion.div>
    </article>
  );
};

export default EventStats;
