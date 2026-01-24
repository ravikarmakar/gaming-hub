import React from 'react';
import { Trophy, Crown, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TeamStatsGridProps {
    stats: {
        totalMatches: number;
        wins: number;
        losses: number;
        draws: number;
        tournamentWins: number;
        totalPrizeWon: number;
        winRate: number;
    };
}

export const TeamStatsGrid: React.FC<TeamStatsGridProps> = ({ stats }) => {
    const statItems = [
        {
            label: 'Win Rate',
            value: `${stats.winRate || 0}%`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            desc: 'Overall performance'
        },
        {
            label: 'Total Wins',
            value: stats.wins || 0,
            icon: Trophy,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            desc: 'Matches won'
        },
        {
            label: 'Tournaments',
            value: stats.tournamentWins || 0,
            icon: Crown,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            desc: 'Championships'
        },
        {
            label: 'Prize Pool',
            value: `$${(stats.totalPrizeWon || 0).toLocaleString()}`,
            icon: Zap,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            desc: 'Career earnings'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item, index) => (
                <Card key={index} className="bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden relative">
                    <div className="p-5 flex flex-col gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left duration-300">
                                {item.value}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
                        </div>
                    </div>
                    {/* Subtle background glow on hover */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full ${item.bg}`} />
                </Card>
            ))}
        </div>
    );
};
