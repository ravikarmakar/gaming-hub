import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoadingSpinner from "@/components/LoadingSpinner";

import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { useEventStore } from "@/features/events/store/useEventStore";
import { OrganizerProfileHeader } from "../components/profile/OrganizerProfileHeader";
import { OrganizerEventsTab } from "../components/profile/OrganizerEventsTab";
import { OrganizerAboutTab } from "../components/profile/OrganizerAboutTab";
import { ProfileBannerLayout } from "@/components/shared/ProfileBannerLayout";

const OrganizerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("events");

  const { currentOrg, getOrgById, isLoading: isOrgLoading } = useOrganizerStore();
  const { orgEvents, fetchEventsByOrgId, isLoading: isEventsLoading } = useEventStore();

  useEffect(() => {
    if (id) {
      getOrgById(id);
      fetchEventsByOrgId(id);
    }
  }, [id, getOrgById, fetchEventsByOrgId]);

  // Mock stats - in a real app these would come from the backend or be calculated
  const stats = useMemo(() => ({
    totalEvents: orgEvents?.length || 0,
    totalParticipants: orgEvents?.reduce((acc, event) => acc + (event.slots || 0), 0) || 0, // Using slots as proxy for participants for now
    rating: 4.9,
    reviewsCount: 234,
    joinedDate: currentOrg?.createdAt ? new Date(currentOrg.createdAt).toLocaleDateString() : "Recently",
    followers: 12500,
    following: 890,
  }), [orgEvents, currentOrg]);

  const tabItems = useMemo(() => {
    if (!currentOrg) return [];

    return [
      {
        id: "events",
        label: "Events",
        content: <OrganizerEventsTab events={orgEvents || []} />,
      },
      {
        id: "about",
        label: "About",
        content: <OrganizerAboutTab organizer={currentOrg} stats={stats} />,
      },
      {
        id: "reviews",
        label: "Reviews",
        content: <ReviewsTab />, // Keeping ReviewsTab internal or stubbed for now
      },
    ];
  }, [currentOrg, orgEvents, stats]);

  if (isOrgLoading || isEventsLoading || !currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProfileBannerLayout>
      <OrganizerProfileHeader organizer={currentOrg} stats={stats} />

      {/* Navigation Tabs */}
      <div className="relative z-10 mb-6 sm:mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-2 overflow-x-auto border-b border-white/10">
            <TabsList className="h-auto p-0 bg-transparent gap-6">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-0 py-3 text-base bg-transparent border-b-2 border-transparent rounded-none shadow-none text-gray-400 hover:text-gray-300 data-[state=active]:border-purple-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          <div className="py-8">
            {tabItems.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:ring-0">
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </ProfileBannerLayout>
  );
};

// Placeholder Reviews Tab Component
const ReviewsTab = () => {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-8 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl">
        <h3 className="mb-6 text-2xl font-bold">Reviews & Ratings</h3>
        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-yellow-400">
              4.9
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
              234 reviews
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
                src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face`}
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
