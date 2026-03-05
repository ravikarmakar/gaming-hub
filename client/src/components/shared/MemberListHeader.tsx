import { UserPlus, Users, LogOut, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemberListHeaderProps {
    title: string;
    memberCount: number;
    subtitle?: string;
    onAddMember?: () => void;
    canInvite?: boolean;
    onLeave?: () => void;
    canLeave?: boolean;
    onInfoToggle?: () => void;
    showInfo?: boolean;
    className?: string;
}

export const MemberListHeader = ({
    title,
    memberCount,
    subtitle,
    onAddMember,
    canInvite,
    onLeave,
    canLeave,
    onInfoToggle,
    showInfo,
    className,
}: MemberListHeaderProps) => {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10", className)}>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h1>
                        <Badge
                            variant="outline"
                            className="bg-white/5 border-white/10 text-gray-400 hidden sm:flex font-medium"
                        >
                            {memberCount} Active
                        </Badge>
                    </div>
                    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0 shrink-0">
                {onInfoToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onInfoToggle}
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-all border border-white/10 shrink-0 ${showInfo
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                            : "bg-[#0F111A]/60 text-gray-400 hover:text-white hover:bg-[#121421]/80 hover:border-purple-500/50"
                            }`}
                        title="Toggle Info"
                        aria-label="Toggle Info"
                    >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                )}

                {canLeave && onLeave && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onLeave}
                        className="h-9 sm:h-10 px-3 sm:px-4 border-white/10 bg-[#0F111A]/60 hover:bg-rose-500/10 hover:border-rose-500/50 text-gray-400 hover:text-rose-400 transition-all font-bold text-xs uppercase tracking-wider shadow-lg shrink-0"
                        aria-label="Leave Organization"
                    >
                        <LogOut className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Leave</span>
                    </Button>
                )}

                {canInvite && onAddMember && (
                    <Button
                        onClick={onAddMember}
                        size="sm"
                        className="h-9 sm:h-10 w-9 sm:w-auto p-0 sm:px-4 bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-900/20 transition-all font-bold text-xs uppercase tracking-wider shrink-0"
                        aria-label="Invite Members"
                    >
                        <UserPlus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Invite</span>
                    </Button>
                )}
            </div>
        </div>
    );
};
