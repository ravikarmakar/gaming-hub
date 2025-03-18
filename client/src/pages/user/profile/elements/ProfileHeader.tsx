import React, { useState } from "react";
import {
  Clock,
  Gamepad2,
  Share2,
  Target,
  Trophy,
  Users2,
  LoaderCircle,
} from "lucide-react";
import { User } from "@/types";
import { FaPlus } from "react-icons/fa";
import { useTeamStore } from "@/store/useTeamStore";

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
  isOwnProfile: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = React.memo(({ icon, label, value }: StatCardProps) => (
  <div className="flex flex-col items-center md:items-start p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer">
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-lg font-semibold text-white mt-1">{value}</span>
  </div>
));

const IconButton = React.memo(({ icon }: IconButtonProps) => (
  <button className="p-2 rounded-lg bg-white/20 hover:bg-white/10 transition-all duration-200 hover:scale-105">
    {icon}
  </button>
));

const ProfileHeader = ({ user, isOwnProfile }: ProfileHeaderProps) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const { inviteMember, isLoading, seletedTeam } = useTeamStore();

  const handleInviteTeamMember = async (playerId: string | undefined) => {
    if (!playerId) return;

    await inviteMember(playerId);
  };

  return (
    <div className="relative w-full overflow-hidden mt-16">
      {/* Static Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Cover Image */}
      <div className="relative w-full h-[200px] md:h-[300px] rounded-b-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A1F]/90" />
        <img
          src={playerData.coverImage}
          alt="Profile Cover"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Profile Content */}
      <div className="relative px-2 md:px-8 lg:px-16 -mt-24 md:-mt-32 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-2">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-purple-500/30 bg-gradient-to-br from-blue-500 to-purple-600 p-1 transition-all duration-300 group-hover:ring-purple-500/50 group-hover:scale-105">
                  <img
                    src={playerData.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg transition-transform duration-200 hover:scale-105">
                  Tier-{playerData.tier}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-300">
                    {user?.name}
                  </h1>
                  {/* Verified Badge */}
                  {user?.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors duration-200">
                      Verified
                    </span>
                  )}
                </div>

                {/* Game & Team Info */}
                <div className="mt-3 text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="flex items-center font-semibold gap-2 bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors duration-200">
                    <Gamepad2 className="w-5 h-5 text-green-500" />
                    {playerData.game}
                  </span>
                  <span className="flex items-center font-semibold gap-2 bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors duration-200">
                    <Users2 className="w-4 h-4 text-yellow-400" />
                    {user?.activeTeam ? (
                      <p>{seletedTeam?.teamName || "Team Not found"}</p>
                    ) : (
                      "Add me In Team"
                    )}
                  </span>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                        isFollowing
                          ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                          : "bg-purple-500/60 text-white hover:bg-purple-600"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>

                    <button className="px-6 py-2 rounded-full font-semibold bg-green-800/50 text-white hover:bg-green-800/70  transition-all duration-200">
                      Message
                    </button>

                    {user.activeTeam ? (
                      <button
                        disabled
                        className="px-6 py-2 rounded-full font-semibold bg-white/10 text-white transition-all duration-200"
                      >
                        <span className="flex items-center gap-2">In Team</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInviteTeamMember(user._id)}
                        className="px-6 py-2 rounded-full font-semibold bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <p>{isLoading ? <LoaderCircle /> : <FaPlus />}</p>
                          <p>{user?.activeTeam ? "In Team" : "Add Player"}</p>
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <IconButton
                  icon={<Share2 className="w-5 h-5 text-blue-400" />}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                icon={<Gamepad2 className="w-5 h-5 text-green-400" />}
                label="Matches"
                value={playerData.stats.matches.toLocaleString()}
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-blue-400" />}
                label="Play Time"
                value={playerData.stats.playTime}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileHeader);
