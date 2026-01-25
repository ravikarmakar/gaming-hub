import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    ShieldAlert,
    UserCog,
    Loader2,
    Crown,
    BadgeCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

import { useTeamStore, TeamMembersTypes } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS, TEAM_ACTIONS_ACCESS, TEAM_ACCESS } from "@/features/teams/lib/access";
import { TEAM_ROUTES } from "../../lib/routes";
import { Navigate } from "react-router-dom";

export function formatTeamRole(systemRole?: string) {
    if (!systemRole) return "";

    // "team:owner" → "Owner"
    return systemRole
        .replace("team:", "")
        .replace(/^\w/, (c) => c.toUpperCase());
}

const TeamStaffPage = () => {
    const {
        currentTeam,
        getTeamById,
        isLoading,
        promoteMember,
        demoteMember,
        transferTeamOwnerShip,
    } = useTeamStore();
    const { user } = useAuthStore();
    const { can } = useAccess();

    const [actionTarget, setActionTarget] = useState<TeamMembersTypes | null>(null);
    const [actionType, setActionType] = useState<"promote" | "demote" | "transfer">("promote");

    // RBAC
    const canManageStaff = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageStaff]);
    const canViewStaffPage = can(TEAM_ACCESS.staff)
    const canTransferOwnerShip = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.transferTeamOwnerShip]);


    useEffect(() => {
        if (user?.teamId) {
            getTeamById(user.teamId);
        }
    }, [user?.teamId, getTeamById]);

    useEffect(() => {
        if (!actionTarget) {
            const timer = setTimeout(() => {
                document.body.style.pointerEvents = 'auto';
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [actionTarget]);


    if (isLoading && !currentTeam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0C1A]">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
        );
    }

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
            <ScrollArea className="h-full bg-[#0B0C1A]">
                <div className="px-4 md:px-8 py-8 pb-20 mx-auto max-w-5xl space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <ShieldAlert className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
                            <p className="text-gray-400 text-sm">Manage system access, promotions, and ownership</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {currentTeam.teamMembers?.map((member) => {
                            const isMemberOwner = member.systemRole === "team:owner";

                            return (
                                <Card key={member.user} className="bg-[#111222] border-white/5 p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white/10">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="bg-gray-800 text-gray-400">
                                                {member.username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{member.username}</h3>
                                                {member.systemRole && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] px-2 py-0.5 h-5 border ${member.systemRole === "team:owner"
                                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                            : member.systemRole === "team:manager"
                                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                            }`}
                                                    >
                                                        {formatTeamRole(member.systemRole)}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-xs text-gray-500 font-medium">Team Role:</span>
                                                <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300 border-0 text-[10px] uppercase tracking-wider font-semibold">
                                                    {member.roleInTeam}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {canManageStaff && !isMemberOwner && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-white/80 hover:text-white hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/20 transition-all font-medium"
                                                    >
                                                        <UserCog className="w-4 h-4 mr-2 text-purple-400" />
                                                        Manage Access
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#0F0720] border-white/10 text-gray-200">
                                                    <DropdownMenuLabel>System Team Roles</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem
                                                        onClick={() => confirmAction(member, "promote")}
                                                        className="focus:bg-green-500/20 focus:text-green-400 cursor-pointer"
                                                    >
                                                        <BadgeCheck className="w-4 h-4 mr-2" />
                                                        Promote to Manager
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => confirmAction(member, "demote")}
                                                        className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer"
                                                    >
                                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                                        Demote to Player
                                                    </DropdownMenuItem>
                                                    {canTransferOwnerShip && (
                                                        <>
                                                            <DropdownMenuSeparator className="bg-white/10" />
                                                            <DropdownMenuItem
                                                                onClick={() => confirmAction(member, "transfer")}
                                                                className="focus:bg-amber-500/20 focus:text-amber-400 cursor-pointer text-amber-500"
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
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </ScrollArea>

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
