import { motion } from "framer-motion";
import { FC } from 'react';

interface RankCardProps {
  rank: number;
  name: string;
  image: string;
  score: number;
  category: string;
  achievement?: string;
}

const RankCard: FC<RankCardProps> = ({
  rank,
  name,
  image,
  score,
  category,
  achievement,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-2xl" />

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {rank}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-gray-400 text-sm">{category}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
            {score}
          </div>
          <p className="text-gray-400 text-sm">points</p>
        </div>
      </div>

      {achievement && (
        <div className="mt-3 text-sm text-gray-400">
          <span className="text-cyan-500">Latest Achievement:</span>{" "}
          {achievement}
        </div>
      )}
    </motion.div>
  );
}

export default RankCard;
