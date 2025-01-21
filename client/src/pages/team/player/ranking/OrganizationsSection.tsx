import { motion, AnimatePresence } from "framer-motion";
import RankCard from "./components/RankCard";

const TOP_ORGANIZATIONS = [
  {
    id: 1,
    name: "Team SoloMid",
    image: "/images/organizations/tsm.jpg",
    score: 95,
    category: "Multi-Gaming",
    achievement: "Most Valuable Esports Organization 2024",
  },
  // Add more organizations here
];

export function OrganizationsSection() {
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
            {TOP_ORGANIZATIONS.map((org, index) => (
              <RankCard
                key={org.id}
                rank={index + 1}
                name={org.name}
                image={org.image}
                score={org.score}
                category={org.category}
                achievement={org.achievement}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
