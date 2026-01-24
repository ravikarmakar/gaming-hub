import { useState } from "react";
import {
    Crown,
    User,
    Target,
    Shield,
    Trash,
    Edit,
    MoreVertical,
    Calendar,
    CheckCircle2,
    XCircle,
    Replace,
} from "lucide-react";
import { format } from "date-fns";

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

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { TeamMembersTypes, useTeamStore } from "@/features/teams/store/useTeamStore";

interface MemberCardProps {
    member: TeamMembersTypes;
    isOwner: boolean;
    currentUserId: string;
    onRemove: (id: string) => void;
    onEditRole: (role: string, id: string) => void;
    onTransferOwnership: (id: string) => void;
    isLoading: boolean;
}

const roleIcons: Record<string, typeof Crown> = {
    igl: Crown,
    rusher: Target,
    sniper: Target,
    support: Shield,
    player: User,
    coach: User,
    analyst: User,
    substitute: User,
};

const roleColors: Record<string, string> = {
    igl: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rusher: "bg-red-500/10 text-red-400 border-red-500/20",
    sniper: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    support: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    player: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    coach: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    analyst: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    substitute: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const roles = [
    { label: "Rusher", value: "rusher" },
    { label: "Sniper", value: "sniper" },
    { label: "Support", value: "support" },
    { label: "Player", value: "player" },
    { label: "Coach", value: "coach" },
    { label: "Analyst", value: "analyst" },
    { label: "Substitute", value: "substitute" },
];

export const MemberCard = ({
    member,
    isOwner,
    currentUserId,
    onRemove,
    onEditRole,
    onTransferOwnership,
    isLoading,
}: MemberCardProps) => {
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(member.roleInTeam);

    const { currentTeam } = useTeamStore();

    const isMemberOwner =
        currentTeam?.captain?.toString() === member.user?.toString();
    const isCurrentUser = member.user === currentUserId;

    const RoleIcon = roleIcons[member.roleInTeam] || User;

    const handleSaveRole = () => {
        if (selectedRole !== member.roleInTeam) {
            onEditRole(selectedRole, member.user);
        }
        setIsEditingRole(false);
    };

    const formatJoinedDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return "Unknown";
        }
    };

    return (
        <>
            <AlertDialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <AlertDialogContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-white tracking-tight">Transfer Team Ownership?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 font-medium">
                            Are you sure you want to transfer team ownership to <span className="text-white font-bold">{member.username}</span>?
                            This will demote you to a <span className="text-purple-400">regular member</span> and you will no longer have captain privileges.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 sm:gap-0">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => onTransferOwnership(member.user)}
                            className="bg-amber-500 hover:bg-amber-400 text-black border-0 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all font-bold"
                        >
                            Transfer Ownership
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors duration-200">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-12 h-12 border-2 border-white/10">
                                    <AvatarImage src={member.avatar} alt={member.username} />
                                    <AvatarFallback className="bg-white/10 text-white">
                                        {member.username?.[0]?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                {member.isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0B0C1A] rounded-full" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-white">
                                    {member.username}
                                    {isCurrentUser && (
                                        <span className="ml-2 text-xs text-gray-400">(You)</span>
                                    )}
                                </p>
                                {isMemberOwner && (
                                    <p className="text-xs text-amber-400 flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        Team Captain
                                    </p>
                                )}
                            </div>
                        </div>

                        {isOwner && !isMemberOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-white/10"
                                    >
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-2xl min-w-[180px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setIsEditingRole(true)}
                                        className="text-gray-300 hover:bg-white/10 focus:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <Edit className="w-4 h-4 mr-2 text-purple-400" />
                                        Edit Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setIsTransferDialogOpen(true)}
                                        className="text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10 transition-colors cursor-pointer font-medium"
                                    >
                                        <Replace className="w-4 h-4 mr-2" />
                                        Transfer Ownership
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                        onClick={() => onRemove(member.user)}
                                        disabled={isLoading}
                                        className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <Trash className="w-4 h-4 mr-2" />
                                        {isLoading ? "Removing..." : "Remove Member"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="space-y-3">
                        {/* Role */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                                Role
                            </p>
                            {isEditingRole ? (
                                <div className="flex gap-2">
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-2xl">
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.value}
                                                    value={role.value}
                                                    className="text-gray-300 hover:bg-white/10 focus:bg-white/10 transition-colors cursor-pointer"
                                                >
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveRole}
                                        disabled={isLoading}
                                        className="h-8 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20"
                                    >
                                        {isLoading ? "..." : "Save"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditingRole(false);
                                            setSelectedRole(member.roleInTeam);
                                        }}
                                        className="h-8 hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className={`${roleColors[member.roleInTeam]}`}
                                >
                                    <RoleIcon className="w-3 h-3 mr-1" />
                                    {member.roleInTeam.charAt(0).toUpperCase() +
                                        member.roleInTeam.slice(1)}
                                </Badge>
                            )}
                        </div>

                        {/* Joined Date */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                                Joined
                            </p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                {formatJoinedDate(member.joinedAt)}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                                Status
                            </p>
                            <Badge
                                variant="outline"
                                className={
                                    member.isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                }
                            >
                                {member.isActive ? (
                                    <>
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Inactive
                                    </>
                                )}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
