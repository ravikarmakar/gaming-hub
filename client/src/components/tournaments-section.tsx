import { motion } from "framer-motion";
import { TournamentCard } from "./tournament-card";
import { ACTIVE_TOURNAMENTS } from "@/lib/constants";

export function TournamentsSection() {
  return (
    <section id="tournaments" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-orbitron mb-4">
            Live Tournaments
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join competitive matches and win amazing prizes!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ACTIVE_TOURNAMENTS.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TournamentCard tournament={tournament} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
