import { Swords } from "lucide-react";

interface LeaguePairingSelectorProps {
    selectedPairing: 'AxB' | 'BxC' | 'AxC' | null | undefined;
    onPairingChange: (pairing: 'AxB' | 'BxC' | 'AxC' | null) => void;
    pairingMatches: Record<string, number> | undefined;
    effectiveTotalMatch: number;
}

import { PAIRING_CONFIG } from "@/features/tournaments/lib/constants";

export const LeaguePairingSelector = ({
    selectedPairing,
    onPairingChange,
    pairingMatches,
    effectiveTotalMatch
}: LeaguePairingSelectorProps) => {
    const totalTeamBudget = Math.floor(effectiveTotalMatch / 1.5);
    const totalPossiblePerPair = Math.max(1, Math.floor(effectiveTotalMatch / 3));

    // Calculate cumulative matches played for each sub-group
    const matchesA = (pairingMatches?.['AxB'] || 0) + (pairingMatches?.['AxC'] || 0);
    const matchesB = (pairingMatches?.['AxB'] || 0) + (pairingMatches?.['BxC'] || 0);
    const matchesC = (pairingMatches?.['BxC'] || 0) + (pairingMatches?.['AxC'] || 0);

    const subGroupProgress = {
        A: matchesA,
        B: matchesB,
        C: matchesC
    };

    return (
        <div className="p-2 bg-black/30 border border-white/10 rounded-xl">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5 px-1 text-balance">
                <Swords className="w-3 h-3 text-amber-400" />
                Select match pairing to submit — only that pairing's 12 teams will be scored
            </p>

            <div className="grid grid-cols-3 gap-2">
                {PAIRING_CONFIG.map(({ key, color }) => {
                    const isActive = selectedPairing === key;
                    const matchesPlayed = pairingMatches?.[key] || 0;
                    const isFull = matchesPlayed >= totalPossiblePerPair;

                    // Derive sub-group labels from key (e.g. 'AxB' -> A and B)
                    const [group1, group2] = key.split('x');
                    const progress1 = subGroupProgress[group1 as keyof typeof subGroupProgress] || 0;
                    const progress2 = subGroupProgress[group2 as keyof typeof subGroupProgress] || 0;

                    const dynamicLabel = `Group ${group1}(${progress1}/${totalTeamBudget})x${group2}(${progress2}/${totalTeamBudget})`;

                    const colorStyles = {
                        blue: isActive
                            ? "bg-blue-500/30 border-blue-400/60 text-blue-200"
                            : "bg-blue-500/5 border-blue-500/20 text-blue-400 hover:bg-blue-500/15 hover:border-blue-400/40",
                        purple: isActive
                            ? "bg-purple-500/30 border-purple-400/60 text-purple-200"
                            : "bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/15 hover:border-purple-400/40",
                        orange: isActive
                            ? "bg-orange-500/30 border-orange-400/60 text-orange-200"
                            : "bg-orange-500/5 border-orange-500/20 text-orange-400 hover:bg-orange-500/15 hover:border-orange-400/40",
                    }[color as 'blue' | 'purple' | 'orange'];

                    return (
                        <button
                            key={key}
                            onClick={() => onPairingChange(isActive ? null : key)}
                            disabled={isFull}
                            className={`relative px-3 py-1.5 rounded-lg border text-xs font-black tracking-wider transition-all duration-200 ${colorStyles} ${isFull ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            <div className="text-[9px] opacity-60 mb-0.5">
                                {matchesPlayed}/{totalPossiblePerPair}
                            </div>
                            <div className="text-[9px] leading-tight">{dynamicLabel}</div>
                            {isActive && (
                                <span className="absolute top-1 right-1.5 text-[8px] font-black uppercase tracking-widest opacity-80 z-10">
                                    ✓
                                </span>
                            )}
                            {isFull && (
                                <span className="absolute bottom-1 right-1.5 text-[7px] font-black uppercase tracking-widest text-gray-400 bg-gray-950/40 px-1 rounded">
                                    FULL
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedPairing && (
                <p className="text-[10px] text-green-400 mt-2 font-bold px-1">
                    ✓ Pairing selected — enter results below for those 12 teams
                </p>
            )}
            {!selectedPairing && (
                <p className="text-[10px] text-gray-600 mt-2 px-1">
                    ↑ Click a match pairing above before entering results
                </p>
            )}
        </div>
    );
};
