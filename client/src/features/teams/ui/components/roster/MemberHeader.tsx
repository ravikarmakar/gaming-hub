import {
  Users,
  LogOut,
  UserPlus,
} from "lucide-react";

import { useTeamDashboard } from "@/features/teams/context/TeamDashboardContext";
import { useTeamDialogs } from "@/features/teams/context/TeamDialogContext";
import { Button } from "@/components/ui/button";
import { TeamPageHeader } from "../common/TeamPageHeader";

interface MemberHeaderProps {
  title?: string;
  showActions?: boolean;
  noMargin?: boolean;
}

export const MemberHeader = ({
  title = "Active Roster",
  showActions = true,
  noMargin,
}: MemberHeaderProps) => {
  const { team: currentTeam, permissions } = useTeamDashboard();
  const { openDialog } = useTeamDialogs();

  if (!currentTeam) return null;

  const memberCount = currentTeam.teamMembers?.length || 0;
  const { isOwner, canManageStaff } = permissions;
  const canInvite = isOwner || canManageStaff;

  const hasActions = canInvite || !isOwner;

  const actions = showActions && hasActions && (
    <div className="flex items-center gap-2 sm:gap-3">
      {canInvite && (
        <Button
          onClick={() => openDialog('inviteMember', { teamId: currentTeam._id })}
          aria-label="Invite Member"
          className="bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Invite Member</span>
        </Button>
      )}
      {!isOwner && (
        <Button
          variant="outline"
          onClick={() => openDialog('leaveTeam', { teamId: currentTeam._id })}
          aria-label="Leave Team"
          className="bg-zinc-900/50 border-white/5 hover:bg-zinc-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 font-bold rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Leave Team</span>
        </Button>
      )}
    </div>
  );

  return (
    <TeamPageHeader
      icon={Users}
      title={title}
      subtitle="Optimize your tactical lineup and manage the squad's operational capacity."
      badgeText={`${memberCount} Active`}
      badgeIcon={Users}
      badgeColor="bg-blue-500/10 border-blue-500/20 text-blue-400"
      actions={actions || undefined}
      iconBgClass="bg-blue-500/10"
      iconColorClass="text-blue-400"
      noMargin={noMargin}
    />
  );
};
