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

interface TeamFiltersProps {
    selectedRegion: string | undefined;
    onRegionChange: (val: string | undefined) => void;
    isRecruiting: boolean | undefined;
    onRecruitingChange: (val: boolean | undefined) => void;
    isVerified: boolean | undefined;
    onVerifiedChange: (val: boolean | undefined) => void;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({
    selectedRegion,
    onRegionChange,
    isRecruiting,
    onRecruitingChange,
    isVerified,
    onVerifiedChange,
}) => {
    const regions = ["NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA"];

    return (
        <div className="flex flex-wrap items-center gap-4 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 pl-2">
                <Label className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.2em] whitespace-nowrap">Region</Label>
                <Select
                    value={selectedRegion || "all"}
                    onValueChange={(val) => onRegionChange(val === "all" ? undefined : val)}
                >
                    <SelectTrigger className="w-[120px] h-9 bg-white/5 border-white/10 text-[10px] font-bold uppercase rounded-xl hover:bg-white/10 transition-colors">
                        <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d091a] border-white/10 text-white min-w-[120px]">
                        <SelectItem value="all" className="text-[10px] font-bold uppercase">All Regions</SelectItem>
                        {regions.map((reg) => (
                            <SelectItem key={reg} value={reg} className="text-[10px] font-bold uppercase">{reg}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-4 pr-2">
                <label className="flex items-center gap-2 cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={isRecruiting === true}
                        onCheckedChange={(checked) => onRecruitingChange(checked ? true : undefined)}
                        className="border-purple-500/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isRecruiting ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'}`}>Recruiting</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                    <Checkbox
                        checked={isVerified === true}
                        onCheckedChange={(checked) => onVerifiedChange(checked ? true : undefined)}
                        className="border-blue-500/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-sm w-4 h-4"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isVerified ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60'}`}>Verified</span>
                </label>
            </div>
        </div>
    );
};

export default TeamFilters;
