import {
  CheckCircle,
  Crown,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Sword,
  Users,
} from "lucide-react";

import { User } from "@/features/auth/store/useAuthStore";
import { GlowButton } from "@/ui/element/Button";

interface Props {
  player: User;
  type?: "team" | "player" | "organizer";
}

export const PlayerHeader = ({ player }: Props) => {
  const handleFollow = () => {};
  const isFollowing = true;
  const followerCount = 4000;

  return (
    <div className="relative z-10 px-4 mx-auto -mt-20 max-w-7xl sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-8 mb-12 lg:flex-row lg:items-start lg:gap-12">
        {/* Profile Image & Status */}
        <div className="relative group">
          <div className="relative">
            <img
              src={player.avatar}
              alt={player.username}
              className="w-32 h-32 transition-all duration-500 bg-gray-900 border-4 border-gray-800 rounded-full shadow-2xl sm:w-36 sm:h-36 md:w-40 md:h-40 group-hover:shadow-blue-500/20"
            />

            {/* Status Indicator */}
            <div className="absolute flex items-center gap-2 -bottom-2 -right-2">
              <div className="w-5 h-5 bg-green-500 border-4 border-gray-800 rounded-full sm:w-6 sm:h-6 animate-pulse" />
              <div className="p-2 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Tier Badge */}
            <div className="absolute p-2 border-2 border-gray-800 rounded-full shadow-lg -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-pink-500 sm:p-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:opacity-100 -z-10" />
        </div>

        {/* Profile Info */}
        <div className="w-full space-y-6 text-center lg:text-left lg:flex-1">
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-4">
              <h1 className="text-3xl font-bold text-transparent sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
                {player.username}
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border bg-green-500"`}
              >
                Online
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-300 border rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
                <Users className="w-4 h-4" />
                {player.teamId}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-yellow-300 border rounded-full bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border-yellow-500/30">
                <Gift className="w-4 h-4" />
                Sponsored
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-sm text-gray-400 sm:flex-row sm:gap-4 sm:justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Bengaluru, KA</span>
              </div>
            </div>

            <div className="text-sm text-gray-300 sm:text-base">Bio</div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <GlowButton
              variant={isFollowing ? "secondary" : "primary"}
              onClick={handleFollow}
              size="md"
            >
              <Heart className="w-5 h-5" />
              {isFollowing ? "Following" : "Follow"}
              <span className="ml-2">{followerCount}</span>
            </GlowButton>
            <GlowButton
              variant="secondary"
              onClick={() => console.log("Message clicked")}
              size="md"
            >
              <MessageCircle className="w-5 h-5" />
              Message
            </GlowButton>
            <GlowButton
              variant="ghost"
              onClick={() => console.log("Settings clicked")}
              size="md"
            >
              <Share2 className="w-5 h-5" />
              Share
            </GlowButton>
            <GlowButton
              variant="danger"
              onClick={() => console.log("Challenge clicked")}
              size="md"
            >
              <Sword className="w-5 h-5" />
              Challenge
            </GlowButton>
          </div>
        </div>
      </div>
    </div>
  );
};
