import React from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaUsers, FaGamepad, FaMedal, FaDiscord, FaTwitch, FaTwitter } from "react-icons/fa";

interface TeamMember {
  id: string;
  username: string;
  role: string;
  avatar: string;
  stats: {
    wins: number;
    rank: string;
    rating: number;
  };
}

interface TeamProfileProps {
  teamName: string;
  teamLogo: string;
  description: string;
  members: TeamMember[];
  achievements: {
    title: string;
    date: string;
    description: string;
  }[];
}

const TeamProfile: React.FC<TeamProfileProps> = () => {
  // Static data for demonstration
  const teamData = {
    teamName: "Phantom Elite",
    teamLogo: "https://via.placeholder.com/150",
    description: "An elite professional gaming team dominating the competitive scene across multiple titles. Known for innovative strategies and clutch performances.",
    members: [
      {
        id: "1",
        username: "ShadowStrike",
        role: "Team Captain & IGL",
        avatar: "https://via.placeholder.com/150",
        stats: { wins: 342, rank: "Elite", rating: 2850 }
      },
      {
        id: "2",
        username: "NightHawk",
        role: "Entry Fragger",
        avatar: "https://via.placeholder.com/150",
        stats: { wins: 289, rank: "Master", rating: 2780 }
      },
      {
        id: "3",
        username: "VortexQueen",
        role: "Support & Strategist",
        avatar: "https://via.placeholder.com/150",
        stats: { wins: 275, rank: "Diamond", rating: 2690 }
      },
      {
        id: "4",
        username: "ThunderBolt",
        role: "Lurker",
        avatar: "https://via.placeholder.com/150",
        stats: { wins: 301, rank: "Master", rating: 2750 }
      },
      {
        id: "5",
        username: "SpecterBlade",
        role: "AWP Specialist",
        avatar: "https://via.placeholder.com/150",
        stats: { wins: 315, rank: "Elite", rating: 2820 }
      }
    ],
    achievements: [
      {
        title: "Global Championship 2024",
        date: "Dec 2024",
        description: "1st Place - International Gaming League Finals"
      },
      {
        title: "Regional Masters",
        date: "Oct 2024",
        description: "Champions of Asian Circuit - Perfect Run"
      },
      {
        title: "Pro League Season 8",
        date: "Aug 2024",
        description: "2nd Place - Global Pro League"
      },
      {
        title: "Summer Invitational",
        date: "Jun 2024",
        description: "Champions - Perfect Record in Groups"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#1a0b2e] to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Team Header */}
        <div className="bg-[rgba(16,16,28,0.8)] rounded-2xl p-8 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-lg opacity-75"></div>
              <img
                src={teamData.teamLogo}
                alt={teamData.teamName}
                className="relative w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/20"
              />
            </motion.div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                {teamData.teamName}
              </h1>
              <p className="text-gray-300 mt-2 max-w-2xl">{teamData.description}</p>
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-purple-400 hover:text-purple-300">
                  <FaDiscord size={24} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-purple-400 hover:text-purple-300">
                  <FaTwitch size={24} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-purple-400 hover:text-purple-300">
                  <FaTwitter size={24} />
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: FaTrophy, label: "Tournaments Won", value: "24" },
            { icon: FaUsers, label: "Active Members", value: teamData.members.length.toString() },
            { icon: FaGamepad, label: "Games Played", value: "486" },
            { icon: FaMedal, label: "Global Ranking", value: "#8" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-[rgba(16,16,28,0.8)] rounded-xl p-6 backdrop-blur-xl border border-purple-500/30 shadow-[0_4px_12px_rgba(139,92,246,0.25)]"
            >
              <stat.icon className="text-purple-500 text-3xl mb-2" />
              <h3 className="text-gray-400 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Team Members */}
        <div className="bg-[rgba(16,16,28,0.8)] rounded-2xl p-8 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6">
            Team Members
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamData.members.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ scale: 1.02 }}
                className="bg-[rgba(26,26,45,0.8)] rounded-xl p-6 border border-purple-500/20 shadow-[0_4px_12px_rgba(139,92,246,0.15)]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur opacity-75"></div>
                    <img
                      src={member.avatar}
                      alt={member.username}
                      className="relative w-16 h-16 rounded-full border-2 border-purple-500"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {member.username}
                    </h3>
                    <p className="text-purple-400 text-sm">{member.role}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center bg-black/20 rounded-lg p-3">
                  <div>
                    <p className="text-gray-400 text-xs">Wins</p>
                    <p className="text-white font-semibold text-lg">
                      {member.stats.wins}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Rank</p>
                    <p className="text-white font-semibold text-lg">
                      {member.stats.rank}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Rating</p>
                    <p className="text-white font-semibold text-lg">
                      {member.stats.rating}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[rgba(16,16,28,0.8)] rounded-2xl p-8 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6">
            Team Achievements
          </h2>
          <div className="space-y-4">
            {teamData.achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[rgba(26,26,45,0.8)] rounded-xl p-6 border border-purple-500/20 shadow-[0_4px_12px_rgba(139,92,246,0.15)]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {achievement.description}
                    </p>
                  </div>
                  <span className="text-purple-400 text-sm font-semibold bg-purple-500/10 px-3 py-1 rounded-full">
                    {achievement.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamProfile;
