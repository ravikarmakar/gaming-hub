import React, { createContext, useContext, useState } from "react";
import {
    Crown,
    User,
    Target,
    Shield,
    XCircle,
    User2,
    Edit,
    Trash,
    MoreVertical,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { roles } from "../../lib/constants";

// Context for Compound Components
interface MemberCardContextType {
    member: any;
    isLoading?: boolean;
}

const MemberCardContext = createContext<MemberCardContextType | null>(null);

const useMemberCard = () => {
    const context = useContext(MemberCardContext);
    if (!context) throw new Error("MemberCard sub-components must be used within MemberCard");
    return context;
};

// --- Main Component ---
interface MemberCardProps {
    member: any;
    isLoading?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const MemberCard = ({ member, isLoading, children, className }: MemberCardProps) => {
    return (
        <MemberCardContext.Provider value={{ member, isLoading }}>
            <Card className={`group relative border-white/10 bg-[#0F111A]/60 backdrop-blur-xl hover:bg-[#121421]/80 hover:border-purple-500/50 transition-all duration-500 overflow-hidden shadow-2xl shadow-purple-500/5 ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <CardContent className="p-5 relative z-10">
                    {children}
                </CardContent>
            </Card>
        </MemberCardContext.Provider>
    );
};

// --- Sub-Components ---

// 1. Header (Avatar + Name)
interface MemberCardHeaderProps {
    isCurrentUser?: boolean;
    roleLabel?: string;
    roleIcon?: any;
    showBadge?: boolean;
}

MemberCard.Header = ({ isCurrentUser, roleLabel, roleIcon: CustomRoleIcon, showBadge = true }: MemberCardHeaderProps) => {
    const { member } = useMemberCard();

    return (
        <div className="flex items-center gap-4 mb-4">
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

            <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors truncate">
                        {member.username}
                    </span>
                    {isCurrentUser && showBadge && (
                        <Badge variant="secondary" className="bg-white/10 text-xs py-0 h-5 border-none text-gray-300 shrink-0">You</Badge>
                    )}
                </div>
                {roleLabel && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                        {CustomRoleIcon && <CustomRoleIcon className="w-3.5 h-3.5 fill-amber-400/20" />}
                        {roleLabel}
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. Info Grid
MemberCard.InfoGrid = ({ children }: { children: React.ReactNode }) => {
    return <div className="grid grid-cols-2 gap-3 mt-2">{children}</div>;
};

// 3. Info Item
interface MemberCardInfoItemProps {
    label: string;
    value: string;
    icon?: any;
    valueClassName?: string;
    statusDot?: boolean;
    active?: boolean;
}

MemberCard.InfoItem = ({ label, value, icon: Icon, valueClassName, statusDot, active }: MemberCardInfoItemProps) => {
    return (
        <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">{label}</span>
            <div className="flex items-center gap-1.5 overflow-hidden">
                {statusDot && (
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-600"}`} />
                )}
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${valueClassName || 'text-gray-400'}`} />}
                <span className={`text-sm font-medium truncate ${valueClassName || 'text-gray-200'}`}>
                    {value}
                </span>
            </div>
        </div>
    );
};

// 4. Actions Area
MemberCard.Actions = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`absolute top-5 right-5 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 ${className}`}>
            {children}
        </div>
    );
};

// 5. Profile Action
MemberCard.ProfileAction = ({ onClick }: { onClick: () => void }) => {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="h-8 w-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            title="View Profile"
        >
            <User2 className="w-4 h-4" />
        </Button>
    );
};

// 6. Management Dropdown
interface MemberCardDropdownProps {
    onEditRole?: () => void;
    onRemove?: () => void;
    removeLabel?: string;
    removeIcon?: any;
    isRemovable?: boolean;
    isLoading?: boolean;
}

MemberCard.Dropdown = ({ onEditRole, onRemove, removeLabel = "Remove Member", isRemovable, isLoading }: MemberCardDropdownProps) => {
    return (
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
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 shadow-xl min-w-[160px]">
                {onEditRole && (
                    <DropdownMenuItem onClick={onEditRole} className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer">
                        <Edit className="w-4 h-4 mr-2 text-purple-400" />
                        Edit Role
                    </DropdownMenuItem>
                )}
                {isRemovable && onRemove && (
                    <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            onClick={onRemove}
                            disabled={isLoading}
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            {removeLabel}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// 7. Role Selector (Edit Mode)
interface MemberCardRoleSelectorProps {
    currentRole: string;
    onSave: (role: string) => void;
    onCancel: () => void;
    allMembers: any[];
    memberUser: string;
}

MemberCard.RoleSelector = ({ currentRole, onSave, onCancel, allMembers, memberUser }: MemberCardRoleSelectorProps) => {
    const [selectedRole, setSelectedRole] = useState(currentRole);
    const { isLoading } = useMemberCard();

    return (
        <div className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Select Role</span>
                <XCircle
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors"
                    onClick={onCancel}
                />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9 w-full bg-black/20 border-white/10 text-white hover:bg-black/40 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                    {roles.map((role) => {
                        const UNIQUE_ROLES = ["igl", "rusher", "sniper", "support"];
                        const isUniqueRole = UNIQUE_ROLES.includes(role.value);
                        const isAlreadyTaken = isUniqueRole && allMembers.some(
                            (m) => m.roleInTeam === role.value && m.user !== memberUser
                        );

                        const isSubstituteRole = role.value === "substitute";
                        const substituteLimitReached = isSubstituteRole && allMembers.filter(
                            (m) => m.roleInTeam === "substitute" && m.user !== memberUser
                        ).length >= 2;

                        const isDisabled = isAlreadyTaken || substituteLimitReached;

                        return (
                            <SelectItem
                                key={role.value}
                                value={role.value}
                                disabled={isDisabled}
                                className={`text-gray-300 focus:text-white focus:bg-white/10 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <div className="flex items-center justify-between w-full gap-2">
                                    <span>{role.label}</span>
                                    {isAlreadyTaken && (
                                        <Badge variant="outline" className="text-[10px] h-4 border-red-500/50 text-red-400 px-1">Occupied</Badge>
                                    )}
                                    {substituteLimitReached && (
                                        <Badge variant="outline" className="text-[10px] h-4 border-red-500/50 text-red-400 px-1">Limit Reached</Badge>
                                    )}
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
            <Button
                size="sm"
                onClick={() => onSave(selectedRole)}
                disabled={isLoading}
                className="w-full h-8 bg-purple-600 hover:bg-purple-500 text-white border-0"
            >
                Save Changes
            </Button>
        </div>
    );
};

// Exporting helper constants/types
export const roleIcons: Record<string, any> = {
    igl: Crown,
    rusher: Target,
    sniper: Target,
    support: Shield,
    player: User,
    coach: User,
    analyst: User,
    substitute: User,
};

export const formatJoinedDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
        return "Unknown";
    }
};
