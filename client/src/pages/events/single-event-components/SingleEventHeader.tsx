import { motion } from "framer-motion";

const event = {
  id: "1",
  title: "Cyber Gaming Championship 2025",
  description:
    "The ultimate gaming showdown featuring elite teams from across the globe",
  coverImage:
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  status: "live",
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

const SingleEventHeader = () => {
  // const [isLiked, setIsLiked] = useState(false);
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
          src={event.coverImage}
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
            {/* <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-4 rounded-full backdrop-blur-lg transition-all duration-300 ${
                isLiked ? "bg-rose-500/20" : "bg-zinc-800/50"
              }`}
            >
              <motion.svg
                animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
                className={`w-6 h-6 ${
                  isLiked ? "text-rose-500" : "text-zinc-400"
                }`}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </motion.svg>
            </motion.button> */}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SingleEventHeader;
