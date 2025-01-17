import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SingleEventHeader from "./single-event-components/SingleEventHeader";
import { TopWinners } from "./single-event-components/TopWinners";
import PrizeTiers from "./single-event-components/PrizeTiers";

import LeaderBoard from "./single-event-components/Leaderboard";
import { Star, Share2, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
// import { useEvent } from "./Event";
import EventStatus from "./single-event-components/EventStatus";
import { EventRules } from "./single-event-components/EventRules";
import GamingEventPortal, {
  EventDetails,
} from "./single-event-components/EventDetails";
// import { Sponsors } from "./single-event-components/Sponsers";

// Custom Button Component
const Button = ({ children, variant = "primary", onClick, className = "" }) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
    outline:
      "border border-zinc-700 hover:border-violet-500 text-zinc-300 hover:text-violet-400",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

// Custom Card Component
const Card = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-zinc-900/80 backdrop-blur-lg rounded-xl border border-zinc-800 p-6 ${className}`}
  >
    {children}
  </motion.div>
);

// Badge Component

const EventDisplay = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { id } = useParams();

  // const event = useEvent(id);

  // Function to handle copy action
  const handleCopy = () => {
    const currentURL = window.location.href; // Get the current URL
    navigator.clipboard.writeText(currentURL); // Copy to clipboard
    setIsCopied(true); // Set copied state
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  const event = {
    id: "1",
    title: "Cyber Gaming Championship 2025",
    description:
      "The ultimate gaming showdown featuring elite teams from across the globe",
    coverImage: "/api/placeholder/1200/400",

    date: "March 15-20, 2025",
    venue: "CyberArena, Silicon Valley",
    prize: {
      total: "$250,000",
      distribution: [
        { position: 1, amount: "$125,000", team: "TBD" },
        { position: 2, amount: "$75,000", team: "TBD" },
        { position: 3, amount: "$50,000", team: "TBD" },
      ],
    },
    status: "registration-open",
    stats: {
      registeredTeams: 64,
      totalPlayers: 320,
      viewerCount: "4.2M",
      prizePool: "$250K",
    },
    schedule: [
      { phase: "Registration", date: "Jan 1 - Feb 15", completed: true },
      { phase: "Qualifiers", date: "Feb 20 - Mar 1", completed: true },
      { phase: "Group Stage", date: "Mar 15-17", completed: false },
      { phase: "Finals", date: "Mar 19-20", completed: false },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const eventStats = {
    daysLeft: 14,
    totalSlots: 500,
    remainingSlots: 42,
    registrationEndDate: "Feb 28, 2024",
  };

  return (
    <div className="relative min-h-screen inset-0 bg-gradient-to-t from-black via-transparent to-transparent text-zinc-100">
      {/* Background Gradient */}
      <div className="absolute h-auto inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl" />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 py-20 space-y-8"
      >
        {/* Hero Section */}
        <SingleEventHeader />

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <AnimatePresence>
            {isCopied && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-200 text-xs sm:text-sm px-4 py-2 rounded-lg shadow-md"
              >
                Link copied to clipboard!
              </motion.div>
            )}
          </AnimatePresence>
          {/* Event Status*/}
          <EventStatus status={event.status} />

          {/* Like button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`p-4 rounded-full backdrop-blur-lg transition-all duration-300 ${
              isLiked ? "bg-rose-500/20" : "bg-zinc-800/50"
            }`}
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
              className={`h-6 w-6 ${
                isLiked ? "text-rose-500" : "text-zinc-400"
              }`}
            >
              <Heart fill={isLiked ? "currentColor" : "none"} />
            </motion.div>
          </motion.button>
          {/* Star Rating Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRated(!isRated)}
            className={`p-4 rounded-full backdrop-blur-lg transition-all duration-300 ${
              isRated ? "bg-yellow-500/20" : "bg-zinc-800/50"
            }`}
          >
            <motion.div
              animate={{ scale: isRated ? [1, 1.2, 1] : 1 }}
              className={`w-6 h-6 ${
                isRated ? "text-yellow-500" : "text-zinc-400"
              }`}
            >
              <Star fill={isRated ? "currentColor" : "none"} />
            </motion.div>
          </motion.button>
          {/* Share Button */}
          <div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-4 rounded-full bg-zinc-800/50 backdrop-blur-lg transition-all duration-300 hover:bg-zinc-700"
            >
              <Share2 className="w-6 h-6 text-zinc-400" />
            </motion.button>
            {isCopied ? "copied" : ""}
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Event Details */}
        <EventDetails />
        {/* <GamingEventPortal eventStats={eventStats} /> */}

        {/* Prize Pool */}
        <PrizeTiers />

        {/* Tournament Schedule */}
        <Card>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Event Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-800" />
            {event.schedule.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-10 pb-8 last:pb-0"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className={`absolute left-2 w-4 h-4 rounded-full border-2 top-1.5
                    ${
                      phase.completed
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-zinc-600 bg-zinc-800"
                    }`}
                />
                <div>
                  <h3 className="font-semibold text-lg text-zinc-200">
                    {phase.phase}
                  </h3>
                  <p className="text-zinc-400">{phase.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Top winners  */}

        <TopWinners />

        {/* Leaderboard */}

        <LeaderBoard />

        {/* Event Rules */}
        <EventRules />

        {/* Sponsers */}
        {/* <Sponsors /> */}
      </motion.div>
    </div>
  );
};

export default EventDisplay;
