import { motion } from "framer-motion";
import { ChevronRight, Gamepad2, Trophy, Users, Zap } from "lucide-react";

export const GameLinks = () => {
  const links = [
    { icon: Gamepad2, label: "Action Games", count: "2.4k" },
    { icon: Trophy, label: "Tournaments", count: "120+" },
    { icon: Users, label: "Community", count: "15k" },
    { icon: Zap, label: "Live Events", count: "24/7" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-white font-orbitron font-bold flex items-center">
        <ChevronRight className="w-5 h-5 text-cyan-500" />
        Popular Categories
      </h3>
      <div className="space-y-3">
        {links.map(({ icon: Icon, label, count }, index) => (
          <motion.a
            key={label}
            href="#"
            className="group flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-gray-700/50 hover:border-cyan-500/50 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-gray-700/50 flex items-center justify-center group-hover:text-cyan-400 transition-colors">
                <Icon size={18} />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {label}
              </span>
            </div>
            <span className="text-xs text-cyan-400 font-mono">{count}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
};
