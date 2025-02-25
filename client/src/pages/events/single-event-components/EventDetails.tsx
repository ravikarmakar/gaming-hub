import { motion } from "framer-motion";
import { Trophy, Calendar, MapPin, Gamepad2 } from "lucide-react";
import { Event } from "@/types";

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="relative container py-10">
      {/* Title */}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
          >
            Event Details
          </motion.h2>

          <div className="space-y-4">
            <motion.h2
              className="text-xl font-extrabold text-gray-400"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              viewport={{ once: true }}
            >
              <span className="text-gray-400">Organized By - </span>
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {event.slots}
              </span>
            </motion.h2>

            {[
              { icon: MapPin, text: event.location },
              { icon: Gamepad2, text: event.mode },
              // { icon: Clock, text: event.time },
              { icon: Trophy, text: event.category },
              { icon: Calendar, text: event.attendees },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-4 group"
                variants={itemVariants}
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                  <item.icon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-900/50 to-purple-900/50 p-8 rounded-2xl shadow-xl transform transition-transform hover:rotate-3 hover:scale-105"
          style={{
            perspective: "1000px",
            boxShadow: "0 20px 50px rgba(128, 90, 213, 0.5)", // Adds depth
          }}
        >
          <h3 className="text-2xl font-bold text-purple-400 mb-6">
            Registration Status
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Registration Closes In
              </div>
              <div className="text-4xl font-bold text-white">14 Days</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Slots Remaining</div>
              <div className="text-4xl font-bold text-white">42/500</div>
            </div>
            <motion.button
              whileHover={{
                scale: 1.1,
                background:
                  "linear-gradient(to right, #38b2ac, #2c5282, #5a67d8)", // Teal to Navy Blue to Indigo
                boxShadow: "0px 6px 25px rgba(58, 150, 200, 0.6)", // Glow effect with teal shade
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-full relative bg-gradient-to-r from-teal-600 to-indigo-600 via-blue-900 text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400"
            >
              Register Now
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
