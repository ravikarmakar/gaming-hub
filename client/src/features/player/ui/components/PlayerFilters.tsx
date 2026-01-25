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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PlayerFiltersProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    selectedRole: string | undefined;
    onRoleChange: (val: string | undefined) => void;
    isVerified: boolean | undefined;
    onVerifiedChange: (val: boolean | undefined) => void;
    hasTeam: boolean | undefined;
    onHasTeamChange: (val: boolean | undefined) => void;
}

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
    searchTerm,
    onSearchChange,
    selectedRole,
    onRoleChange,
    isVerified,
    onVerifiedChange,
    hasTeam,
    onHasTeamChange,
}) => {
    const roles = ["rusher", "sniper", "support", "igl", "coach", "player"];

    return (
        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/50" />
                <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="SEARCH PLAYERS..."
                    className="pl-10 h-10 bg-white/5 border-white/10 text-[10px] font-bold uppercase rounded-xl focus-visible:ring-violet-500/50 placeholder:text-white/20"
                />
            </div>

            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

            {/* Role Select */}
            <div className="flex items-center gap-2">
                <Label className="text-[10px] font-black text-violet-400/50 uppercase tracking-[0.2em] whitespace-nowrap">Role</Label>
                <Select
                    value={selectedRole || "all"}
                    onValueChange={(val) => onRoleChange(val === "all" ? undefined : val)}
                >
                    <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-[10px] font-bold uppercase rounded-xl hover:bg-white/10 transition-colors">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d091a] border-white/10 text-white min-w-[140px]">
                        <SelectItem value="all" className="text-[10px] font-bold uppercase">All Roles</SelectItem>
                        {roles.map((role) => (
                            <SelectItem key={role} value={role} className="text-[10px] font-bold uppercase">{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

            {/* Checkbox Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={isVerified === true}
                        onCheckedChange={(checked) => onVerifiedChange(checked ? true : undefined)}
                        className="border-blue-500/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isVerified ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60'}`}>Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={hasTeam === true}
                        onCheckedChange={(checked) => onHasTeamChange(checked ? true : undefined)}
                        className="border-emerald-500/30 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${hasTeam ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'}`}>In Team</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={hasTeam === false}
                        onCheckedChange={(checked) => onHasTeamChange(checked ? false : undefined)}
                        className="border-orange-500/30 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${hasTeam === false ? 'text-orange-400' : 'text-white/40 group-hover:text-white/60'}`}>Free Agent</span>
                </label>
            </div>
        </div>
    );
};

export default PlayerFilters;
