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
  Calendar
} from "lucide-react";

import { User } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS_ACCESS, TEAM_ACTIONS } from "@/features/teams/lib/access";
import { TeamInviteDialog } from "./TeamInviteDialog";
import { useState } from "react";

interface Props {
  player: User;
  type?: "team" | "player" | "organizer";
}

export const PlayerHeader: React.FC<Props> = ({ player }) => {
  const followerCount = "4.2K";
  const { can } = useAccess();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const canInvite = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.inviteMember]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center lg:flex-row lg:items-end gap-8 p-8 md:p-12 rounded-[2.5rem] bg-[#0d091a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden"
    >
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] -mr-32 -mt-32 rounded-full" />

      {/* Avatar Section */}
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
        <Avatar className="w-40 h-40 md:w-48 md:h-48 border-4 border-[#050505] shadow-2xl ring-2 ring-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
          <AvatarImage src={player.avatar} className="object-cover" />
          <AvatarFallback className="bg-[#1a1528] text-violet-400">
            <Users className="w-16 h-16 opacity-20" />
          </AvatarFallback>
        </Avatar>

        {/* Verification & Status */}
        {player.isAccountVerified && (
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-500 border-4 border-[#050505] shadow-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col items-center lg:items-start space-y-6 text-center lg:text-left z-10 w-full">
        <div className="space-y-4 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic">
              {player.username}
            </h1>
            <Badge variant="outline" className="self-center lg:self-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase">Combat Ready</span>
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <Badge className="bg-white/5 hover:bg-white/10 text-white/60 border-white/5 px-3 py-1.5 rounded-xl transition-colors">
              <Gamepad2 className="w-3.5 h-3.5 mr-2 text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">{player.esportsRole || "Tactician"}</span>
            </Badge>
            <Badge className="bg-white/5 hover:bg-white/10 text-white/60 border-white/5 px-3 py-1.5 rounded-xl transition-colors">
              <Users className="w-3.5 h-3.5 mr-2 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {(player as any).teamId ? (player as any).teamId.teamName : "LEGION OF ONE"}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-violet-500/50" />
              <span>Global Sector 01</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-violet-500/50" />
              <span>Member since 2024</span>
            </div>
          </div>

          <p className="text-sm text-white/50 max-w-xl line-clamp-2 italic font-medium leading-relaxed">
            {player.bio || "No tactical briefing available for this operative."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 w-full">
          {canInvite && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20 transition-all active:scale-95 group"
            >
              <Heart className="w-4 h-4 mr-2 group-hover:fill-current transition-all" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Recruit</span>
              <span className="ml-3 pl-3 border-l border-white/20 opacity-60 font-black">{followerCount}</span>
            </Button>
          )}

          <Button
            variant="outline"
            className="h-12 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30 text-white transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 mr-2 text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Comms</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30 text-white"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              className="h-12 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20 transition-all active:scale-95 group"
            >
              <Sword className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Challenge</span>
            </Button>
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
