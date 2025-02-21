import React, { useState } from "react";
import {
  Gamepad2,
  Heart,
  MessageCircle,
  Share2,
  //Trophy,
  Users2,
  //Target,
  //Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@/types";

const playerData = {
  id: "FF_123456",
  username: "DragonSlayer",
  nickname: "Shadow",
  level: 75,
  rank: "Heroic",
  tier: "II",
  game: "Free Fire",
  temaName: "ProPlayz Esports",
  totalMatches: 12547,
  winRate: 78,
  killStats: {
    total: 48293,
    headshots: 28976,
    longRange: 12435,
    melee: 1842,
  },
  coverImage:
    "https://images.unsplash.com/photo-1640955011254-39734e60b16f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGdhbWVyfGVufDB8fDB8fHww",
  avatar:
    "https://plus.unsplash.com/premium_photo-1680124607787-9e54118b1624?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2FtZXJ8ZW58MHx8MHx8fDA%3D",
  verified: true,
  stats: {
    kills: 15420,
    winRate: "68%",
    kd: "4.2",
    matches: 3500,
    playTime: "2000h+",
  },
  guild: {
    name: "Phoenix Elite",
    role: "Guild Leader",
  },
  achievements: {
    total: 145,
    featured: "Season 25 Grandmaster",
  },
};

interface IconButtonProps {
  icon: React.ReactNode;
}

interface ProfileHeaderProps {
  user: User;
}
// Helper Components
// const StatCard = ({ icon, label, value }: StatCardProps) => (
//   <div className="flex flex-col items-center md:items-start p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
//     <div className="flex items-center gap-2 text-gray-400 text-sm">
//       {icon}
//       <span>{label}</span>
//     </div>
//     <span className="text-lg font-semibold text-white mt-1">{value}</span>
//   </div>
// );

const IconButton = ({ icon }: IconButtonProps) => (
  <button className="p-2 rounded-lg bg-white/20 hover:bg-white/10 transition-colors">
    {icon}
  </button>
);

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="relative w-full overflow-hidden mt-[64px]">
      {/* Animated Background Gradients */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </motion.div>

      {/* Cover Image */}
      <motion.div
        className="relative w-full h-[32vh] md:h-[50vh] -mt-[64px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A1F]" />
        <img
          src={playerData.coverImage}
          alt="Profile Cover"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Profile Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 md:px-8 lg:px-16 -mt-32 md:-mt-40"
      >
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center gap-6 md:gap-8"
          >
            {/* Avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Avatar Container */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-purple-500/30 bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <img
                  src={playerData.avatar}
                  alt={user?.name}
                  className="w-full h-full object-cover rounded-full" // Applying rounded-full to make it a circle
                />
              </div>

              {/* Level Badge */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Tier-{playerData.tier}
              </div>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center md:justify-start gap-3"
              >
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {user?.name}
                </h1>
                {/* Verified Icon added here */}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-2 text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-4"
              >
                <span className="flex items-center font-semibold gap-2">
                  <Gamepad2 className="w-5 h-5 text-green-500" />
                  {playerData.game}
                </span>
                <span className="flex items-center font-semibold gap-2">
                  <Users2 className="w-4 h-4 text-yellow-400" />
                  {playerData.temaName}
                </span>
              </motion.div>

              {/* Stats */}
              {/* <motion.div
                variants={itemVariants}
                className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <StatCard
                  icon={<Target className="w-5 h-5 text-red-400" />}
                  label="K/D Ratio"
                  value={playerData.stats.kd}
                />
                <StatCard
                  icon={<Trophy className="w-5 h-5 text-yellow-400" />}
                  label="Win Rate"
                  value={playerData.stats.winRate}
                />
                <StatCard
                  icon={<Gamepad2 className="w-5 h-5 text-blue-400" />}
                  label="Matches"
                  value={playerData.stats.matches}
                />
                <StatCard
                  icon={<Clock className="w-5 h-5 text-purple-400" />}
                  label="Play Time"
                  value={playerData.stats.playTime}
                />
              </motion.div> */}
            </div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                  isFollowing
                    ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFollowing ? "fill-purple-300" : ""}`}
                />
                {isFollowing ? "Following" : "Follow"}
              </button>
              <IconButton icon={<MessageCircle className="w-5 h-5" />} />
              <IconButton icon={<Share2 className="w-5 h-5" />} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileHeader;
