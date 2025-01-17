import { motion } from "framer-motion";
import { Users, Globe2 } from "lucide-react"; // Trophy
import { Team } from "./team";

interface TeamCardProps {
  team: Team;
  index: number;
}

export function TeamCard({ team, index }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-cyan-500/20 transition-all"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{team.name}</h3>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full">
            {team.rank}
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
          <div className="flex items-center">
            <Globe2 className="w-4 h-4 mr-1" />
            {team.region}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {team.members.length}/4
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">
            Recruiting:
          </h4>
          <div className="flex flex-wrap gap-2">
            {team.recruitingRoles.map((role) => (
              <span
                key={role}
                className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity">
          Apply to Join
        </button>
      </div>
    </motion.div>
  );
}
