import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import useEventStore from "@/store/useEventStore";
import { useEffect } from "react";
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

const EventPostPage = () => {
  const { id } = useParams();
  const { getOneEvent, selectedEvent, regitserEvent, isLoading } =
    useEventStore();

  useEffect(() => {
    if (id) {
      getOneEvent(id);
    }
  }, [id, getOneEvent]);

  if (!selectedEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-32 h-32 mb-4 rounded-full bg-purple-500/20"></div>
          <div className="w-48 h-4 rounded bg-purple-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent-to-b from-gray-900 via-transparent to-transparent">
      <div className="absolute inset-0 h-auto bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl" />
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt={selectedEvent.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto max-w-7xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-bold text-white md:text-6xl"
            >
              {selectedEvent.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 mb-4 text-gray-300"
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                {selectedEvent.game}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                {selectedEvent.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                {selectedEvent.startDate}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* Quick Actions */}
        <div className="relative z-10 flex gap-4 mb-8 -mt-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => regitserEvent(selectedEvent._id)}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-colors rounded-lg shadow-lg bg-purple-800/40 hover:bg-purple-800/60"
          >
            <UserPlus className="w-5 h-5" />
            {isLoading ? "Registering..." : "Register Now"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-colors bg-gray-800 shadow-lg rounded-3xl md:rounded-lg hover:bg-gray-700"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden md:inline">Share Event</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-colors rounded-full shadow-lg bg-rose-800/40 md:rounded-lg hover:bg-rose-800/60"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden md:inline">Like Event</span>
          </motion.button>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
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
                <stat.icon className="w-6 h-6 text-white/80" />
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border bg-gray-800/30 rounded-2xl backdrop-blur-xl border-white/10"
            >
              <h2 className="mb-4 text-2xl font-bold text-white">
                About Event
              </h2>
              <p className="leading-relaxed text-gray-300">
                {selectedEvent.description}
              </p>
            </motion.div>

            {/* Rules Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border bg-gray-800/30 rounded-2xl backdrop-blur-xl border-white/10"
            >
              <h2 className="mb-4 text-2xl font-bold text-white">
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
                    <ChevronRight className="flex-shrink-0 w-5 h-5 mt-1 text-purple-400" />
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
              className="p-6 border bg-gray-800/30 rounded-2xl backdrop-blur-xl border-white/10"
            >
              <h2 className="mb-4 text-2xl font-bold text-white">
                Registration Info
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Status</span>
                  <span className="px-3 py-1 text-sm text-green-400 rounded-full bg-green-500/20">
                    Open
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Entry Fee</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Team Size</span>
                  <span>{selectedEvent.slots} Players</span>
                </div>
                <button className="w-full px-6 py-3 font-semibold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700">
                  Register Now
                </button>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border bg-gray-800/30 rounded-2xl backdrop-blur-xl border-white/10"
            >
              <h2 className="mb-4 text-2xl font-bold text-white">Need Help?</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  If you have any questions about the event, feel free to reach
                  out to our support team.
                </p>
                <button className="w-full px-6 py-3 font-semibold text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600">
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

export default EventPostPage;
