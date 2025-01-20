import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface Prize {
  icon: JSX.Element;
  position: string;
  prize: string;
  color: string;
}

interface Event {
  distribution: Prize[];
}

interface PrizeTiersProps {
  event: Event;
}

export default function PrizeTiers({ event }: PrizeTiersProps) {
  return (
    <article className="relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 flex items-center gap-3"
        >
          <Trophy className="w-10 h-10 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Prize Distributions</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {event.distribution.map((prize, index) => (
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
