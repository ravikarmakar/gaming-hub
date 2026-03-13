import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoadmapTabsProps {
    activeTab: "tournament" | "invited-tournament" | "t1-special";
    onTabChange: (value: "tournament" | "invited-tournament" | "t1-special") => void;
}

export const RoadmapTabs = ({ activeTab, onTabChange }: RoadmapTabsProps) => {
    return (
        <Tabs value={activeTab} onValueChange={(v: string) => onTabChange(v as "tournament" | "invited-tournament" | "t1-special")} className="flex-1">
            <TabsList className="bg-gray-950/60 p-1 border border-white/10 h-8 inline-flex w-auto gap-1 rounded-lg">
                <TabsTrigger
                    value="tournament"
                    className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300 text-gray-400 px-3 text-[10px] font-black uppercase tracking-widest transition-all h-full rounded-md"
                >
                    Main Roadmap
                </TabsTrigger>
                <TabsTrigger
                    value="invited-tournament"
                    className="data-[state=active]:bg-indigo-600/20 data-[state=active]:text-indigo-300 text-gray-400 px-3 text-[10px] font-black uppercase tracking-widest transition-all h-full rounded-md"
                >
                    Invited Roadmap
                </TabsTrigger>
                <TabsTrigger
                    value="t1-special"
                    className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-300 text-gray-400 px-3 text-[10px] font-black uppercase tracking-widest transition-all h-full rounded-md"
                >
                    T1 Special
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};