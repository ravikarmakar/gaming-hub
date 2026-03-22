import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";


interface HeaderActionsProps {
    search: string;
    setSearch: (value: string) => void;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    onClearFilters?: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ search, setSearch, showFilters, setShowFilters, onClearFilters }) => {
    return (
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group/search flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-white/25 group-focus-within/search:text-purple-400 transition-colors duration-300" />
                </div>
                <Input
                    type="text"
                    placeholder="Search teams..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-11 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/30 focus:bg-white/[0.06] transition-all duration-300 hover:border-white/[0.12] h-[42px]"
                />
                {search.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            <Button
                size="sm"
                aria-label={showFilters ? 'Close filters' : 'Open filters'}
                className={`rounded-xl border transition-all duration-300 gap-2 px-3 sm:px-6 h-[42px] flex-shrink-0
                    ${showFilters
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-200 hover:bg-purple-500/20'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white/70'
                    }`}
                onClick={() => {
                    if (showFilters && onClearFilters) {
                        onClearFilters();
                    }
                    setShowFilters(!showFilters);
                }}
            >
                {showFilters ? (
                    <X className="w-4 h-4 text-purple-300" />
                ) : (
                    <SlidersHorizontal className="w-4 h-4" />
                )}
                <span className="hidden sm:inline text-xs font-semibold tracking-wide">{showFilters ? 'Close' : 'Filters'}</span>
            </Button>
        </div>
    );
};