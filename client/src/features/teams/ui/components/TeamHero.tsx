import React from 'react';
import toast from 'react-hot-toast';
import { Shield, MapPin, Globe, Share2, MoreVertical, CheckCircle, Users, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useTeamStore } from '@/features/teams/store/useTeamStore';
import { Team } from '../../lib/types';

interface TeamHeroProps {
    team: Team;
}

export const TeamHero: React.FC<TeamHeroProps> = ({ team }) => {
    const { user } = useAuthStore();
    const { sendJoinRequest, isRequestingJoin } = useTeamStore();
    const [isApplied, setIsApplied] = React.useState(false);

    // Check if the current user is already a member of ANY team
    const hasTeam = !!user?.teamId;
    // Check if user is already a member of *this* team specifically
    const isMemberOfThisTeam = team.teamMembers.some(m => m.user === user?._id);

    // Show the button only if the team is recruiting and the user is NOT in any team
    const showJoinButton = team.isRecruiting && !hasTeam && !isMemberOfThisTeam;
    const requestStatus = isApplied || team.hasPendingRequest;

    const handleJoinRequest = async () => {
        if (!user) {
            toast.error("Please login to join a team");
            return;
        }

        const res = await sendJoinRequest(team._id);
        if (res.success) {
            toast.success(res.message);
            setIsApplied(true);
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="relative w-full group/hero">
            {/* Banner */}
            <div className="h-48 md:h-64 lg:h-80 w-full overflow-hidden rounded-2xl bg-gray-900 border border-white/5 relative shadow-2xl">
                {team.bannerUrl ? (
                    <img
                        src={team.bannerUrl}
                        alt={team.teamName}
                        className="w-full h-full object-cover opacity-60 group-hover/hero:scale-105 transition-transform duration-700"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-[#0B0C1A] to-blue-900/40 animate-gradient-slow" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-purple-600/5 mix-blend-overlay" />
            </div>

            {/* Profile Info Section */}
            <div className="px-4 md:px-8 -mt-20 md:-mt-24 flex flex-col md:flex-row items-center md:items-end gap-6 pb-2">
                {/* Logo Container */}
                <div className="relative isolate group/logo">
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-[#0B0C1A] border-4 border-[#0B0C1A] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-500 group-hover/logo:scale-[1.02]">
                        {team.imageUrl ? (
                            <img
                                src={team.imageUrl}
                                alt={team.teamName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.classList.add('bg-purple-600');
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                <Shield className="w-16 h-16 text-white/90" />
                            </div>
                        )}
                        {/* Fallback internal icon if image fails */}
                        <div className="absolute inset-0 flex items-center justify-center -z-10 bg-purple-600">
                            <Shield className="w-16 h-16 text-white/90" />
                        </div>
                    </div>

                    {/* Animated Ring around logo */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-[2rem] blur opacity-30 group-hover/logo:opacity-60 animate-spin-slow transition duration-500" />
                </div>

                {/* Team Details */}
                <div className="flex-1 space-y-3 pb-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-wrap">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {team.teamName}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                #{team.tag}
                            </span>
                            {team.isVerified && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Verified
                                </div>
                            )}
                            {team.isRecruiting && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    <Users className="w-3.5 h-3.5" />
                                    Recruiting
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 text-gray-300 text-sm md:text-base font-semibold">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            {team.region || 'International'}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                            <Globe className="w-4 h-4 text-blue-400" />
                            Global
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-gray-400">
                            SINCE {new Date(team.createdAt).getFullYear()}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto md:pb-4 justify-center md:justify-end">
                    {showJoinButton && (
                        <Button
                            onClick={handleJoinRequest}
                            disabled={isRequestingJoin || requestStatus}
                            className={`flex-1 md:flex-none h-12 text-white border-0 shadow-lg transition-all hover:-translate-y-0.5 min-w-[140px] md:min-w-[160px] font-bold text-sm md:text-base rounded-xl ${requestStatus
                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default hover:translate-y-0 shadow-none'
                                : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                }`}
                        >
                            {isRequestingJoin ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : requestStatus ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Request Sent
                                </>
                            ) : (
                                'Join Team'
                            )}
                        </Button>
                    )}
                    <Button variant="outline" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all">
                        <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all">
                        <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
