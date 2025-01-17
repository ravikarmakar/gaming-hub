import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const prizes = [
  {
    position: "1st Place",
    prize: "₹5,00,000",
    color: "from-yellow-400 to-yellow-600",
    icon: "🏆",
  },
  {
    position: "2nd Place",
    prize: "₹3,00,000",
    color: "from-gray-300 to-gray-500",
    icon: "🥈",
  },
  {
    position: "3rd Place",
    prize: "₹1,50,000",
    color: "from-amber-600 to-amber-800",
    icon: "🥉",
  },
];

export default function PrizeTiers() {
  return (
    <article className="relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Prize Pool</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {prizes.map((prize, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gray-800 p-8 rounded-2xl border border-purple-500/20">
                <div className="text-6xl mb-4">{prize.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {prize.position}
                </h3>
                <div
                  className={`text-4xl font-bold bg-gradient-to-r ${prize.color} text-transparent bg-clip-text`}
                >
                  {prize.prize}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </article>
  );
}
