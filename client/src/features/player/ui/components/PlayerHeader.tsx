import { motion } from "framer-motion";
import { useState } from "react";
import React from "react";
import {
  MapPin,
  MessageCircle,
  Share2,
  Sword,
  Users,
  Heart,
  Gamepad2,
  ShieldCheck,
  Calendar,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Disc,
  Link as LinkIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { User } from "@/features/auth/lib/types";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS_ACCESS, TEAM_ACTIONS } from "@/features/teams/lib/access";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TeamInviteDialog } from "./TeamInviteDialog";

interface Props {
  player: User;
  type?: "team" | "player" | "organizer";
}

export const PlayerHeader: React.FC<Props> = ({ player }) => {
  const { can } = useAccess();
  const { user: currentUser } = useAuthStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const isOwnProfile = currentUser?._id === player._id;
  const canInvite = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.inviteMember]) && !isOwnProfile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center lg:flex-row lg:items-end gap-6 p-6 md:p-10 rounded-[2.5rem] bg-[#0d091a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden"
    >
      {/* Top Actions */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30 text-white backdrop-blur-md transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] -mr-32 -mt-32 rounded-full" />

      {/* Avatar Section */}
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#050505] shadow-2xl ring-2 ring-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
          <AvatarImage src={player.avatar} className="object-cover" />
          <AvatarFallback className="bg-[#1a1528] text-violet-400">
            <Users className="w-16 h-16 opacity-20" />
          </AvatarFallback>
        </Avatar>

        {/* Verification & Status */}
        <div className="absolute -bottom-2 -right-2 flex gap-1 items-center">
          {player.isAccountVerified && (
            <div className="p-1 px-1.5 rounded-full bg-blue-500 border-2 border-[#050505] shadow-xl" title="Account Verified">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
          {player.isPlayerVerified && (
            <div className="p-1 px-1.5 rounded-full bg-purple-500 border-2 border-[#050505] shadow-xl" title="Player Verified">
              <Sword className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col items-center lg:items-start space-y-6 text-center lg:text-left z-10 w-full">
        <div className="space-y-4 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
              {player.username}
            </h1>
            <Badge
              variant="outline"
              className={`self-center lg:self-center px-3 py-1 flex items-center gap-2 border-2 ${player.isLookingForTeam ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${player.isLookingForTeam ? 'bg-emerald-500' : 'bg-zinc-500'
                }`} />
              <span className="text-[10px] font-black tracking-widest">
                {player.isLookingForTeam ? 'Seeking Recruitment' : 'Off Grid'}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {player.gameIgn && (
              <Badge className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border-violet-500/30 px-3 py-1.5 rounded-xl transition-all shadow-lg shadow-violet-900/10">
                <span className="text-[10px] font-black tracking-widest mr-2 opacity-50">IGN:</span>
                <span className="text-[10px] font-black tracking-widest">{player.gameIgn}</span>
              </Badge>
            )}
            <Badge className="bg-white/5 hover:bg-white/10 text-white/60 border-white/5 px-3 py-1.5 rounded-xl transition-colors">
              <Gamepad2 className="w-3.5 h-3.5 mr-2 text-violet-400" />
              <span className="text-[10px] font-black tracking-widest">{player.esportsRole || "Tactician"}</span>
            </Badge>
            <Badge className="bg-white/5 hover:bg-white/10 text-white/60 border-white/5 px-3 py-1.5 rounded-xl transition-colors">
              <Users className="w-3.5 h-3.5 mr-2 text-blue-400" />
              <span className="text-[10px] font-black tracking-widest">
                {(player as any).teamId ? (player as any).teamId.teamName : "LEGION OF ONE"}
              </span>
            </Badge>

            {/* Social Links */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
              {player.socialLinks?.discord && (
                <a href={`https://discord.com/users/${player.socialLinks.discord}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors">
                  <Disc className="w-3.5 h-3.5" />
                </a>
              )}
              {player.socialLinks?.twitter && (
                <a href={`https://twitter.com/${player.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {player.socialLinks?.instagram && (
                <a href={`https://instagram.com/${player.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {player.socialLinks?.youtube && (
                <a href={player.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 transition-colors">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
              {player.socialLinks?.website && (
                <a href={player.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                  <LinkIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[10px] font-black tracking-[0.2em] text-white/30">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-violet-500/50" />
              <span>{player.location || "Sector 01"}</span>
            </div>
            <div className="flex items-center gap-2" title="Tactical Zone">
              <Globe className="w-3.5 h-3.5 text-blue-500/50" />
              <span>{player.region || "Global"} {player.country && `• ${player.country}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-500/50" />
              <span>Joined {new Date(player.createdAt).getFullYear()}</span>
            </div>
          </div>

          <p className="text-sm text-white/50 max-w-xl line-clamp-2 font-medium leading-relaxed">
            {player.bio || "No tactical briefing available for this operative."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full">
          {canInvite && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20 transition-all active:scale-95 group"
            >
              <Heart className="w-4 h-4 mr-2 group-hover:fill-current transition-all" />
              <span className="text-[10px] font-black tracking-widest">Recruit</span>
            </Button>
          )}

          {(player.settings?.allowMessages ?? true) && (
            <Button
              variant="outline"
              className="h-12 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30 text-white transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-violet-400" />
              <span className="text-[10px] font-black tracking-widest">Message</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            {(player.settings?.allowChallenges ?? true) && (
              isOwnProfile ? (
                <Badge variant="outline" className="h-12 px-6 rounded-2xl bg-rose-500/10 border-rose-500/20 text-rose-500 cursor-default">
                  <Sword className="w-4 h-4 mr-2" />
                  <span className="text-[10px] font-black tracking-widest">
                    Accepting Challenges
                  </span>
                </Badge>
              ) : (
                <Button
                  className="h-12 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20 transition-all active:scale-95 group"
                >
                  <Sword className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black tracking-widest">Challenge</span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <TeamInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        playerId={player._id!}
        playerName={player.username}
      />
    </motion.div>
  );
};
