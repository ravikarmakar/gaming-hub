import React from 'react';
import toast from 'react-hot-toast';
import { Users, Loader2, Shield, CheckCircle } from 'lucide-react';

import { UnifiedProfileHeader } from '@/components/shared/UnifiedProfileHeader';
import { ProfileBadge } from '@/components/shared/profile/ProfileBadge';
import { ProfileActionButton } from '@/components/shared/profile/ProfileActionButton';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useJoinRequestStore } from '@/features/teams/store/useJoinRequestStore';
import { Team } from '@/features/teams/lib/types';

interface TeamHeroProps {
    team: Team;
}

export const TeamHero: React.FC<TeamHeroProps> = ({ team }) => {
    const { user } = useAuthStore();
    const { sendJoinRequest, isRequestingJoin } = useJoinRequestStore();
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

    const badgesData = [
        team.isRecruiting && {
            icon: <Users className="w-3.5 h-3.5" />,
            label: "Recruiting",
            colorVariant: "emerald" as const,
        },
        {
            icon: <Shield className="w-3.5 h-3.5" />,
            label: "Team",
            colorVariant: "blue" as const,
        },
    ].filter(Boolean) as any[];

    return (
        <UnifiedProfileHeader
            avatarImage={team.imageUrl || ""}
            name={team.teamName}
            tag={team.tag}
            isVerified={team.isVerified}
            showUserChat={!isMemberOfThisTeam}
            entityId={team._id}
            description={
                <div className="space-y-2">
                    <p>{team.bio || "No biography provided for this team yet."}</p>
                </div>
            }
            badges={
                <>
                    {badgesData.map((badge, idx) => (
                        <ProfileBadge key={idx} {...badge} />
                    ))}
                </>
            }
            actions={
                showJoinButton ? (
                    <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto [&>*]:flex-1 md:[&>*]:flex-none">
                        <ProfileActionButton
                            onClick={handleJoinRequest}
                            disabled={isRequestingJoin || requestStatus}
                            variant={requestStatus ? 'success' : 'primary'}
                            icon={isRequestingJoin ? <Loader2 className="animate-spin" /> : requestStatus ? <CheckCircle /> : undefined}
                            className="min-w-[140px] md:min-w-[160px]"
                        >
                            {isRequestingJoin ? (
                                'Sending Request...'
                            ) : requestStatus ? (
                                'Request Sent'
                            ) : (
                                'Join Team'
                            )}
                        </ProfileActionButton>
                    </div>
                ) : null
            }
        />
    );
};
