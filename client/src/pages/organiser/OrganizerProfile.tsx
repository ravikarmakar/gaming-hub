import React, { useState, useMemo } from "react";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Star,
  Gamepad2,
  Clock,
  Award,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  ChevronRight,
  Play,
  Menu,
  X,
} from "lucide-react";
import { TabContent, Tabs } from "@/components/ui/Tab";

// Types
interface Event {
  id: string;
  title: string;
  game: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  prizePool: string;
  status: "upcoming" | "live" | "completed";
  image: string;
  views: number;
  likes: number;
}

interface OrganizerStats {
  totalEvents: number;
  totalParticipants: number;
  rating: number;
  reviewsCount: number;
  joinedDate: string;
  followers: number;
  following: number;
}

interface OrganizerProfileProps {
  organizer?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    banner: string;
    bio: string;
    location: string;
    verified: boolean;
    stats: OrganizerStats;
  };
  events?: Event[];
}

const mockData: OrganizerProfileProps = {
  organizer: {
    id: "1",
    name: 'Alex "ProGamer" Rodriguez',
    username: "@alexproesports",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    banner:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop",
    bio: "Professional esports organizer with 5+ years of experience. Passionate about bringing the gaming community together through epic tournaments and events.",
    location: "Los Angeles, CA",
    verified: true,
    stats: {
      totalEvents: 142,
      totalParticipants: 8420,
      rating: 4.9,
      reviewsCount: 234,
      joinedDate: "March 2019",
      followers: 12500,
      following: 890,
    },
  },
  events: [
    {
      id: "1",
      title: "Championship Series Finals",
      game: "Counter-Strike 2",
      date: "2024-06-15",
      time: "18:00",
      location: "Gaming Arena LA",
      participants: 64,
      maxParticipants: 64,
      prizePool: "$25,000",
      status: "upcoming",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
      views: 1250,
      likes: 89,
    },
    {
      id: "2",
      title: "Weekly Valorant Showdown",
      game: "Valorant",
      date: "2024-06-08",
      time: "20:00",
      location: "Online",
      participants: 32,
      maxParticipants: 32,
      prizePool: "$5,000",
      status: "live",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop",
      views: 892,
      likes: 67,
    },
    {
      id: "3",
      title: "Rocket League Masters",
      game: "Rocket League",
      date: "2024-05-28",
      time: "16:00",
      location: "Phoenix Convention Center",
      participants: 48,
      maxParticipants: 48,
      prizePool: "$15,000",
      status: "completed",
      image:
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=200&fit=crop",
      views: 2180,
      likes: 156,
    },
  ],
};

const OrganizerProfile: React.FC<OrganizerProfileProps> = ({
  organizer = mockData.organizer,
  events = mockData.events,
}) => {
  const [activeTab, setActiveTab] = useState<string>("events");
  const [followingCount, setFollowingCount] = useState(
    organizer?.stats.followers ?? 0
  );
  const [isFollowing, setIsFollowing] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [events]);

  if (!organizer) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-950">
        Loading organizer data...
      </div>
    );
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowingCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  const tabItems = [
    {
      id: "events",
      label: "Events",
      content: <EventsTab events={filteredEvents} />,
    },
    {
      id: "about",
      label: "About",
      content: <AboutTab organizer={organizer} />,
    },
    {
      id: "reviews",
      label: "Reviews",
      content: <ReviewsTab organizer={organizer} />,
    },
  ];

  return (
    <div className="min-h-screen pt-8 pb-16 text-white bg-gray-950 sm:pt-16">
      {/* Banner Section */}
      <div className="relative h-40 overflow-hidden sm:h-48 md:h-64">
        <img
          src={organizer.banner}
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
              src={organizer.avatar}
              alt={organizer.name}
              className="w-24 h-24 bg-gray-900 border-4 border-gray-800 rounded-full sm:w-32 sm:h-32"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/150x150/374151/9CA3AF?text=Avatar")
              }
            />
            {organizer.verified && (
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
                {organizer.username}
              </p>
              <p className="max-w-2xl mt-1 text-sm text-gray-300 sm:mt-2 sm:text-base">
                {organizer.bio}
              </p>
              <div className="flex flex-wrap items-center justify-center mt-2 text-xs text-gray-400 gap-x-3 gap-y-1 sm:text-sm md:justify-start">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{organizer.location}</span>
                </div>
                <span className="hidden mx-1 sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Joined {organizer.stats.joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:justify-start sm:gap-4 md:gap-6">
              {[
                {
                  label: "Events",
                  value: organizer.stats.totalEvents,
                  color: "text-blue-400",
                },
                {
                  label: "Followers",
                  value: followingCount.toLocaleString(),
                  color: "text-purple-400",
                },
                {
                  label: "Participants",
                  value: organizer.stats.totalParticipants.toLocaleString(),
                  color: "text-green-400",
                },
                {
                  label: "Rating",
                  value: organizer.stats.rating,
                  icon: <Star className="w-4 h-4 fill-current sm:w-5 sm:h-5" />,
                  reviews: `${organizer.stats.reviewsCount} reviews`,
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
            <button
              onClick={handleFollow}
              className={`w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                isFollowing
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
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

        {/* Navigation Tabs */}
        <div className="px-2 mb-6 overflow-x-auto border-b border-white/10 sm:mb-8 sm:px-4">
          <Tabs
            tabs={tabItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Content */}
        <div className="pb-12">
          <TabContent key={activeTab}>
            {tabItems.find((tab) => tab.id === activeTab)?.content}
          </TabContent>
        </div>
      </div>
    </div>
  );
};

interface EventsTabProps {
  events: Event[];
}

const EventsTab: React.FC<EventsTabProps> = ({ events }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [events]);

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "live":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
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
            key={event.id}
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
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
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

              <h3 className="mb-3 text-lg font-bold transition-colors sm:text-xl group-hover:text-blue-400">
                {event.title}
              </h3>

              <div className="space-y-2 text-xs sm:text-sm sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{event.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[100px] sm:max-w-none">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      {event.participants}/{event.maxParticipants}
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
                    {event.prizePool}
                  </div>
                </div>
              </div>

              <button className="flex items-center justify-center w-full gap-2 py-2.5 sm:py-3 mt-4 text-sm font-medium text-blue-400 transition-all duration-200 border sm:text-base bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-500/20 rounded-xl group/btn">
                View Details
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AboutTabProps {
  organizer: OrganizerProfileProps["organizer"];
}

const AboutTab: React.FC<AboutTabProps> = ({ organizer }) => {
  if (!organizer) return null;
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
              value: organizer.stats.totalEvents,
              label: "Total Events",
              color: "text-yellow-400",
            },
            {
              icon: (
                <Users className="w-6 h-6 mx-auto mb-1 text-blue-400 sm:w-8 sm:h-8 sm:mb-2" />
              ),
              value: organizer.stats.totalParticipants.toLocaleString(),
              label: "Participants",
              color: "text-blue-400",
            },
            {
              icon: (
                <Star className="w-6 h-6 mx-auto mb-1 text-purple-400 fill-current sm:w-8 sm:h-8 sm:mb-2" />
              ),
              value: organizer.stats.rating,
              label: "Avg Rating",
              color: "text-purple-400",
            },
            {
              icon: (
                <Award className="w-6 h-6 mx-auto mb-1 text-green-400 sm:w-8 sm:h-8 sm:mb-2" />
              ),
              value: organizer.stats.reviewsCount,
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
          {organizer.bio}
        </p>
        <div className="space-y-3 text-sm sm:text-base sm:space-y-4">
          {[
            {
              icon: <MapPin className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />,
              text: `Based in ${organizer.location}`,
            },
            {
              icon: (
                <Calendar className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
              ),
              text: `Organizing since ${organizer.stats.joinedDate}`,
            },
            organizer.verified && {
              icon: <Award className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />,
              text: "Verified organizer",
            },
          ]
            .filter(Boolean)
            .map(
              (item, index) =>
                item && ( // Filter out undefined (for conditional verified item)
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

interface ReviewsTabProps {
  organizer: OrganizerProfileProps["organizer"];
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ organizer }) => {
  if (!organizer) return null;
  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-8 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl">
        <h3 className="mb-6 text-2xl font-bold">Reviews & Ratings</h3>
        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-yellow-400">
              {organizer.stats.rating}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">
              {organizer.stats.reviewsCount} reviews
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-4 text-sm text-gray-400">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 h-2 bg-gray-800 rounded-full">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{
                      width: `${rating === 5 ? 80 : rating === 4 ? 15 : 5}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-sm text-gray-400">
                  {rating === 5 ? "80%" : rating === 4 ? "15%" : "5%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`https://images.unsplash.com/photo-${
                  1500000000000 + i
                }?w=40&h=40&fit=crop&crop=face`}
                alt="Reviewer"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">Player{i}</div>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-sm text-gray-400">2 days ago</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300">
              Amazing tournament organization! Everything ran smoothly and the
              prizes were distributed quickly. Definitely participating in
              future events.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerProfile;
