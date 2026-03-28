import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PlayerFiltersProps {
    selectedRole: string | undefined;
    onRoleChange: (val: string | undefined) => void;

    isPlayerVerified: boolean | undefined;
    onPlayerVerifiedChange: (val: boolean | undefined) => void;
    hasTeam: boolean | undefined;
    onHasTeamChange: (val: boolean | undefined) => void;
}

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
    selectedRole,
    onRoleChange,

    isPlayerVerified,
    onPlayerVerifiedChange,
    hasTeam,
    onHasTeamChange,
}) => {
    const roles = ["rusher", "sniper", "support", "igl", "coach", "player"];

    return (
        <div className="flex flex-row flex-wrap items-center justify-start gap-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {/* Role Select */}
            <div className="flex items-center gap-2">
                <Label className="text-[10px] font-black text-violet-400/50 whitespace-nowrap">Role</Label>
                <Select
                    value={selectedRole || "all"}
                    onValueChange={(val) => onRoleChange(val === "all" ? undefined : val)}
                >
                    <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-[10px] font-bold rounded-xl hover:bg-white/10 transition-colors">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d091a] border-white/10 text-white min-w-[140px]">
                        <SelectItem value="all" className="text-[10px] font-bold">All Roles</SelectItem>
                        {roles.map((role) => (
                            <SelectItem key={role} value={role} className="text-[10px] font-bold capitalize">{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

            {/* Checkbox Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={isPlayerVerified === true}
                        onCheckedChange={(checked) => onPlayerVerifiedChange(checked ? true : undefined)}
                        className="border-purple-500/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black transition-colors ${isPlayerVerified ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'}`}>Player Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={hasTeam === true}
                        onCheckedChange={(checked) => onHasTeamChange(checked ? true : undefined)}
                        className="border-emerald-500/30 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black transition-colors ${hasTeam ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'}`}>In Team</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={hasTeam === false}
                        onCheckedChange={(checked) => onHasTeamChange(checked ? false : undefined)}
                        className="border-orange-500/30 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black transition-colors ${hasTeam === false ? 'text-orange-400' : 'text-white/40 group-hover:text-white/60'}`}>Free Agent</span>
                </label>
            </div>
        </div>
    );
};

export default PlayerFilters;
