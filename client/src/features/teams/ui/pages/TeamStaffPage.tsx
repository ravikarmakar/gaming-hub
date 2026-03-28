import { Navigate } from "react-router-dom";
import { ShieldAlert, UserCog, Crown, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TeamAvatar } from "@/features/teams/ui/components/atoms/TeamAvatar";
import { StatusIndicator } from "@/features/teams/ui/components/atoms/StatusIndicator";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { TeamMember } from "@/features/teams/lib/types";
import { TeamPageHeader } from "@/features/teams/ui/components/common/TeamPageHeader";
import { useTeamDialogs } from "@/features/teams/context/TeamDialogContext";
import { useTeamDashboard } from "@/features/teams/context/TeamDashboardContext";

export function formatTeamRole(systemRole?: string) {
  if (!systemRole) return "";

  // "team:owner" → "Owner"
  return systemRole
    .replace("team:", "")
    .replace(/^\w/, (c) => c.toUpperCase());
}

const TeamStaffPage = () => {
  const {
    team: currentTeam,
    teamId,
    permissions,
  } = useTeamDashboard();

  const { openDialog } = useTeamDialogs();

  // RBAC
  const { canManageStaff, canTransferOwnerShip } = permissions;
  const canViewStaffPage = canManageStaff; // Only staff managers can view this page

  if (!currentTeam) return null;

  if (!canViewStaffPage) {
    return <Navigate to={TEAM_ROUTES.DASHBOARD} replace />;
  }

  const confirmAction = (member: TeamMember, type: "promote" | "demote" | "transfer") => {
    const dialogType = type === "promote" ? "promoteMember" : type === "demote" ? "demoteMember" : "transferOwnership";
    const memberUserId = (typeof member.user === 'string' ? member.user : member.user?._id || member._id || member.username || "").toString();

    if (!memberUserId) {
      import('react-hot-toast').then(m => m.default.error("Could not determine member ID"));
      return;
    }

    openDialog(dialogType, {
      ...member,
      teamId,
      memberId: memberUserId
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TeamPageHeader
        icon={ShieldAlert}
        title="Staff Management"
        subtitle="Manage system access, promotions, and ownership"
        iconBgClass="bg-orange-500/10"
        iconColorClass="text-orange-400"
        borderClassName="border-orange-500/20"
        noMargin={true}
      />

      <main className="flex-1 overflow-y-auto w-full px-4 md:px-6 pt-2 md:pt-4 pb-4 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTeam.teamMembers?.map((member) => {
            const memberUserId = (typeof member.user === 'string' ? member.user : member.user?._id || member._id || member.username || "").toString();
            const isMemberOwner = member.systemRole === "team:owner";

            return (
              <Card key={memberUserId} className="group relative border-white/5 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="p-5 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <TeamAvatar
                        src={member.avatar}
                        alt={member.username}
                        size="md"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                            {member.username || "Unknown"}
                          </h3>
                          <StatusIndicator isActive={member.isActive} />
                        </div>
                        {member.systemRole && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 h-5 border-0 font-bold uppercase tracking-widest ${member.systemRole === "team:owner"
                              ? "bg-amber-500/10 text-amber-500"
                              : member.systemRole === "team:manager"
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-blue-500/10 text-blue-400"
                              }`}
                          >
                            {formatTeamRole(member.systemRole)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {canManageStaff && !isMemberOwner && (
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                            >
                              <UserCog className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-gray-200 shadow-2xl min-w-[180px]">
                            <DropdownMenuLabel className="text-xs font-bold text-gray-500 uppercase">System Team Roles</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => confirmAction(member, "promote")}
                              className="focus:bg-green-500/10 focus:text-green-400 cursor-pointer h-10"
                            >
                              <BadgeCheck className="w-4 h-4 mr-2" />
                              Promote to Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmAction(member, "demote")}
                              className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer h-10"
                            >
                              <ShieldAlert className="w-4 h-4 mr-2" />
                              Demote to Player
                            </DropdownMenuItem>
                            {canTransferOwnerShip && (
                              <>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                  onClick={() => confirmAction(member, "transfer")}
                                  className="focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer text-amber-500 h-10"
                                >
                                  <Crown className="w-4 h-4 mr-2" />
                                  Transfer Ownership
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto pt-4 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">In-Game Role</span>
                    <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300 border-0 text-[10px] uppercase tracking-wider font-bold">
                      {member.roleInTeam}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TeamStaffPage;
