import { motion } from "framer-motion";
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Gamepad2,
} from "lucide-react";

const rules = [
  {
    title: "Team Requirements",
    icon: Users,
    rules: [
      "Teams must consist of 3-5 players",
      "All players must be 16+ years old",
      "Each team must have a designated captain",
    ],
  },
  {
    title: "Match Rules",
    icon: Gamepad2,
    rules: [
      "Standard tournament format applies",
      "Best of 3 matches in preliminaries",
      "Best of 5 matches in finals",
    ],
  },
  {
    title: "Schedule & Timing",
    icon: Clock,
    rules: [
      "Check-in 1 hour before match time",
      "15-minute grace period maximum",
      "Breaks between matches: 10 minutes",
    ],
  },
  {
    title: "Fair Play",
    icon: Shield,
    rules: [
      "No third-party software allowed",
      "Voice communication mandatory",
      "Streaming delay minimum 2 minutes",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function EventRules() {
  return (
    <div className="relative py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Tournament Rules
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ensure fair play and maximum enjoyment for all participants
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {rules.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.rules.map((rule, ruleIndex) => (
                      <motion.li
                        key={ruleIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: ruleIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-2xl border border-red-500/20"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-bold text-red-400 mb-2">
                Important Notice
              </h4>
              <p className="text-gray-300">
                Violation of any rules may result in immediate disqualification
                and forfeit of any prizes. Tournament administrators' decisions
                are final.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
