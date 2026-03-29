import React from 'react';
import toast from 'react-hot-toast';
import { Users, LoaderCircle as Loader2, Shield, CircleCheck as CircleCheck } from 'lucide-react';

import { UnifiedProfileHeader } from '@/components/shared/profile/UnifiedProfileHeader';
import { ProfileBadge } from '@/components/shared/profile/ProfileBadge';
import { ProfileActionButton } from '@/components/shared/profile/ProfileActionButton';

import { useCurrentUser } from '@/features/auth';
import { Team } from '@/features/teams/lib/types';
import { useSendJoinRequestMutation } from '../../../hooks/useTeamMutations';

interface TeamHeroProps {
    team: Team;
}

export const TeamHero: React.FC<TeamHeroProps> = ({ team }) => {
    const { user } = useCurrentUser();
    const joinMutation = useSendJoinRequestMutation();
    const [isApplied, setIsApplied] = React.useState(false);

    // Check if the current user is already a member of ANY team
    const hasTeam = !!user?.teamId;
    // Check if user is already a member of *this* team specifically
    const isMemberOfThisTeam = team.teamMembers?.some(m => {
        const mUserId = typeof m.user === 'string' ? m.user : m.user?._id;
        return mUserId?.toString() === user?._id?.toString();
    });

    // Show the button only if the team is recruiting and the user is NOT in any team
    const showJoinButton = team.isRecruiting && !hasTeam && !isMemberOfThisTeam;
    const requestStatus = isApplied || team.hasPendingRequest;

    const handleJoinRequest = async () => {
        if (!user) {
            toast.error("Please login to join a team");
            return;
        }

        joinMutation.mutate({ teamId: team._id }, {
            onSuccess: (data) => {
                toast.success(data.message || "Join request sent successfully");
                setIsApplied(true);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to send join request");
            }
        });
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
            chatTargetId={team.captain}
            chatScope="user"
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
                            disabled={joinMutation.isPending || requestStatus}
                            variant={requestStatus ? 'success' : 'primary'}
                            icon={joinMutation.isPending ? <Loader2 className="animate-spin" /> : requestStatus ? <CircleCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                            className="min-w-0 md:min-w-[160px] h-10 md:h-12 px-3 md:px-8"
                            aria-label={joinMutation.isPending ? "Sending Request" : requestStatus ? "Request Sent" : "Join Team"}
                        >
                            <span className="hidden md:inline">
                                {joinMutation.isPending ? (
                                    'Sending Request...'
                                ) : requestStatus ? (
                                    'Request Sent'
                                ) : (
                                    'Join Team'
                                )}
                            </span>
                        </ProfileActionButton>
                    </div>
                ) : null
            }
        />
    );
};
