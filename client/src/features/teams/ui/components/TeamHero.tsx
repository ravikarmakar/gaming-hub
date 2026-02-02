import React from 'react';
import toast from 'react-hot-toast';
import { MapPin, Globe, Share2, MoreVertical, Users, Loader2, Shield, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UnifiedProfileHeader } from '@/components/shared/UnifiedProfileHeader';

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
        <UnifiedProfileHeader
            avatarImage={team.imageUrl || ""}
            name={team.teamName}
            tag={team.tag}
            isVerified={team.isVerified}
            description={
                <div className="space-y-2">
                    <p>{team.bio || "No biography provided for this team yet."}</p>
                </div>
            }
            badges={
                <>
                    {team.isRecruiting && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                            <Users className="w-3.5 h-3.5" />
                            Recruiting
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        <Shield className="w-3.5 h-3.5" />
                        Team
                    </div>
                </>
            }
            metaInfo={
                <>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        {team.region || 'International'}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <Globe className="w-4 h-4 text-fuchsia-400" />
                        Global
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        SINCE {new Date(team.createdAt).getFullYear()}
                    </div>
                </>
            }
            actions={
                <>
                    {showJoinButton && (
                        <Button
                            onClick={handleJoinRequest}
                            disabled={isRequestingJoin || requestStatus}
                            className={`flex-1 md:flex-none h-12 text-white border-0 shadow-lg transition-all hover:-translate-y-0.5 min-w-[140px] md:min-w-[160px] font-bold text-sm md:text-base rounded-xl ${requestStatus
                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default hover:translate-y-0 shadow-none'
                                : 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
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
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all active:scale-95"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Team link copied!");
                        }}
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all active:scale-95">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </>
            }
        />
    );
};
