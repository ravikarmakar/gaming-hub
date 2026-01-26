import { useState, useMemo } from "react";
import { Event } from "@/features/events/store/useEventStore";
import { X, Menu, Play, Gamepad2, Calendar, Clock, MapPin, Users, Eye, Heart, ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { ROUTES } from "@/lib/routes";

interface OrganizerEventsTabProps {
    events: Event[];
}

export const OrganizerEventsTab = ({ events }: OrganizerEventsTabProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // const navigate = useNavigate();

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        // Sort by most recent start date (assuming startDate exists and is ISO string)
        return [...events].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
    }, [events]);

    const getStatusColor = (status: Event["status"]) => {
        switch (status) {
            case "live":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "registration-open":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "completed":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const formatStatus = (status: string) => {
        return status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-xl font-bold sm:text-2xl">Recent Events</h2>
                {/* Mobile Filter Button */}
                <div className="sm:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 text-sm transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                        {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />} Filters
                    </button>
                </div>
                {/* Desktop Filters */}
                <div className="hidden gap-2 sm:flex">
                    {["All", "Upcoming", "Completed"].map((filter) => (
                        <button
                            key={filter}
                            className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
            {/* Mobile Filter Dropdown */}
            {isMobileMenuOpen && (
                <div className="flex flex-col gap-2 p-2 mt-2 bg-gray-800 rounded-lg sm:hidden">
                    {["All", "Upcoming", "Completed"].map((filter) => (
                        <button
                            key={filter}
                            className="w-full px-3 py-2 text-sm text-left transition-colors rounded-md hover:bg-gray-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => (
                    <div
                        key={event._id}
                        className="overflow-hidden transition-all duration-300 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl hover:border-gray-700 group"
                    >
                        <div className="relative">
                            <img
                                src={event.image}
                                alt={event.title}
                                className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                onError={(e) =>
                                (e.currentTarget.src =
                                    "https://placehold.co/300x200/1F2937/4B5563?text=Event+Img")
                                }
                            />
                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                                <span
                                    className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                        event.status
                                    )}`}
                                >
                                    {event.status === "live" && (
                                        <div className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 mr-1 sm:mr-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                    {formatStatus(event.status)}
                                </span>
                            </div>
                            {event.status === "live" && (
                                <div className="absolute flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full top-2 left-2 sm:top-4 sm:left-4 bg-red-500/90 backdrop-blur-sm">
                                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                                    <span className="text-xs font-medium">LIVE</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 sm:text-sm">
                                <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{event.game}</span>
                            </div>

                            <h3 className="mb-3 text-lg font-bold transition-colors sm:text-xl group-hover:text-blue-400 line-clamp-1">
                                {event.title}
                            </h3>

                            <div className="space-y-2 text-xs sm:text-sm sm:space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {/* Location is not in Event interface, stubbing or checking if it should be added to backend */}
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="truncate max-w-[100px] sm:max-w-none">
                                            Online
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>
                                            {/* Using slots as maxParticipants */}
                                            {0}/{event.slots}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-2 pt-2 border-t border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3 text-gray-400 sm:gap-4">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span>{event.views}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span>{event.likes}</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-base font-bold text-green-400 sm:mt-0 sm:text-lg">
                                        ${event.prizePool.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <button
                                // onClick={() => navigate(ROUTES.TOURNAMENTS_DETAILS.replace(":id", event._id))}
                                className="flex items-center justify-center w-full gap-2 py-2.5 sm:py-3 mt-4 text-sm font-medium text-blue-400 transition-all duration-200 border sm:text-base bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-500/20 rounded-xl group/btn"
                            >
                                View Details
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No events found for this organization.
                    </div>
                )}
            </div>
        </div>
    );
};
