import React from "react";
import useAuthStore from "@/store/useAuthStore";
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ExternalLink,
  PlusCircle,
  Eye,
  Heart,
  Gamepad2,
  ListOrdered,
  Loader2,
  BarChart, // For loading spinner
} from "lucide-react";

// Mock Data (replace with actual data fetching in a real application)
const mockDashboardData = {
  totalEvents: 142,
  upcomingEvents: 12,
  totalParticipants: 8420,
  totalPrizeMoney: 250000,
  recentEvents: [
    {
      id: "event1",
      title: "Championship Series Finals",
      game: "Counter-Strike 2",
      date: "2025-06-15",
      time: "18:00",
      status: "Upcoming",
      participants: 64,
      maxParticipants: 64,
      prizePool: "$25,000",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
      views: 1250,
      likes: 89,
    },
    {
      id: "event2",
      title: "Weekly Valorant Showdown",
      game: "Valorant",
      date: "2025-06-08",
      time: "20:00",
      status: "Live",
      participants: 32,
      maxParticipants: 32,
      prizePool: "$5,000",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop",
      views: 892,
      likes: 67,
    },
    {
      id: "event3",
      title: "Rocket League Masters",
      game: "Rocket League",
      date: "2025-05-28",
      time: "16:00",
      status: "Completed",
      participants: 48,
      maxParticipants: 48,
      prizePool: "$15,000",
      image:
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=200&fit=crop",
      views: 2180,
      likes: 156,
    },
  ],
  quickActions: [
    {
      label: "Create New Event",
      icon: PlusCircle,
      link: "/organizer/events/new",
    },
    { label: "Manage Participants", icon: Users, link: "/organizer/users" },
    { label: "View Analytics", icon: BarChart, link: "/organizer/analytics" },
    { label: "All Events", icon: Calendar, link: "/organizer/events" },
  ],
  recentActivities: [
    {
      type: "Event Created",
      description: "Created 'Apex Legends Battle Royale'",
      time: "2 hours ago",
    },
    {
      type: "Participant Joined",
      description: "'GamerTag123' joined 'Weekly Valorant Showdown'",
      time: "5 hours ago",
    },
    {
      type: "Prize Paid",
      description: "Paid out $15,000 for 'Rocket League Masters'",
      time: "1 day ago",
    },
    {
      type: "Event Updated",
      description: "Updated details for 'Championship Series Finals'",
      time: "2 days ago",
    },
  ],
};

const Dashboard = () => {
  const { user } = useAuthStore();
  // In a real app, you'd fetch this data from an API
  const [dashboardData, setDashboardData] = React.useState(mockDashboardData);
  const [loading, setLoading] = React.useState(false); // Example loading state

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="ml-3 text-lg text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="p-6 shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl">
        <h1 className="mb-2 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
          Welcome, {user?.name || "Organizer"}!
        </h1>
        <p className="text-lg text-gray-300">
          Here's a quick overview of your esports activities.
        </p>
      </div>

      {/* --- */}

      {/* Stats Cards */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-200">Your Metrics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Trophy}
            title="Total Events"
            value={dashboardData.totalEvents.toLocaleString()}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
          />
          <StatCard
            icon={Calendar}
            title="Upcoming Events"
            value={dashboardData.upcomingEvents.toLocaleString()}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            icon={Users}
            title="Total Participants"
            value={dashboardData.totalParticipants.toLocaleString()}
            color="text-green-400"
            bgColor="bg-green-500/10"
          />
          <StatCard
            icon={DollarSign}
            title="Total Prize Money"
            value={`$${dashboardData.totalPrizeMoney.toLocaleString()}`}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
          />
        </div>
      </div>

      {/* --- */}

      {/* Recent Events & Quick Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Events */}
        <div className="p-6 bg-gray-900 border border-gray-800 shadow-lg lg:col-span-2 rounded-xl">
          <h2 className="flex items-center gap-3 mb-5 text-2xl font-bold text-gray-200">
            <ListOrdered className="text-blue-400" /> Recent Events
          </h2>
          <div className="space-y-6">
            {dashboardData.recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col items-start gap-4 p-4 transition-colors duration-200 bg-gray-800 border border-gray-700 rounded-lg sm:flex-row sm:items-center group hover:border-blue-600"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="flex-shrink-0 object-cover w-full h-24 rounded-md sm:w-24"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://placehold.co/100x100/1F2937/4B5563?text=Event")
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
                      {event.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status === "Live" && (
                        <span className="inline-block w-1.5 h-1.5 mr-1 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {event.status}
                    </span>
                  </div>
                  <p className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                    <Gamepad2 size={16} /> {event.game}
                    <span className="mx-2">•</span>
                    <Calendar size={16} />{" "}
                    {new Date(event.date).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    <Clock size={16} /> {event.time}
                  </p>
                  <div className="flex flex-wrap items-center mt-2 text-sm text-gray-400 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1">
                      <Users size={16} /> {event.participants}/
                      {event.maxParticipants}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} /> {event.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} /> {event.likes}
                    </div>
                    <div className="ml-auto font-bold text-green-400">
                      {event.prizePool}
                    </div>
                  </div>
                </div>
                <a
                  href={`/organizer/events/${event.id}`}
                  className="flex items-center flex-shrink-0 gap-1 ml-0 text-blue-400 hover:text-blue-300 sm:ml-auto"
                >
                  View <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activities */}
        <div className="flex flex-col gap-8">
          {/* Quick Actions */}
          <div className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-xl">
            <h2 className="flex items-center gap-3 mb-5 text-2xl font-bold text-gray-200">
              <PlusCircle className="text-green-400" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {dashboardData.quickActions.map((action) => (
                <a
                  key={action.link}
                  href={action.link}
                  className="flex flex-col items-center justify-center p-4 transition-all bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-blue-600 group"
                >
                  <action.icon className="w-8 h-8 mb-2 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-sm font-medium text-center text-gray-200">
                    {action.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="flex-1 p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-xl">
            <h2 className="flex items-center gap-3 mb-5 text-2xl font-bold text-gray-200">
              <TrendingUp className="text-purple-400" /> Recent Activities
            </h2>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {activity.type}:{" "}
                      <span className="text-gray-400">
                        {activity.description}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Reusable StatCard Component
interface StatCardProps {
  icon: React.ElementType; // For Lucide icons
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  color,
  bgColor,
}) => {
  return (
    <div
      className={`p-6 ${bgColor} border border-gray-700 rounded-xl shadow-md flex items-center gap-4`}
    >
      <div
        className={`p-3 rounded-full ${bgColor} bg-opacity-70 border border-gray-600`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};
