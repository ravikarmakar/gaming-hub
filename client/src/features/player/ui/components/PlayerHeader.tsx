import { useState } from "react";
import React from "react";
import {
  MapPin,
  MessageCircle,
  Share2,
  Sword,
  Heart,
  Gamepad2,
  Users,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Disc,
  Link as LinkIcon
} from "lucide-react";

import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedProfileHeader } from "@/components/shared/UnifiedProfileHeader";

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
    <>

      <UnifiedProfileHeader
        avatarImage={player.avatar || ""}
        name={player.username}
        tag={(player as any).teamId?.tag || "FA"}
        isVerified={player.isAccountVerified || player.isPlayerVerified}
        description={player.bio || "No tactical briefing available for this operative."}
        badges={
          <>
            {player.isLookingForTeam && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                Seeking Recruitment
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              <Sword className="w-3.5 h-3.5" />
              {player.esportsRole || "Tactician"}
            </div>
            {player.gameIgn && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Gamepad2 className="w-3.5 h-3.5" />
                {player.gameIgn}
              </div>
            )}
            {(player as any).teamId && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Users className="w-3.5 h-3.5" />
                {(player as any).teamId.teamName}
              </div>
            )}
          </>
        }
        metaInfo={
          <>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <MapPin className="w-4 h-4 text-purple-400" />
              {player.location || "Sector 01"}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <Globe className="w-4 h-4 text-blue-400" />
              {player.region || "Global"}
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
              SINCE {new Date(player.createdAt).getFullYear()}
            </div>

            {/* Premium Social Block */}
            <div className="flex items-center gap-2 ml-2">
              {player.socialLinks?.discord && (
                <a href={`https://discord.com/users/${player.socialLinks.discord}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-[#5865F2]/5 text-[#5865F2] hover:bg-[#5865F2]/10 border border-[#5865F2]/10 transition-all active:scale-95" title="Discord">
                  <Disc className="w-4 h-4" />
                </a>
              )}
              {player.socialLinks?.twitter && (
                <a href={`https://twitter.com/${player.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-[#1DA1F2]/5 text-[#1DA1F2] hover:bg-[#1DA1F2]/10 border border-[#1DA1F2]/10 transition-all active:scale-95" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {player.socialLinks?.instagram && (
                <a href={`https://instagram.com/${player.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-[#E1306C]/5 text-[#E1306C] hover:bg-[#E1306C]/10 border border-[#E1306C]/10 transition-all active:scale-95" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {player.socialLinks?.youtube && (
                <a href={player.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-[#FF0000]/5 text-[#FF0000] hover:bg-[#FF0000]/10 border border-[#FF0000]/10 transition-all active:scale-95" title="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {player.socialLinks?.website && (
                <a href={player.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all active:scale-95" title="Website">
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
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

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all active:scale-95 ml-auto"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Profile link copied!");
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      <TeamInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        playerId={player._id!}
        playerName={player.username}
      />
    </>
  );
};
