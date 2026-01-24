import {
    CheckCircle,
    Users,
    MapPin,
    Shield,
    Trophy,
} from "lucide-react";

import { Team } from "@/features/teams/store/useTeamStore";

interface Props {
    team: Team;
    isDashboard?: boolean;
}

export const TeamHeader = ({ team }: Props) => {
    return (
        <div className="relative z-0 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-8 mb-8 lg:flex-row lg:items-start lg:gap-12">
                {/* Team Logo */}
                <div className="relative">
                    <img
                        src={team.imageUrl || "/default-team-logo.png"}
                        alt={team.teamName}
                        className="w-28 h-28 sm:w-32 sm:h-32 bg-white/5 border border-white/10 rounded-2xl object-cover"
                    />

                    {/* Verified Badge */}
                    {team.isVerified && (
                        <div className="absolute -bottom-1 -right-1">
                            <div className="p-1.5 rounded-full bg-purple-500 border-2 border-[#0B0C1A]">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Recruiting Badge */}
                    {team.isRecruiting && (
                        <div className="absolute -top-1 -left-1 p-1.5 border-2 border-[#0B0C1A] rounded-full bg-emerald-500">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>

                {/* Team Info */}
                <div className="w-full space-y-4 text-center lg:text-left lg:flex-1">
                    <div className="space-y-3">
                        <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-3">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                {team.teamName}
                            </h1>
                            {team.tag && (
                                <div className="px-2.5 py-1 rounded-md text-sm font-medium bg-white/5 border border-white/10 text-gray-300">
                                    {team.tag}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                            {/* Team Members Count */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-md">
                                <Users className="w-3.5 h-3.5" />
                                {team.teamMembers?.length || 0} Members
                            </div>

                            {/* Region */}
                            {team.region && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-md">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {team.region}
                                </div>
                            )}

                            {/* Verified Badge */}
                            {team.isVerified && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-md">
                                    <Shield className="w-3.5 h-3.5" />
                                    Verified
                                </div>
                            )}

                            {/* Tournament Wins */}
                            {team.stats?.tournamentWins > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-md">
                                    <Trophy className="w-3.5 h-3.5" />
                                    {team.stats.tournamentWins} {team.stats.tournamentWins === 1 ? 'Win' : 'Wins'}
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        {team.bio && (
                            <div className="text-sm text-gray-400 max-w-2xl">
                                {team.bio}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
