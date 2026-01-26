import { useState } from "react";
import { format } from "date-fns";
import {
    MoreVertical,
    Edit,
    Trash,
    Calendar,
    User2,
    ShieldAlert,
    ShieldCheck,
    Shield,
    ShieldQuestion
} from "lucide-react";

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

import { ORG_ROLE } from "../../lib/access";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
    joinedDate?: string;
}

interface OrganizerMemberCardProps {
    member: Member;
    onRemove: (id: string) => void;
    onUpdateRole: (id: string, role: string) => Promise<void>;
    onViewProfile: (id: string) => void;
    onTransferOwnership?: (id: string) => void;
    canManage: boolean;
    canRemove: boolean;
    canTransfer?: boolean;
    isSelf: boolean;
    isLoading: boolean;
}

const roles = [
    { label: "Co-Owner", value: ORG_ROLE.CO_OWNER },
    { label: "Manager", value: ORG_ROLE.MANAGER },
    { label: "Staff", value: ORG_ROLE.STAFF },
];

export const OrganizerMemberCard = ({
    member,
    onRemove,
    onUpdateRole,
    onViewProfile,
    onTransferOwnership,
    canManage,
    canRemove,
    canTransfer,
    isSelf,
    isLoading,
}: OrganizerMemberCardProps) => {
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(member.role);

    const handleSaveRole = async () => {
        if (selectedRole !== member.role) {
            await onUpdateRole(member._id, selectedRole);
        }
        setIsEditingRole(false);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case ORG_ROLE.OWNER:
                return (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Owner
                    </Badge>
                );
            case ORG_ROLE.CO_OWNER:
                return (
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Co-Owner
                    </Badge>
                );
            case ORG_ROLE.MANAGER:
                return (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        <Shield className="w-3 h-3 mr-1" /> Manager
                    </Badge>
                );
            case ORG_ROLE.STAFF:
                return (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        <ShieldQuestion className="w-3 h-3 mr-1" /> Staff
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-gray-400 border-gray-800">Member</Badge>;
        }
    };

    return (
        <Card className="border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors duration-200">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-white/10">
                            <AvatarImage src={member.avatar} alt={member.username} />
                            <AvatarFallback className="bg-white/10 text-white">
                                {member.username?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-white">
                                {member.username}
                                {isSelf && (
                                    <span className="ml-2 text-xs text-gray-400">(You)</span>
                                )}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">
                                {member.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Always visible View Profile button (except for self) */}
                        {!isSelf && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewProfile(member._id)}
                                className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400 hover:text-blue-400"
                                title="View Profile"
                            >
                                <User2 className="w-4 h-4" />
                            </Button>
                        )}

                        {!isSelf && (canManage || canRemove || canTransfer) && member.role !== ORG_ROLE.OWNER && (
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
                                    className="bg-[#1A1C2E] border-white/10 shadow-2xl min-w-[180px]"
                                >
                                    {canManage && (
                                        <DropdownMenuItem
                                            onClick={() => setIsEditingRole(true)}
                                            className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4 mr-2 text-purple-400" />
                                            Edit Role
                                        </DropdownMenuItem>
                                    )}

                                    {canTransfer && onTransferOwnership && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (confirm("Are you sure you want to transfer ownership? You will become a Manager.")) {
                                                    onTransferOwnership(member._id);
                                                }
                                            }}
                                            className="text-orange-400 hover:bg-orange-500/10 focus:bg-orange-500/10 transition-colors cursor-pointer"
                                        >
                                            <ShieldAlert className="w-4 h-4 mr-2" />
                                            Transfer Ownership
                                        </DropdownMenuItem>
                                    )}

                                    {canRemove && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => onRemove(member._id)}
                                                disabled={isLoading}
                                                className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 transition-colors cursor-pointer"
                                            >
                                                <Trash className="w-4 h-4 mr-2" />
                                                {isLoading ? "Removing..." : "Remove Member"}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
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
                                    <SelectContent className="bg-[#1A1C2E] border-white/10 shadow-2xl">
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.value}
                                                value={role.value}
                                                className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer"
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
                                        setSelectedRole(member.role);
                                    }}
                                    className="h-8 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            getRoleBadge(member.role)
                        )}
                    </div>

                    {/* Joined Date */}
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                            Joined
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            {member.joinedDate ? format(new Date(member.joinedDate), "MMM dd, yyyy") : "Recently"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
