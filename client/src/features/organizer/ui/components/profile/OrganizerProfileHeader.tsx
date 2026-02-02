import { Award, MapPin, Calendar, Star, Share2, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

import { Organizer } from "@/features/organizer/lib/types";
import { UnifiedProfileHeader } from "@/components/shared/UnifiedProfileHeader";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

const mockStats = {
    totalEvents: 142,
    totalParticipants: 8420,
    rating: 4.9,
    reviewsCount: 234,
    followers: 12500,
};

export const OrganizerProfileHeader = ({ organizer, stats = mockStats }: OrganizerProfileHeaderProps) => {
    return (
        <UnifiedProfileHeader
            avatarImage={organizer.imageUrl}
            name={organizer.name}
            tag={organizer.tag || organizer.name.replace(/\s+/g, "").toLowerCase()}
            isVerified={organizer.isVerified}
            description={organizer.description || "No biography provided."}
            badges={
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <Award className="w-3.5 h-3.5" />
                    Organizer
                </div>
            }
            metaInfo={
                <>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">Earth</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">Joined {new Date(organizer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        SINCE {new Date(organizer.createdAt).getFullYear()}
                    </div>
                </>
            }
            stats={
                <div className="flex flex-wrap justify-center gap-3 md:justify-start sm:gap-4 md:gap-6">
                    {[
                        {
                            label: "Events",
                            value: stats.totalEvents,
                            color: "text-blue-400",
                        },
                        {
                            label: "Followers",
                            value: stats.followers.toLocaleString(),
                            color: "text-purple-400",
                        },
                        {
                            label: "Participants",
                            value: stats.totalParticipants.toLocaleString(),
                            color: "text-emerald-400",
                        },
                        {
                            label: "Rating",
                            value: stats.rating,
                            icon: <Star className="w-4 h-4 fill-current" />,
                            color: "text-yellow-400",
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className={`flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold ${stat.color}`}>
                                {stat.icon}
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            }
            actions={
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    {organizer.isHiring && (
                        <JoinOrgButton orgId={organizer._id!} orgName={organizer.name} />
                    )}
                    <button className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg active:scale-95">
                        Follow
                    </button>
                    <div className="flex gap-2">
                        <button
                            className="p-3 transition-colors bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl active:scale-95"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Organizer link copied!");
                            }}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 transition-colors bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl active:scale-95">
                            <MessageCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            }
        />
    );
};



const JoinOrgButton = ({ orgId, orgName }: { orgId: string, orgName: string }) => {
    const { user } = useAuthStore();
    const { joinOrg } = useOrganizerStore();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If no user, maybe redirect to login or hide? Sticking to hide or disable for now if logic needed.
    // If user is already in an org, they can't join.
    if (!user || user.orgId) return null;

    const handleJoin = async () => {
        if (!message.trim()) {
            toast.error("Please add a message to your request.");
            return;
        }
        setIsSubmitting(true);
        const success = await joinOrg(orgId, message);
        setIsSubmitting(false);
        if (success) {
            toast.success("Join request sent successfully!");
            setIsOpen(false);
            setMessage("");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                Join Organization
            </button>

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
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleJoin}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Send Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
