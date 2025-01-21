import { motion, AnimatePresence } from "framer-motion";
import RankCard from "./components/RankCard";

const TOP_YOUTUBERS = [
  {
    id: 1,
    name: "PewDiePie",
    image: "/images/youtubers/pewdiepie.jpg",
    score: 110000000,
    category: "Gaming & Entertainment",
    achievement: "Most Subscribed Individual Creator",
  },
  // Add more YouTubers here
];

export function YouTubersSection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TOP_YOUTUBERS.map((youtuber, index) => (
              <RankCard
                key={youtuber.id}
                rank={index + 1}
                name={youtuber.name}
                image={youtuber.image}
                score={youtuber.score}
                category={youtuber.category}
                achievement={youtuber.achievement}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// Gradients

// "bg-gradient-to-r from-red-500 to-purple-500 text-white"
// "bg-gray-800 text-gray-400 hover:bg-gray-700"
