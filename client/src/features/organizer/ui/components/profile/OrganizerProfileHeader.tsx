import { Award, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

import { Organizer } from "@/features/organizer/types";
import { UnifiedProfileHeader } from "@/components/shared/UnifiedProfileHeader";
import { ProfileBadge } from "@/components/shared/profile/ProfileBadge";
import { ProfileActionButton } from "@/components/shared/profile/ProfileActionButton";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useJoinOrgMutation } from "../../../hooks/useOrganizerMutations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface OrganizerProfileHeaderProps {
    organizer: Organizer;
    stats?: {
        totalEvents: number;
        totalParticipants: number;
        rating: number;
        reviewsCount: number;
        followers: number;
    };
}

export const OrganizerProfileHeader = ({ organizer }: OrganizerProfileHeaderProps) => {
    const { user } = useAuthStore();
    const currentUserId = user?._id?.toString();
    const isMemberOfOrg = !!(currentUserId && (
        organizer.ownerId?.toString() === currentUserId ||
        organizer.members?.some(m => m._id?.toString() === currentUserId)
    ));

    const badgesData = [
        {
            icon: <Award className="w-3.5 h-3.5" />,
            label: "Organizer",
            colorVariant: "blue" as const,
        },
    ];

    return (
        <UnifiedProfileHeader
            avatarImage={organizer.imageUrl}
            name={organizer.name}
            tag={organizer.tag || organizer.name.replace(/\s+/g, "").toLowerCase()}
            isVerified={organizer.isVerified}
            showUserChat={!isMemberOfOrg}
            entityId={organizer._id?.toString()}
            description={organizer.description || "No biography provided."}
            badges={
                <>
                    {badgesData.map((badge, idx) => (
                        <ProfileBadge key={idx} {...badge} />
                    ))}
                </>
            }
            actions={
                organizer.isHiring ? (
                    organizer.isHiring && user && !user.orgId && organizer._id ? (
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto [&>*]:flex-1 md:[&>*]:flex-none">
                            <JoinOrgButton organizer={organizer} />
                        </div>
                    ) : null
                ) : null
            }
        />
    );
};

const JoinOrgButton = ({ organizer }: { organizer: Organizer }) => {
    const orgId = organizer._id?.toString();
    const orgName = organizer.name;
    const { user } = useAuthStore();
    const joinMutation = useJoinOrgMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    // If no user, maybe redirect to login or hide? Sticking to hide or disable for now if logic needed.
    // If user is already in an org, they can't join.
    if (!user || user.orgId || !orgId) return null;

    const handleJoin = () => {
        if (!message.trim()) {
            toast.error("Please add a message to your request.");
            return;
        }

        joinMutation.mutate(
            { orgId, message },
            {
                onSuccess: () => {
                    toast.success("Join request sent successfully!");
                    setIsOpen(false);
                    setMessage("");
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to send join request");
                }
            }
        );
    };

    return (
        <>
            <ProfileActionButton
                onClick={() => !organizer.hasPendingRequest && setIsOpen(true)}
                disabled={organizer.hasPendingRequest || joinMutation.isPending}
                variant="success"
                className={organizer.hasPendingRequest ? "cursor-default opacity-80" : ""}
                icon={joinMutation.isPending ? <Loader2 className="animate-spin" /> : organizer.hasPendingRequest ? <CheckCircle /> : undefined}
            >
                {joinMutation.isPending ? (
                    "Joining..."
                ) : organizer.hasPendingRequest ? (
                    "Request Sent"
                ) : (
                    "Join Organization"
                )}
            </ProfileActionButton>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-[#1a1b2e] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Join {orgName}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Send a request to join this organization. Tell them why you'd be a great fit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="I'm a rusher looking for a team..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-black/20 border-white/10 min-h-[100px] text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
                        />
                    </div>
                    <DialogFooter>
                        <ProfileActionButton variant="outline" onClick={() => setIsOpen(false)} className="h-10 px-4">
                            Cancel
                        </ProfileActionButton>
                        <ProfileActionButton
                            onClick={handleJoin}
                            disabled={joinMutation.isPending}
                            className="h-10 px-4"
                            icon={joinMutation.isPending ? <Loader2 className="animate-spin" /> : undefined}
                        >
                            Send Request
                        </ProfileActionButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
