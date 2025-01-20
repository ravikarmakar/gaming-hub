import { motion } from "framer-motion";
import { History, Users, Trophy, Gamepad } from "lucide-react";

const milestones = [
  {
    icon: History,
    title: "Founded",
    description: "Started our journey in 2020",
  },
  {
    icon: Users,
    title: "10M+ Players",
    description: "Growing community worldwide",
  },
  {
    icon: Trophy,
    title: "1000+ Tournaments",
    description: "Hosted successfully",
  },
  {
    icon: Gamepad,
    title: "100+ Games",
    description: "Carefully curated collection",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-b from-black to-gray-900"
    >
      {/* Content */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-orbitron mb-4">Our Journey</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Leading the future of competitive gaming with innovation and
            community at our core.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {milestones.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <item.icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
