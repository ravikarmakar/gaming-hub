/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  // Plus,
  UserPlus,
  Gamepad2,
  Shield,
  Medal,
  // Heart,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  Award,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
// import { Team } from "@/types/team";
// import { User } from "@/types";

// Dummy data (would typically come from backend/state management)
const teamData = {
  name: "Phoenix Assassins",
  logo: "https://plus.unsplash.com/premium_photo-1677870728119-52aef052d7ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Z2FtaW5nfGVufDB8fDB8fHww",
  description: "Top-tier Free Fire competitive team",
  currentSponsors: [
    { name: "Gaming Gear", logo: "/api/placeholder/100/100" },
    { name: "Energy Drink Co", logo: "/api/placeholder/100/100" },
  ],
  members: [
    {
      id: 1,
      name: "FireKing",
      avatar:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D",
      role: "Captain",
      socialLinks: {
        twitter: "https://twitter.com/fireking",
        instagram: "https://instagram.com/fireking",
      },
    },
    {
      id: 2,
      name: "ShadowSniper",
      avatar:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D",
      role: "Sniper",
      socialLinks: {
        twitter: "https://twitter.com/shadowsniper",
        instagram: "https://instagram.com/shadowsniper",
      },
    },
    {
      id: 3,
      name: "ShadowSniper",
      avatar:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D",
      role: "Sniper",
      socialLinks: {
        twitter: "https://twitter.com/shadowsniper",
        instagram: "https://instagram.com/shadowsniper",
      },
    },
    {
      id: 4,
      name: "ShadowSniper",
      avatar:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D",
      role: "Sniper",
      socialLinks: {
        twitter: "https://twitter.com/shadowsniper",
        instagram: "https://instagram.com/shadowsniper",
      },
    },
    {
      id: 5,
      name: "ShadowSniper",
      avatar:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D",
      role: "Sniper",
      socialLinks: {
        twitter: "https://twitter.com/shadowsniper",
        instagram: "https://instagram.com/shadowsniper",
      },
    },
    {
      id: 6,
      name: "ShadowSniper",
      avatar:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdhbWluZ3xlbnwwfHwwfHx8MA%3D%3D",
      role: "Sniper",
      socialLinks: {
        twitter: "https://twitter.com/shadowsniper",
        instagram: "https://instagram.com/shadowsniper",
      },
    },
    // Add more members...
  ],
  matchHistory: [
    {
      id: 1,
      tournament: "World Free Fire Championship",
      date: "2024-01-15",
      result: "2nd Place",
      points: 980,
    },
    {
      id: 2,
      tournament: "Regional Qualifier",
      date: "2024-02-01",
      result: "1st Place",
      points: 1200,
    },
  ],
};

const teamStats = {
  winRate: "75%",
  totalMatches: 156,
  tournamentsWon: 12,
  currentStreak: 5,
  ranking: "#3",
  totalFollowers: "25.6K",
};

const TeamProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { seletedTeam, fetchOneTeam, teamJoinRequest } = useTeamStore();
  // const [activeTab, setActiveTab] = useState("overview");
  // const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  // const [teamProfileData, setTeamProfileData] = useState<Team | null>(null);
  // const [isFollowing, setIsFollowing] = useState(false);
  // const [member, setMember] = useState<null | User>(null);

  const activeTeam = user?.activeTeam || null;

  useEffect(() => {
    if (id) {
      fetchOneTeam(id);
    } else if (activeTeam) {
      fetchOneTeam(activeTeam);
    } else {
      navigate("/create-team");
    }
  }, [id, activeTeam]);

  const isTeamMember = user?.activeTeam === seletedTeam?._id;

  useEffect(() => {
    if (isTeamMember) {
      navigate("/team-profile");
    }
  }, [isTeamMember]);

  const handleTeamJoinRequest = () => {
    if (!seletedTeam?._id) {
      console.log("No team selected");
      return;
    }

    teamJoinRequest(seletedTeam?._id);
  };

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
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-purple-900/40 to-blue-900/30 text-white">
      {/* Cover Image */}
      <div className="relative h-[300px] md:h-[400px] w-full">
        <img
          src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2FtaW5nfGVufDB8fDB8fHww"
          alt="Team Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070715]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Team Header */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:space-x-6">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={teamData.logo}
                  alt={`${teamData.name} Logo`}
                  className="w-32 h-32 rounded-full border-4 ring-4 ring-blue-600/50 border-purple-400/50 shadow-lg"
                />
                <div className="text-center md:text-left mt-4 md:mt-0">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text text-transparent">
                    {seletedTeam?.teamName}
                  </h1>
                  <p className="text-lg text-gray-300 mt-2">
                    {teamData.description}
                  </p>
                  <div className="flex items-center justify-center md:justify-start space-x-4 mt-4">
                    <span className="flex items-center">
                      <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                      {teamStats.tournamentsWon} Tournaments
                    </span>
                    <span className="flex items-center">
                      <Users className="w-5 h-5 text-blue-400 mr-2" />
                      {teamStats.totalFollowers} Followers
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`${
                    isFollowing
                      ? "bg-purple-700 text-white"
                      : "bg-purple-500 text-white"
                  } px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-all duration-300`}
                >
                  <Heart
                    className={`${isFollowing ? "fill-current" : ""}`}
                    size={20}
                  />
                  <span>{isFollowing ? "Following" : "Follow Team"}</span>
                </motion.button> */}
                {isTeamMember ? (
                  ""
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTeamJoinRequest}
                    className="bg-blue-500 px-6 py-3 rounded-full flex items-center justify-center space-x-2"
                  >
                    <UserPlus size={20} />
                    <span>Join Team</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            {[
              { icon: TrendingUp, label: "Win Rate", value: teamStats.winRate },
              {
                icon: Gamepad2,
                label: "Matches",
                value: teamStats.totalMatches,
              },
              {
                icon: Trophy,
                label: "Tournaments",
                value: teamStats.tournamentsWon,
              },
              {
                icon: Star,
                label: "Current Streak",
                value: teamStats.currentStreak,
              },
              { icon: Award, label: "Ranking", value: teamStats.ranking },
              {
                icon: Users,
                label: "Followers",
                value: teamStats.totalFollowers,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center text-center"
              >
                <stat.icon className="w-6 h-6 mb-2 text-yellow-400" />
                <span className="text-sm text-gray-300">{stat.label}</span>
                <span className="text-xl font-bold">{stat.value}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Team Members Section */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <Users className="mr-3" /> Team Members
              </h2>
              {/* <motion.button
                onClick={() => setIsAddMemberModalOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-purple-600 text-white p-3 rounded-full"
              >
                {seletedTeam?.owner ? <Plus /> : <TbDoorExit />}
              </motion.button> */}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {seletedTeam?.members.map((member) => (
                <Link to={`/profile/${member?.userId?._id}`}>
                  <motion.div
                    key={member?.userId._id}
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-xl text-center"
                  >
                    <img
                      src={member.userId?.avatar}
                      alt={member.role}
                      className="lg:w-32 lg:h-32 h-24 w-24 rounded-full mx-auto mb-4 border-3 object-cover border-yellow-400"
                    />
                    <h3 className="text-md sm:text-lg font-bold">
                      {member.userId.name}
                    </h3>
                    <p className="text-sm sm:text-base">{member.role}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Matches */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-3" /> Upcoming Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((match) => (
                <motion.div
                  key={match}
                  whileHover={{ scale: 1.02 }}
                  className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-yellow-400">Tournament Name</span>
                    <Clock className="text-gray-400" size={16} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/team1-logo.png"
                        alt="Team 1"
                        className="w-8 h-8 rounded-full"
                      />
                      <span>Team A</span>
                    </div>
                    <span className="text-lg font-bold">VS</span>
                    <div className="flex items-center space-x-2">
                      <span>Team B</span>
                      <img
                        src="/team2-logo.png"
                        alt="Team 2"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-300 text-center">
                    Tomorrow at 8:00 PM
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Match History & Sponsors */}
          <div className="grid grid-cols-2 gap-10">
            {/* Match History */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-semibold mb-6 flex items-center">
                <Trophy className="mr-3" /> Match History
              </h2>
              <div className="space-y-4">
                {teamData.matchHistory.map((match) => (
                  <motion.div
                    key={match.id}
                    whileHover={{ x: 10 }}
                    className="bg-purple-800/50 p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{match.tournament}</h3>
                        <p className="text-gray-400">{match.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">
                          {match.result}
                        </p>
                        <p className="text-sm">{match.points} Points</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sponsors & Team Status */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-semibold mb-6 flex items-center">
                <Shield className="mr-3" /> Sponsors & Status
              </h2>
              <div className="space-y-6">
                <div className="bg-purple-800/50 p-6 rounded-xl">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Gamepad2 className="mr-3" /> Current Sponsors
                  </h3>
                  <div className="flex space-x-6">
                    {teamData.currentSponsors.map((sponsor) => (
                      <div key={sponsor.name} className="text-center">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="w-20 h-20 mx-auto mb-2 rounded-full"
                        />
                        <p>{sponsor.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-800/50 p-6 rounded-xl">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Medal className="mr-3" /> Team Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-900/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Ranking</p>
                      <p className="font-bold text-yellow-400">#5 Global</p>
                    </div>
                    <div className="bg-blue-900/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Total Wins</p>
                      <p className="font-bold text-green-400">42</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamProfile;
