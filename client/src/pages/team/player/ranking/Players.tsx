import { motion, AnimatePresence } from "framer-motion";
import RankCard from "./components/RankCard";

const TOP_PLAYERS = [
  {
    id: 1,
    name: "Simple",
    image: "/images/players/simple.jpg",
    score: 98,
    category: "CS:GO",
    achievement: "MVP at Major Championship 2024",
  },
  {
    id: 2,
    name: "Simple",
    image: "/images/players/simple.jpg",
    score: 98,
    category: "CS:GO",
    achievement: "MVP at Major Championship 2024",
  },

  {
    id: 3,
    name: "Simple",
    image: "/images/players/simple.jpg",
    score: 98,
    category: "CS:GO",
    achievement: "MVP at Major Championship 2024",
  },
  // Add more players here
];

export function Players() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-transparent blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TOP_PLAYERS.map((player, index) => (
              <RankCard
                key={player.id}
                rank={index + 1}
                name={player.name}
                image={player.image}
                score={player.score}
                category={player.category}
                achievement={player.achievement}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
