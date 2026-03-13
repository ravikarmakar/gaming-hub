import { memo } from 'react';

import { Trophy, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RoundsSidebarHeaderProps {
    activeRoundTab: "tournament" | "invited-tournament" | "t1-special";
    isSidebarCollapsed: boolean;
    onToggleCollapse: (collapsed: boolean) => void;
}

export const RoundsSidebarHeader = memo(({
    activeRoundTab,
    isSidebarCollapsed,
    onToggleCollapse
}: RoundsSidebarHeaderProps) => {

    const getTitle = () => {
        switch (activeRoundTab) {
            case 'invited-tournament':
                return "Invited Rounds";
            case 't1-special':
                return "T1 Special";
            default:
                return "Main Roadmap";
        }
    };

    return (
        <div className={`h-14 px-4 flex items-center border-b border-white/5 bg-white/[0.02] ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!isSidebarCollapsed && (
                <h3 className="text-[11px] font-black text-white/40 tracking-[0.2em] pl-1 truncate mr-2">
                    ROUNDS <span className={
                        activeRoundTab === 'invited-tournament' ? 'text-rose-500' :
                            activeRoundTab === 't1-special' ? 'text-blue-500' :
                                'text-violet-500'
                    }>({getTitle()})</span>
                </h3>
            )}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleCollapse(!isSidebarCollapsed)}
                className="text-gray-400 hover:text-white h-8 w-8 flex-shrink-0"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isSidebarCollapsed ? <Trophy className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
        </div>
    );
});

RoundsSidebarHeader.displayName = 'RoundsSidebarHeader';
