import { Star, Trophy, Users, Award, MapPin, Calendar, TrendingUp } from "lucide-react";

import { Organizer } from "@/features/organizer/lib/types";

interface OrganizerAboutTabProps {
    organizer: Organizer;
    stats?: {
        totalEvents: number;
        totalParticipants: number;
        rating: number;
        reviewsCount: number;
        joinedDate: string;
    };
}

const mockStats = {
    totalEvents: 142,
    totalParticipants: 8420,
    rating: 4.9,
    reviewsCount: 234,
    joinedDate: "March 2019",
};

export const OrganizerAboutTab = ({ organizer, stats = mockStats }: OrganizerAboutTabProps) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="p-6 border border-gray-800 sm:p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl">
                <h3 className="flex items-center gap-3 mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
                    <TrendingUp className="w-5 h-5 text-blue-400 sm:w-6 sm:h-6" />
                    Organizer Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                    {[
                        {
                            icon: (
                                <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-400 sm:w-8 sm:h-8 sm:mb-2" />
                            ),
                            value: stats.totalEvents,
                            label: "Total Events",
                            color: "text-yellow-400",
                        },
                        {
                            icon: (
                                <Users className="w-6 h-6 mx-auto mb-1 text-blue-400 sm:w-8 sm:h-8 sm:mb-2" />
                            ),
                            value: stats.totalParticipants.toLocaleString(),
                            label: "Participants",
                            color: "text-blue-400",
                        },
                        {
                            icon: (
                                <Star className="w-6 h-6 mx-auto mb-1 text-purple-400 fill-current sm:w-8 sm:h-8 sm:mb-2" />
                            ),
                            value: stats.rating,
                            label: "Avg Rating",
                            color: "text-purple-400",
                        },
                        {
                            icon: (
                                <Award className="w-6 h-6 mx-auto mb-1 text-green-400 sm:w-8 sm:h-8 sm:mb-2" />
                            ),
                            value: stats.reviewsCount,
                            label: "Reviews",
                            color: "text-green-400",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="p-3 text-center sm:p-4 bg-gray-800/50 rounded-xl"
                        >
                            {stat.icon}
                            <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-400 sm:text-sm">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 border border-gray-800 sm:p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl">
                <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
                    About {organizer.name.split(" ")[0]}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-300 sm:mb-6 sm:text-base">
                    {organizer.description || "No description provided."}
                </p>
                <div className="space-y-3 text-sm sm:text-base sm:space-y-4">
                    {[
                        {
                            icon: <MapPin className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />,
                            text: "Location not set", // Placeholder as location is not in Organizer interface
                        },
                        {
                            icon: (
                                <Calendar className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                            ),
                            text: `Organizing since ${new Date(organizer.createdAt).toLocaleDateString()}`,
                        },
                        organizer.isVerified && {
                            icon: <Award className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />,
                            text: "Verified organizer",
                        },
                    ]
                        .filter(Boolean)
                        .map(
                            (item, index) =>
                                item && (
                                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                                        {item.icon}
                                        <span className="text-gray-300">{item.text}</span>
                                    </div>
                                )
                        )}
                </div>
            </div>
        </div>
    );
};
