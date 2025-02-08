import { motion } from "framer-motion";
import { Gamepad, Globe, Star, Award } from "lucide-react";

export interface PlayerCardProps {
  id: string;
  name: string;
  role: string;
  subRole: string;
  tier: "Tier-I" | "Tier-II" | "Tier-III";
  experience: string;
  avatar: string;
  team: string;
  country: string;
  achievements: string;
  mainGame: "Free Fire" | "PUBG" | "Indus";
  deviceType: "iOS" | "Android";
  headShotRate: string;
  isPremium: boolean;
  viewCount: string;
  rating: string;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const PlayerCard = ({ player }: PlayerCardProps) => {
  return (
    <motion.div
      key={player.id}
      variants={itemVariants}
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 10px 20px rgba(51,102,255,0.7)",
      }}
      className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center"
    >
      <img
        src={player.avatar}
        alt={player.name}
        className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-purple-500"
      />
      <h2 className="text-2xl font-bold text-blue-400 mb-2">{player.name}</h2>
      <p className="text-sm text-gray-400 mb-4 italic">{player.team}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="flex items-center space-x-1 bg-blue-500 px-2 py-1 rounded-full">
          <Gamepad size={16} className="text-gray-100" />
          <span className="text-sm">{player.mainGame}</span>
        </div>
        <div className="flex items-center space-x-1 bg-purple-500 px-2 py-1 rounded-full">
          <Globe size={16} className="text-gray-100" />
          <span className="text-sm">{player.country}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="flex items-center justify-center space-x-2 bg-gray-700 p-2 rounded-lg">
          <Star className="text-yellow-500" size={16} />
          <span>{player.role}</span>
        </div>
        {/* <div
          className={`flex items-center justify-center space-x-2 ${
            player.tier === "Tir"
              ? "bg-blue-800 text-blue-300"
              : player.tier === "Platinum"
              ? "bg-purple-800 text-purple-300"
              : "bg-gray-700 text-gray-300"
          } p-2 rounded-lg`}
        >
          <Award size={16} />
          <span>{player.tier}</span>
        </div> */}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
