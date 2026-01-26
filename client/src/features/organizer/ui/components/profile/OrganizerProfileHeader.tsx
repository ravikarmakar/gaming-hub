import { Organizer } from "@/features/organizer/store/useOrganizerStore";
import { Award, MapPin, Calendar, Star, Share2, MessageCircle } from "lucide-react";

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
        <>
            {/* Banner Section */}
            <div className="relative h-40 overflow-hidden sm:h-48 md:h-64">
                <img
                    src={organizer.bannerUrl}
                    alt="Banner"
                    className="object-cover w-full h-full"
                    onError={(e) =>
                    (e.currentTarget.src =
                        "https://placehold.co/1200x400/1F2937/4B5563?text=Banner+Not+Found")
                    }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            </div>

            {/* Profile Header */}
            <div className="relative z-10 max-w-6xl px-4 mx-auto -mt-12 sm:-mt-16">
                <div className="flex flex-col items-center gap-4 mb-6 text-center md:flex-row md:items-start md:text-left md:gap-6 md:mb-8">
                    <div className="relative flex-shrink-0">
                        <img
                            src={organizer.imageUrl}
                            alt={organizer.name}
                            className="w-24 h-24 bg-gray-900 border-4 border-gray-800 rounded-full sm:w-32 sm:h-32"
                            onError={(e) =>
                            (e.currentTarget.src =
                                "https://placehold.co/150x150/374151/9CA3AF?text=Avatar")
                            }
                        />
                        {organizer.isVerified && (
                            <div className="absolute p-1 bg-blue-500 rounded-full sm:p-2 -bottom-1 -right-1 sm:-bottom-2 sm:-right-2">
                                <Award className="w-3 h-3 text-white sm:w-4 sm:h-4" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 md:space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-transparent sm:text-3xl md:text-4xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                                {organizer.name}
                            </h1>
                            <p className="text-base text-gray-400 sm:text-lg">
                                @{organizer.tag || organizer.name.replace(/\s+/g, "").toLowerCase()}
                            </p>
                            <p className="max-w-2xl mt-1 text-sm text-gray-300 sm:mt-2 sm:text-base line-clamp-2">
                                {organizer.description || "No biography provided."}
                            </p>
                            <div className="flex flex-wrap items-center justify-center mt-2 text-xs text-gray-400 gap-x-3 gap-y-1 sm:text-sm md:justify-start">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Earth</span>
                                    {/* Location placeholder */}
                                </div>
                                <span className="hidden mx-1 sm:inline">•</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Joined {new Date(organizer.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

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
                                    color: "text-green-400",
                                },
                                {
                                    label: "Rating",
                                    value: stats.rating,
                                    icon: <Star className="w-4 h-4 fill-current sm:w-5 sm:h-5" />,
                                    reviews: `${stats.reviewsCount} reviews`,
                                    color: "text-yellow-400",
                                },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div
                                        className={`flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold ${stat.color}`}
                                    >
                                        {stat.icon}
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-400 sm:text-sm">
                                        {stat.label}
                                    </div>
                                    {stat.reviews && (
                                        <div className="text-xs text-gray-500">{stat.reviews}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-2 mt-4 sm:w-auto sm:flex-row sm:mt-0 md:self-start">
                        {organizer.isHiring && (
                            <JoinOrgButton orgId={organizer._id!} orgName={organizer.name} />
                        )}
                        <button
                            // onClick={handleFollow}
                            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
                        >
                            Follow
                        </button>
                        <div className="flex w-full gap-2 sm:w-auto">
                            <button className="flex-1 p-2 transition-colors bg-gray-800 sm:flex-none sm:p-3 hover:bg-gray-700 rounded-xl">
                                <Share2 className="w-4 h-4 mx-auto sm:w-5 sm:h-5" />
                            </button>
                            <button className="flex-1 p-2 transition-colors bg-gray-800 sm:flex-none sm:p-3 hover:bg-gray-700 rounded-xl">
                                <MessageCircle className="w-4 h-4 mx-auto sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Dialog Component would act better if isolated, but for now defining inline or below if simple */}
        </>
    );
};

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
