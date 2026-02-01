import { useState } from "react";
import toast from "react-hot-toast";
import {
    ShieldAlert,
    UserCog,
    Loader2,
    Crown,
    BadgeCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS, TEAM_ACTIONS_ACCESS, TEAM_ACCESS } from "@/features/teams/lib/access";
import { TEAM_ROUTES } from "../../lib/routes";
import { Navigate } from "react-router-dom";
import { TeamMembersTypes } from "@/features/teams/lib/types";

export function formatTeamRole(systemRole?: string) {
    if (!systemRole) return "";

    // "team:owner" → "Owner"
    return systemRole
        .replace("team:", "")
        .replace(/^\w/, (c) => c.toUpperCase());
}

const TeamStaffPage = () => {
    const { currentTeam, promoteMember, demoteMember, transferTeamOwnerShip, isLoading } = useTeamStore();
    // user removed as it was only used for fetching
    const { can } = useAccess();

    const [actionTarget, setActionTarget] = useState<TeamMembersTypes | null>(null);
    const [actionType, setActionType] = useState<"promote" | "demote" | "transfer">("promote");

    // RBAC
    const canManageStaff = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageStaff]);
    const canViewStaffPage = can(TEAM_ACCESS.staff)
    const canTransferOwnerShip = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.transferTeamOwnerShip]);


    // Layout handles fetching
    // useEffect(() => {
    //    if (user?.teamId) getTeamById(user.teamId);
    // }, [user?.teamId, getTeamById]);

    if (!currentTeam) return null;

    if (!canViewStaffPage) {
        return <Navigate to={TEAM_ROUTES.DASHBOARD} replace />;
    }

    const handleAction = async () => {
        if (!actionTarget) return;

        let result;
        if (actionType === "promote") {
            result = await promoteMember(actionTarget.user);
        } else if (actionType === "demote") {
            result = await demoteMember(actionTarget.user);
        } else if (actionType === "transfer") {
            result = await transferTeamOwnerShip(actionTarget.user);
        }

        if (result?.success) {
            toast.success(result.message || "Action completed successfully");
        } else {
            toast.error(result?.message || "Action failed");
        }
        setActionTarget(null);
    };

    const confirmAction = (member: TeamMembersTypes, type: "promote" | "demote" | "transfer") => {
        // Delay opening the dialog slightly to let the DropdownMenu close fully
        // This prevents Radix overlay conflicts that can cause the body to stay locked
        setTimeout(() => {
            setActionTarget(member);
            setActionType(type);
        }, 10);
    };

    return (
        <>
            <div className="h-full">
                <div className="w-full space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <ShieldAlert className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Staff Management</h1>
                            <p className="text-gray-400 text-sm">Manage system access, promotions, and ownership</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentTeam.teamMembers?.map((member) => {
                            const isMemberOwner = member.systemRole === "team:owner";

                            return (
                                <Card key={member.user} className="group relative border-white/5 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="p-5 relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-xl bg-zinc-800 border-2 border-white/5 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                                                        <Avatar className="w-full h-full">
                                                            <AvatarImage src={member.avatar} alt={member.username} className="object-cover" />
                                                            <AvatarFallback className="bg-zinc-800 text-gray-400">
                                                                {member.username?.substring(0, 2).toUpperCase() || "??"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    {member.isActive && (
                                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                                                        {member.username || "Unknown"}
                                                    </h3>
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
                </div>
            </div>

            <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
                <AlertDialogContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-white tracking-tight">
                            {actionType === "transfer" ? "Transfer Team Ownership?" :
                                actionType === "promote" ? "Promote to Manager?" :
                                    "Demote to Player?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 font-medium">
                            {actionType === "transfer" && (
                                <>
                                    Are you sure you want to transfer ownership to <span className="text-white font-bold">{actionTarget?.username}</span>?
                                    You will lose your Owner privileges.
                                </>
                            )}
                            {actionType === "promote" && (
                                <>
                                    Promoting <span className="text-white font-bold">{actionTarget?.username}</span> will grant them Manager permissions, allowing them to invite/remove members and manage practice schedules.
                                </>
                            )}
                            {actionType === "demote" && (
                                <>
                                    Demoting <span className="text-white font-bold">{actionTarget?.username}</span> will revoke their Manager permissions. They will remain on the team as a player.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 sm:gap-0">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            disabled={isLoading}
                            className={`
                            border-0 shadow-lg transition-all font-bold min-w-[100px]
                            ${actionType === "transfer" ? "bg-amber-500 hover:bg-amber-400 text-black" :
                                    actionType === "promote" ? "bg-green-600 hover:bg-green-500 text-white" :
                                        "bg-red-600 hover:bg-red-500 text-white"}
                        `}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default TeamStaffPage;
