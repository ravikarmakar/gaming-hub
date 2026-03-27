import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Sword, Heart, Users, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { UnifiedProfileHeader } from "@/components/shared/UnifiedProfileHeader";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { User } from "@/features/auth/lib/types";
import { Team } from "@/features/teams/lib/types";
import { TeamInviteDialog } from "./TeamInviteDialog";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS, TEAM_ACTIONS_ACCESS } from "@/features/teams/lib/access";

// --- Type Helpers ---
/** Extract a string team ID from the user's teamId field, which may be a string or populated object. */
function extractTeamId(player: User): string | null {
  const raw = player.teamId;
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  return raw._id || null;
}

/** Extract the team tag from a populated teamId object, if available. */
function extractTeamTag(player: User): string | undefined {
  const raw = player.teamId;
  if (typeof raw === "object" && raw !== null) return raw.tag;
  return undefined;
}

// --- Components ---

interface Props {
  player: User;
}

export const PlayerHeader: React.FC<Props> = ({ player }) => {
  const { user: currentUser } = useAuthStore();
  const { can } = useAccess();

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const isOwnProfile = currentUser?._id === player?._id;
  const canInvite = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.inviteMember]) && !isOwnProfile;


  return (
    <>
      <UnifiedProfileHeader
        avatarImage={player.avatar || ""}
        name={player.username}
        tag={extractTeamTag(player) || "FA"}
        isVerified={player.isAccountVerified || player.isPlayerVerified}
        showUserChat={true}
        entityId={player._id}
        description={player.bio || "No tactical briefing available for this operative."}
        infoBlocks={<PlayerInfoBlocks player={player} />}
        actions={<PlayerActionButtons player={player} isOwnProfile={isOwnProfile} canInvite={canInvite} setIsInviteOpen={setIsInviteOpen} />}
      />

      {player._id && (
        <TeamInviteDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          playerId={player._id}
          playerName={player.username}
        />
      )}
    </>
  );
};

// --- PlayerInfoBlocks ---

interface PlayerInfoBlocksProps {
  player: User;
}

export const PlayerInfoBlocks: React.FC<PlayerInfoBlocksProps> = ({ player }) => {
  const { getTeamById } = useTeamManagementStore();
  const [teamInfo, setTeamInfo] = useState<Pick<Team, "_id" | "teamName"> | null>(null);

  const teamIdString = extractTeamId(player);

  // Pre-populate from the populated teamId object if available.
  const populatedName = typeof player.teamId === "object" && player.teamId !== null ? player.teamId.teamName : null;

  useEffect(() => {
    let isMounted = true;

    const fetchTeam = async () => {
      if (!teamIdString) return;

      // If we already have a name from the populated object, use it directly.
      if (populatedName) {
        if (isMounted) setTeamInfo({ _id: teamIdString, teamName: populatedName });
        return;
      }

      try {
        // Otherwise fetch from the store/API.
        const team = await getTeamById(teamIdString);
        if (isMounted && team) {
          setTeamInfo({ _id: team._id, teamName: team.teamName });
        }
      } catch (error) {
        console.error("Failed to fetch team info:", error);
      }
    };

    fetchTeam();

    return () => {
      isMounted = false;
    };
  }, [teamIdString, populatedName, getTeamById]);

  return (
    <div className="flex flex-nowrap items-baseline gap-2 md:gap-4 md:-mt-1 text-[9px] sm:text-xs md:text-xs text-gray-400 font-medium">
      <div className="flex items-baseline gap-1 md:gap-2 shrink-0">
        <UserIcon className="w-3 h-3 md:w-3.5 md:h-3.5 translate-y-[1px] text-violet-400" />
        <span className="text-white/80 uppercase tracking-widest font-black leading-none">Player</span>
      </div>

      {teamInfo?.teamName && (
        <div className="flex items-baseline gap-1 md:gap-2 shrink-0 min-w-0">
          <div className="w-1 h-1 rounded-full bg-white/10 shrink-0 self-center" />
          <Users className="w-3 h-3 md:w-3.5 md:h-3.5 translate-y-[1px] text-fuchsia-400 shrink-0" />
          <Link
            to={`/team/${teamInfo._id}`}
            className="text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition-colors font-bold uppercase tracking-wide truncate max-w-[130px] sm:max-w-none leading-none"
          >
            {teamInfo.teamName}
          </Link>
        </div>
      )}
    </div>
  );
};

// --- PlayerActionButtons ---

interface PlayerActionButtonsProps {
  player: User;
  isOwnProfile: boolean;
  canInvite: boolean;
  setIsInviteOpen: (open: boolean) => void;
}

export const PlayerActionButtons: React.FC<PlayerActionButtonsProps> = ({
  player,
  isOwnProfile,
  canInvite,
  setIsInviteOpen,
}) => {
  const showChallenges = player.settings?.allowChallenges ?? true;

  if (!canInvite && !showChallenges) return null;

  return (
    <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto [&>*]:flex-1 md:[&>*]:flex-none">
      {canInvite && (
        <Button
          onClick={() => setIsInviteOpen(true)}
          variant="default"
        >
          <Heart />
          Recruit
        </Button>
      )}

      {showChallenges && (
        isOwnProfile ? (
          <div className="flex items-center gap-2 px-6 h-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest">
            <Sword className="w-4 h-4 mr-2" />
            Accepting Challenges
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={() => toast("Challenge feature coming soon", { icon: "⚔️" })}
          >
            <Sword />
            Challenge
          </Button>
        )
      )}
    </div>
  );
};
