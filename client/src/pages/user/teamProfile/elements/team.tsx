import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  Users,
  Trophy,
  UserPlus,
  Twitter,
  Instagram,
  Globe,
  Shield,
  Medal,
  Share2,
  Plus,
  MessageSquare,
  Calendar,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";

// Dummy data (would typically come from backend/state management)
const teamData = {
  name: "Phoenix Assassins",
  logo: "/api/placeholder/200/200",
  coverImage:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2000&q=80",
  description: "Top-tier Free Fire competitive team",
  established: "2022",
  region: "Asia Pacific",
  achievements: [
    { title: "Regional Champions 2024", icon: "trophy" },
    { title: "Most Valuable Team 2023", icon: "award" },
    { title: "Rising Stars 2022", icon: "star" },
  ],
  currentSponsors: [
    { name: "Gaming Gear", logo: "/api/placeholder/100/100" },
    { name: "Energy Drinks", logo: "/api/placeholder/100/100" },
  ],
  stats: {
    ranking: "#5 Global",
    totalWins: 42,
    winRate: "68%",
    totalPrize: "$150,000",
    fanCount: "50K+",
  },
  upcomingEvents: [
    { name: "Free Fire World Series", date: "2025-02-15", type: "Major" },
    { name: "Asian Championship", date: "2025-03-01", type: "Regional" },
  ],
  members: [
    {
      id: 1,
      name: "Shadow Sniper",
      role: "Team Captain",
      avatar: "/api/placeholder/200/200",
      stats: {
        kills: "5000+",
        mvp: "150+",
        experience: "3 years",
      },
      socialLinks: {
        twitter: "https://twitter.com/shadowsniper",
        instagram: "https://instagram.com/shadowsniper",
      },
    },
    {
      id: 2,
      name: "Viper X",
      role: "Assault Specialist",
      avatar: "/api/placeholder/200/200",
      stats: {
        kills: "4500+",
        mvp: "120+",
        experience: "2 years",
      },
      socialLinks: {
        twitter: "https://twitter.com/viperx",
        instagram: "https://instagram.com/viperx",
      },
    },
    {
      id: 3,
      name: "Phoenix Blade",
      role: "Support",
      avatar: "/api/placeholder/200/200",
      stats: {
        kills: "3800+",
        mvp: "90+",
        experience: "2 years",
      },
      socialLinks: {
        twitter: "https://twitter.com/phoenixblade",
        instagram: "https://instagram.com/phoenixblade",
      },
    },
    {
      id: 4,
      name: "Storm Fury",
      role: "Sniper",
      avatar: "/api/placeholder/200/200",
      stats: {
        kills: "4200+",
        mvp: "110+",
        experience: "2.5 years",
      },
      socialLinks: {
        twitter: "https://twitter.com/stormfury",
        instagram: "https://instagram.com/stormfury",
      },
    },
  ],
  matchHistory: [
    {
      id: 1,
      tournament: "Free Fire Pro League",
      date: "2025-01-20",
      result: "Winner",
      points: 2500,
      highlight: "20 kills in final match",
    },
    {
      id: 2,
      tournament: "Asian Games",
      date: "2025-01-15",
      result: "2nd Place",
      points: 2000,
      highlight: "Clutch play in semi-finals",
    },
  ],
};

const TeamProfile: React.FC = () => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > (previous ?? 0) && latest > 100) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white">
      {/* Cover Image Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full"
      >
        <img
          src={teamData.coverImage}
          alt={`${teamData.name} Cover`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/90"></div>

        {/* Team Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              src={teamData.logo}
              alt={teamData.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-yellow-400 shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-300">
                {teamData.name}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mt-2">
                {teamData.description}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                <span className="bg-purple-800/50 px-3 py-1 rounded-full text-sm">
                  {teamData.region}
                </span>
                <span className="bg-purple-800/50 px-3 py-1 rounded-full text-sm">
                  Est. {teamData.established}
                </span>
                <span className="bg-purple-800/50 px-3 py-1 rounded-full text-sm">
                  {teamData.stats.fanCount} Fans
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Header */}
      <motion.header
        initial={false}
        animate={{
          opacity: isHeaderVisible ? 1 : 0,
          y: isHeaderVisible ? 0 : -100,
        }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-purple-900/80 backdrop-blur-md shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src={teamData.logo}
              alt={teamData.name}
              className="w-10 h-10 rounded-full border-2 border-yellow-400"
            />
            <h2 className="text-xl font-bold text-yellow-300 hidden sm:block">
              {teamData.name}
            </h2>
          </div>

          {/* Navigation Tabs */}
          {/* <nav className="hidden md:flex space-x-6">
            {["overview", "members", "matches", "achievements"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-yellow-300 border-b-2 border-yellow-300"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav> */}

          {/* <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Join</span>
            </motion.button>
          </div> */}
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Quick Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {Object.entries(teamData.stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-purple-800/50 p-4 rounded-xl text-center"
            >
              <h3 className="text-gray-400 text-sm capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <p className="text-xl font-bold text-yellow-300">{value}</p>
            </div>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div
          variants={itemVariants}
          className="bg-purple-800/50 p-6 rounded-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Award className="mr-3" /> Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teamData.achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="bg-purple-700/50 p-4 rounded-lg"
              >
                <h3 className="font-bold text-yellow-300">
                  {achievement.title}
                </h3>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          variants={itemVariants}
          className="bg-purple-800/50 p-6 rounded-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Calendar className="mr-3" /> Upcoming Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamData.upcomingEvents.map((event) => (
              <div key={event.name} className="bg-purple-700/50 p-4 rounded-lg">
                <span className="inline-block px-2 py-1 bg-blue-500 text-xs rounded-full mb-2">
                  {event.type}
                </span>
                <h3 className="font-bold">{event.name}</h3>
                <p className="text-sm text-gray-300">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team Members Section */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <Users className="mr-3" /> Team Members
            </h2>
            <motion.button
              onClick={() => setIsAddMemberModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors"
            >
              <Plus />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData.members.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ y: -5 }}
                className="bg-purple-800/50 p-6 rounded-xl"
              >
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto border-3 border-yellow-400 hover:border-4 transition-all duration-200"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-purple-900/90 rounded-full p-2">
                      <MessageSquare className="text-yellow-400" size={20} />
                    </div>
                  </motion.div>
                </div>

                <div className="text-center mt-4">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-yellow-300">{member.role}</p>

                  {/* Member Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                    {Object.entries(member.stats).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-purple-700/50 p-2 rounded-lg"
                      >
                        <p className="text-gray-400 capitalize">{key}</p>
                        <p className="font-bold">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-3 mt-4">
                    <motion.a
                      href={member.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2 }}
                      className="hover:text-blue-400 transition-colors"
                    >
                      <Twitter />
                    </motion.a>
                    <motion.a
                      href={member.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2 }}
                      className="hover:text-pink-500 transition-colors"
                    >
                      <Instagram />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Match History Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Trophy className="mr-3" /> Match History
          </h2>
          <div className="space-y-4">
            {teamData.matchHistory.map((match) => (
              <motion.div
                key={match.id}
                whileHover={{ x: 10 }}
                className="bg-purple-800/50 p-6 rounded-xl"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{match.tournament}</h3>
                    <p className="text-gray-400">{match.date}</p>
                    <p className="text-sm text-gray-300 mt-2">
                      {match.highlight}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p
                      className={`text-xl font-bold ${
                        match.result === "Winner"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {match.result}
                    </p>
                    <p className="text-gray-400">{match.points} Points</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Stats & Sponsors Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sponsors Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Shield className="mr-3" /> Sponsors
            </h2>
            <div className="bg-purple-800/50 p-6 rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {teamData.currentSponsors.map((sponsor) => (
                  <motion.div
                    key={sponsor.name}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-20 h-20 mx-auto rounded-full bg-white/10 p-2"
                    />
                    <p className="mt-2 font-medium">{sponsor.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Team Performance Stats */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <TrendingUp className="mr-3" /> Performance
            </h2>
            <div className="bg-purple-800/50 p-6 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-700/50 p-4 rounded-lg">
                  <p className="text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {teamData.stats.winRate}
                  </p>
                </div>
                <div className="bg-purple-700/50 p-4 rounded-lg">
                  <p className="text-gray-400">Total Prize</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {teamData.stats.totalPrize}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamProfile;
