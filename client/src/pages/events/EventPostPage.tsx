import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import useEventStore from "@/store/useEventStore";
import { useEffect, useState } from "react";
import {
  Trophy,
  MapPin,
  Clock,
  Share2,
  UserPlus,
  ChevronRight,
  Timer,
  Medal,
  Flag,
  Users2,
  Heart,
} from "lucide-react";
import { ActionButton } from "./single-event-components/QuickActions";

const EventDisplay = () => {
  const { id } = useParams();
  const { getOneEvent, selectedEvent } = useEventStore();

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      getOneEvent(id);
    }
  }, [id, getOneEvent]);

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-purple-500/20 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-purple-500/20 rounded"></div>
        </div>
      </div>
    );
  }
  console.log(selectedEvent);

  console.log("Selected Event Title:", selectedEvent.title);

  return (
    <div className="relative min-h-screen bg-transparent-to-b from-gray-900 via-transparent to-transparent">
      <div className="absolute h-auto inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl" />
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt={selectedEvent.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {selectedEvent.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 items-center text-gray-300 mb-4"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                {selectedEvent.game}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                {selectedEvent.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-400" />
                {selectedEvent.startDate}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 -mt-16 mb-8 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-purple-800/40 rounded-lg flex items-center gap-2 text-white font-semibold shadow-lg hover:bg-purple-800/60 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Register Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-gray-800 rounded-3xl md:rounded-lg flex items-center gap-2 text-white font-semibold shadow-lg hover:bg-gray-700 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="hidden md:inline">Share Event</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-rose-800/40 rounded-full md:rounded-lg flex items-center gap-2 text-white font-semibold shadow-lg hover:bg-rose-800/60 transition-colors"
          >
            <Heart className="h-5 w-5" />
            <span className="hidden md:inline">Like Event</span>
          </motion.button>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Users2,
              label: "Registered Teams",
              value: selectedEvent.attendees || "0",
              color: "from-green-500/20 to-green-600/20",
            },
            {
              icon: Timer,
              label: "Time Left",
              value: "2 Days",
              color: "from-blue-500/20 to-blue-600/20",
            },
            {
              icon: Medal,
              label: "Prize Pool",
              value: selectedEvent.category,
              color: "from-yellow-500/20 to-yellow-600/20",
            },
            {
              icon: Flag,
              label: "Total Slots",
              value: selectedEvent.slots,
              color: "from-purple-500/20 to-purple-600/20",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-white/10`}
            >
              <div className="flex items-center space-x-4">
                <stat.icon className="h-6 w-6 text-white/80" />
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 rounded-2xl p-6 backdrop-blur-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                About Event
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {selectedEvent.description}
              </p>
            </motion.div>

            {/* Rules Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 rounded-2xl p-6 backdrop-blur-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Event Rules
              </h2>
              <ul className="space-y-4">
                {[
                  "All participants must be registered before the deadline",
                  "Teams must consist of exactly the specified number of players",
                  "All players must be present at the scheduled match time",
                  "Use of any cheats or hacks will result in immediate disqualification",
                ].map((rule, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <ChevronRight className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Registration Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 rounded-2xl p-6 backdrop-blur-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Registration Info
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Status</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Open
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Entry Fee</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Team Size</span>
                  <span>{selectedEvent.slots} Players</span>
                </div>
                <button className="w-full px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition-colors">
                  Register Now
                </button>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 rounded-2xl p-6 backdrop-blur-xl border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  If you have any questions about the event, feel free to reach
                  out to our support team.
                </p>
                <button className="w-full px-6 py-3 bg-gray-700 rounded-lg text-white font-semibold hover:bg-gray-600 transition-colors">
                  Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDisplay;
