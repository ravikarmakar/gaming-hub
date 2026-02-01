import { useState } from "react";
import {
    Crown,
    User,
    Target,
    Shield,
    Trash,
    Edit,
    MoreVertical,
    XCircle,
    User2,
} from "lucide-react";
import { format } from "date-fns";

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

import { TEAM_ROLES } from "../../lib/access";
import { TeamMembersTypes } from "../../lib/types";
import { roleColors, roles } from "../../lib/constants";


interface MemberCardProps {
    member: TeamMembersTypes;
    isOwner: boolean;
    isCaptain: boolean;
    currentUserId: string;
    onRemove: (id: string) => void;
    onEditRole: (role: string, id: string) => void;
    onViewProfile: (id: string) => void;
    onTransferRequest?: (member: TeamMembersTypes) => void;
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

export const MemberCard = ({
    member,
    isOwner,
    isCaptain,
    currentUserId,
    onRemove,
    onEditRole,
    onViewProfile,
    isLoading,
}: MemberCardProps) => {
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(member.roleInTeam);

    const isMemberOwner = member.systemRole === TEAM_ROLES.OWNER;
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
        <Card className="group relative border-white/10 bg-[#0F111A]/60 backdrop-blur-xl hover:bg-[#121421]/80 hover:border-purple-500/50 transition-all duration-500 overflow-hidden shadow-2xl shadow-purple-500/5">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-zinc-800 border-2 border-white/5 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                                <Avatar className="w-full h-full">
                                    <AvatarImage src={member.avatar} alt={member.username} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-800 text-gray-400">
                                        {member.username?.[0]?.toUpperCase() || "?"}
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
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
                                    {member.username}
                                </span>
                                {isCurrentUser && (
                                    <Badge variant="secondary" className="bg-white/10 text-xs py-0 h-5 border-none text-gray-300">You</Badge>
                                )}
                            </div>

                            {isMemberOwner ? (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                                    <Crown className="w-3.5 h-3.5 fill-amber-400/20" />
                                    Team Captain
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500">
                                    {formatJoinedDate(member.joinedAt)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        {/* View Profile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewProfile(member.user)}
                            className="h-8 w-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                            title="View Profile"
                        >
                            <User2 className="w-4 h-4" />
                        </Button>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-zinc-950 border-white/10 shadow-xl min-w-[160px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setIsEditingRole(true)}
                                        className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer"
                                    >
                                        <Edit className="w-4 h-4 mr-2 text-purple-400" />
                                        Edit Role
                                    </DropdownMenuItem>

                                    {isCaptain && !isMemberOwner && !isCurrentUser && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => onRemove(member.user)}
                                                disabled={isLoading}
                                                className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                                            >
                                                <Trash className="w-4 h-4 mr-2" />
                                                Remove Member
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {isEditingRole ? (
                    <div className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">Select Role</span>
                            <XCircle
                                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors"
                                onClick={() => setIsEditingRole(false)}
                            />
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="h-9 w-full bg-black/20 border-white/10 text-white hover:bg-black/40 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                {roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value} className="text-gray-300 focus:text-white focus:bg-white/10 cursor-pointer">
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            onClick={handleSaveRole}
                            disabled={isLoading}
                            className="w-full h-8 bg-purple-600 hover:bg-purple-500 text-white border-0"
                        >
                            Save Changes
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Role</span>
                            <div className="flex items-center gap-1.5">
                                <RoleIcon className={`w-3.5 h-3.5 ${roleColors[member.roleInTeam]?.split(' ')[1] || 'text-gray-400'}`} />
                                <span className={`text-sm font-medium ${roleColors[member.roleInTeam]?.split(' ')[1] || 'text-gray-200'}`}>
                                    {member.roleInTeam.charAt(0).toUpperCase() + member.roleInTeam.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Status</span>
                            <div className="flex items-center gap-1.5">
                                {member.isActive ? (
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                ) : (
                                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                                )}
                                <span className={`text-sm font-medium ${member.isActive ? "text-emerald-400" : "text-gray-400"}`}>
                                    {member.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
